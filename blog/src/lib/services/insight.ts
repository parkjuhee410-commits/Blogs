import "server-only";

import {
  getLatestPostsByType,
  getPostBySlugAndType,
  getPublishedPostsByType,
} from "@/lib/posts";
import type { Category } from "@/lib/taxonomy";

const TYPE = "insight" as const;

export function getInsights(category?: Category) {
  return getPublishedPostsByType(TYPE, category);
}

export function getLatestInsights(limit: number) {
  return getLatestPostsByType(TYPE, limit);
}

export function getInsightBySlug(slug: string) {
  return getPostBySlugAndType(slug, TYPE);
}
