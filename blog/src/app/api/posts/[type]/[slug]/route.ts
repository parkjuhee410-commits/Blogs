import { NextResponse } from "next/server";

import { getPostBySlugAndType, incrementViewCount } from "@/lib/posts";
import { isPostType } from "@/lib/taxonomy";

export const revalidate = 60;

type Params = { params: Promise<{ type: string; slug: string }> };

export async function GET(_request: Request, { params }: Params) {
  const { type, slug } = await params;

  if (!isPostType(type)) {
    return NextResponse.json(
      { error: "유효하지 않은 type입니다." },
      { status: 400 },
    );
  }

  const post = await getPostBySlugAndType(slug, type);
  if (!post || !post.published) {
    return NextResponse.json(
      { error: "게시글을 찾을 수 없습니다." },
      { status: 404 },
    );
  }

  incrementViewCount(post.id).catch(() => {});

  return NextResponse.json({ post });
}
