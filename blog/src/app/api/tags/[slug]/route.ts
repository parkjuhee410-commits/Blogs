import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getPublishedPostsByTagSlug, getTagBySlug } from "@/lib/services/tags";
import { isPostType } from "@/lib/taxonomy";

export const revalidate = 60;

type Params = { params: Promise<{ slug: string }> };

export async function GET(request: NextRequest, { params }: Params) {
  const { slug } = await params;

  const tag = await getTagBySlug(slug);
  if (!tag) {
    return NextResponse.json({ error: "태그를 찾을 수 없습니다." }, { status: 404 });
  }

  const typeParam = request.nextUrl.searchParams.get("type");
  if (typeParam && !isPostType(typeParam)) {
    return NextResponse.json(
      { error: "유효하지 않은 type입니다." },
      { status: 400 },
    );
  }

  const posts = await getPublishedPostsByTagSlug(
    slug,
    typeParam && isPostType(typeParam) ? typeParam : undefined,
  );

  return NextResponse.json({ tag, posts });
}
