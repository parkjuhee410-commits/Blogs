import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { TypeListing } from "@/components/type-listing";
import { getPublishedPostsByType } from "@/lib/posts";
import { getTagsForPosts } from "@/lib/services/tags";
import {
  isCategory,
  isPostType,
  POST_TYPES,
  postTypeMeta,
} from "@/lib/taxonomy";

export const revalidate = 60;
export const dynamicParams = false;

type Props = {
  params: Promise<{ type: string }>;
  searchParams: Promise<{ category?: string }>;
};

export function generateStaticParams() {
  return POST_TYPES.map((type) => ({ type }));
}

export async function generateMetadata({
  params,
}: {
  params: Props["params"];
}): Promise<Metadata> {
  const { type } = await params;
  if (!isPostType(type)) return {};

  const meta = postTypeMeta[type];
  return {
    title: meta.label,
    description: meta.description,
    alternates: { canonical: `/${type}` },
  };
}

export default async function TypePage({ params, searchParams }: Props) {
  const { type } = await params;
  if (!isPostType(type)) notFound();

  const { category } = await searchParams;
  const activeCategory = category && isCategory(category) ? category : undefined;

  const posts = await getPublishedPostsByType(type, activeCategory);
  const tagsByPost = await getTagsForPosts(posts.map((post) => post.id));

  return (
    <TypeListing
      type={type}
      posts={posts}
      activeCategory={activeCategory}
      tagsByPost={tagsByPost}
    />
  );
}
