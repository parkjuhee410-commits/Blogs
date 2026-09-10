import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ArticleView } from "@/components/article-view";
import { FaqView } from "@/components/faq-view";
import { GlossaryView } from "@/components/glossary-view";
import {
  getPostBySlugAndType,
  getPublishedPostsByType,
  incrementViewCount,
} from "@/lib/posts";
import { buildPostMetadata } from "@/lib/seo";
import { isPostType, POST_TYPES } from "@/lib/taxonomy";

export const revalidate = 60;

type Props = {
  params: Promise<{ type: string; slug: string }>;
};

export async function generateStaticParams() {
  const params: { type: string; slug: string }[] = [];
  for (const type of POST_TYPES) {
    const posts = await getPublishedPostsByType(type);
    for (const post of posts) params.push({ type, slug: post.slug });
  }
  return params;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { type, slug } = await params;
  if (!isPostType(type)) return {};

  const post = await getPostBySlugAndType(slug, type);
  if (!post || !post.published) return {};

  return buildPostMetadata(post);
}

export default async function PostDetailPage({ params }: Props) {
  const { type, slug } = await params;
  if (!isPostType(type)) notFound();

  const post = await getPostBySlugAndType(slug, type);
  if (!post || !post.published) notFound();

  incrementViewCount(post.id).catch(() => {});

  if (type === "faq") return <FaqView post={post} />;
  if (type === "glossary") return <GlossaryView post={post} />;
  return <ArticleView post={post} />;
}
