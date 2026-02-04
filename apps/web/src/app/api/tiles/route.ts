import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json(
    { error: "Tiles endpoint not implemented yet." },
    { status: 501 }
  );
}
