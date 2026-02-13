import { jsonError } from "@/lib/api/response";
import { supabaseServer } from "@/lib/supabase/server";

function parseIntParam(value: string | null) {
  if (!value) return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return Math.trunc(parsed);
}

function tileToLon(x: number, z: number) {
  return (x / Math.pow(2, z)) * 360 - 180;
}

function tileToLat(y: number, z: number) {
  const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  return (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  const z = parseIntParam(url.searchParams.get("z"));
  const x = parseIntParam(url.searchParams.get("x"));
  const y = parseIntParam(url.searchParams.get("y"));
  if (z == null || x == null || y == null) {
    return jsonError(422, "invalid_tile", "z, x, y are required integers.");
  }

  const timeParam = url.searchParams.get("time");
  const time = timeParam ? new Date(timeParam) : new Date();
  if (Number.isNaN(time.getTime())) {
    return jsonError(422, "invalid_time", "time must be a valid ISO timestamp.");
  }

  const rawWindowMinutes = parseIntParam(url.searchParams.get("rawWindowMinutes")) ?? 10;
  if (rawWindowMinutes <= 0) {
    return jsonError(
      422,
      "invalid_window",
      "rawWindowMinutes must be a positive integer."
    );
  }

  const west = tileToLon(x, z);
  const east = tileToLon(x + 1, z);
  const north = tileToLat(y, z);
  const south = tileToLat(y + 1, z);

  let supabase;
  try {
    supabase = supabaseServer();
  } catch {
    return jsonError(500, "supabase_client_error", "Failed to init Supabase client.");
  }

  const { data: tile, error: tileErr } = await supabase.rpc("get_risk_tile", {
    layer: "ais_raw",
    t_target: time.toISOString(),
    horizon_minutes_in: 60,
    bin_minutes_in: 60,
    west,
    south,
    east,
    north,
    run_id_in: null,
    raw_window_minutes_in: rawWindowMinutes,
  });

  if (tileErr) {
    return jsonError(502, "supabase_query_error", "Failed to build tile.", {
      code: tileErr.code,
      details: tileErr.details,
      hint: tileErr.hint,
    });
  }

  return new Response(JSON.stringify(tile ?? { type: "FeatureCollection", features: [] }), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}
