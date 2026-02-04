import { NextResponse } from "next/server";
import { supabaseServer } from "@/lib/supabase/server";

type RiskRequest = {
  cellIds: string[];
  startTime: string;
  hours: number;
};

export async function POST(req: Request) {
  const body = (await req.json()) as RiskRequest;
  const { cellIds, startTime } = body;

  const supabase = supabaseServer();

  const { data: ais, error: aisErr } = await supabase
    .from("ais_intensity")
    .select("cell_id, hour, lambda")
    .in("cell_id", cellIds)
    .gte("hour", startTime)
    .limit(10000);

  if (aisErr) {
    return NextResponse.json({ error: aisErr.message }, { status: 500 });
  }

  return NextResponse.json({
    ok: true,
    shipRiskProxy: (ais ?? []).reduce((acc, r) => acc + (r.lambda ?? 0), 0),
  });
}
