import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

import { getPublishedPosts, getPublishedPostsByType } from "@/lib/posts";
import { getTagsForPosts } from "@/lib/services/tags";
import { isCategory, isPostType } from "@/lib/taxonomy";

export const revalidate = 60;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const typeParam = searchParams.get("type");
  const categoryParam = searchParams.get("category");

  if (typeParam && !isPostType(typeParam)) {
    return NextResponse.json(
      { error: "유효하지 않은 type입니다." },
      { status: 400 },
    );
  }
  if (categoryParam && !isCategory(categoryParam)) {
    return NextResponse.json(
      { error: "유효하지 않은 category입니다." },
      { status: 400 },
    );
  }

  const posts =
    typeParam && isPostType(typeParam)
      ? await getPublishedPostsByType(
          typeParam,
          categoryParam && isCategory(categoryParam) ? categoryParam : undefined,
        )
      : await getPublishedPosts();

  const tagsByPost = await getTagsForPosts(posts.map((post) => post.id));
  const postsWithTags = posts.map((post) => ({
    ...post,
    tags: tagsByPost.get(post.id) ?? [],
  }));

  return NextResponse.json({ posts: postsWithTags });
}
