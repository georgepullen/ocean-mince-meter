import { jsonError } from "@/lib/api/response";
import { supabaseServer } from "@/lib/supabase/server";

export async function GET() {
  let supabase;
  try {
    supabase = supabaseServer();
  } catch {
    return jsonError(500, "supabase_client_error", "Failed to init Supabase client.");
  }

  const { data, error } = await supabase
    .from("ais_raw_points")
    .select("t")
    .order("t", { ascending: false })
    .limit(1);

  if (error) {
    return jsonError(502, "supabase_query_error", "Failed to load latest AIS timestamp.", {
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
  }

  return Response.json({ ok: true, latest: data?.[0]?.t ?? null });
}
