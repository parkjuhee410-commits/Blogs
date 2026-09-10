import { NextResponse } from "next/server";

import { listSeries } from "@/lib/services/series";

export const revalidate = 60;

export async function GET() {
  const series = await listSeries();
  return NextResponse.json({ series });
}
