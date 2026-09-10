import "server-only";

import type { Post } from "@/db/schema";
import {
  getLatestPostsByType,
  getPostBySlugAndType,
  getPublishedPostsByType,
} from "@/lib/posts";
import type { Category } from "@/lib/taxonomy";

const TYPE = "faq" as const;

export type Faq = {
  id: number;
  slug: string;
  category: Category;
  question: string;
  answer: string;
  publishedAt: Post["publishedAt"];
};

function toFaq(post: Post): Faq {
  return {
    id: post.id,
    slug: post.slug,
    category: post.category,
    question: post.title,
    answer: post.content,
    publishedAt: post.publishedAt,
  };
}

export async function getFaqs(category?: Category): Promise<Faq[]> {
  const posts = await getPublishedPostsByType(TYPE, category);
  return posts.map(toFaq);
}

export async function getLatestFaqs(limit: number): Promise<Faq[]> {
  const posts = await getLatestPostsByType(TYPE, limit);
  return posts.map(toFaq);
}

export async function getFaqBySlug(slug: string): Promise<Faq | null> {
  const post = await getPostBySlugAndType(slug, TYPE);
  return post ? toFaq(post) : null;
}
