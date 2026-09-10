import "server-only";

import { and, desc, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { type NewPost, posts } from "@/db/schema";
import type { Category, PostType } from "@/lib/taxonomy";

export type PostInput = {
  slug: string;
  title: string;
  description: string;
  content: string;
  coverImageUrl?: string | null;
  type: PostType;
  category: Category;
  published: boolean;
  seriesId?: number | null;
  seriesOrder?: number | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
  noindex?: boolean;
};

export async function getPublishedPosts() {
  return db
    .select()
    .from(posts)
    .where(eq(posts.published, true))
    .orderBy(desc(posts.publishedAt));
}

export async function getPublishedPostsByType(
  type: PostType,
  category?: Category,
) {
  const condition = category
    ? and(
        eq(posts.published, true),
        eq(posts.type, type),
        eq(posts.category, category),
      )
    : and(eq(posts.published, true), eq(posts.type, type));

  return db.select().from(posts).where(condition).orderBy(desc(posts.publishedAt));
}

export async function getLatestPostsByType(type: PostType, limit: number) {
  return db
    .select()
    .from(posts)
    .where(and(eq(posts.published, true), eq(posts.type, type)))
    .orderBy(desc(posts.publishedAt))
    .limit(limit);
}

export async function getPostBySlugAndType(slug: string, type: PostType) {
  const [post] = await db
    .select()
    .from(posts)
    .where(and(eq(posts.slug, slug), eq(posts.type, type)))
    .limit(1);
  return post ?? null;
}

export async function incrementViewCount(id: number) {
  await db
    .update(posts)
    .set({ viewCount: sql`${posts.viewCount} + 1` })
    .where(eq(posts.id, id));
}

export async function getAllPostsForAdmin() {
  return db.select().from(posts).orderBy(desc(posts.createdAt));
}

export async function getPostById(id: number) {
  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);
  return post ?? null;
}

export async function createPost(input: PostInput) {
  const values: NewPost = {
    ...input,
    coverImageUrl: input.coverImageUrl || null,
    publishedAt: input.published ? new Date() : null,
  };
  const [post] = await db.insert(posts).values(values).returning();
  return post;
}

export async function updatePost(id: number, input: PostInput) {
  const existing = await getPostById(id);
  if (!existing) throw new Error("게시글을 찾을 수 없습니다.");

  const publishedAt = input.published
    ? (existing.publishedAt ?? new Date())
    : null;

  const [post] = await db
    .update(posts)
    .set({
      ...input,
      coverImageUrl: input.coverImageUrl || null,
      publishedAt,
      updatedAt: new Date(),
    })
    .where(eq(posts.id, id))
    .returning();
  return post;
}

export async function deletePost(id: number) {
  await db.delete(posts).where(eq(posts.id, id));
}

export async function isSlugTaken(slug: string, excludeId?: number) {
  const rows = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.slug, slug));
  return rows.some((row) => row.id !== excludeId);
}
