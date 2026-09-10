import "server-only";

import type { Post } from "@/db/schema";
import {
  getLatestPostsByType,
  getPostBySlugAndType,
  getPublishedPostsByType,
} from "@/lib/posts";
import type { Category } from "@/lib/taxonomy";

const TYPE = "glossary" as const;

export type GlossaryEntry = {
  id: number;
  slug: string;
  category: Category;
  term: string;
  definition: string;
  publishedAt: Post["publishedAt"];
};

function toGlossaryEntry(post: Post): GlossaryEntry {
  return {
    id: post.id,
    slug: post.slug,
    category: post.category,
    term: post.title,
    definition: post.content,
    publishedAt: post.publishedAt,
  };
}

export async function getGlossaryEntries(
  category?: Category,
): Promise<GlossaryEntry[]> {
  const posts = await getPublishedPostsByType(TYPE, category);
  return posts.map(toGlossaryEntry);
}

export async function getLatestGlossaryEntries(
  limit: number,
): Promise<GlossaryEntry[]> {
  const posts = await getLatestPostsByType(TYPE, limit);
  return posts.map(toGlossaryEntry);
}

export async function getGlossaryEntryBySlug(
  slug: string,
): Promise<GlossaryEntry | null> {
  const post = await getPostBySlugAndType(slug, TYPE);
  return post ? toGlossaryEntry(post) : null;
}
