import { NextResponse } from "next/server";

import { getSeriesWithEpisodes } from "@/lib/services/series";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { slug } = await params;

  const result = await getSeriesWithEpisodes(slug);
  if (!result) {
    return NextResponse.json(
      { error: "시리즈를 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  return NextResponse.json(result);
}
