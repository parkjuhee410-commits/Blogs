import "server-only";

import { and, count, desc, eq, inArray, sql } from "drizzle-orm";

import { db } from "@/db";
import { type Tag, postTags, posts, tags } from "@/db/schema";
import type { PostType } from "@/lib/taxonomy";
import { slugify } from "@/lib/utils";

export type TagWithCount = Tag & { postCount: number };

export async function listTags(): Promise<TagWithCount[]> {
  const rows = await db
    .select({ tag: tags, postCount: count(posts.id) })
    .from(tags)
    .leftJoin(postTags, eq(postTags.tagId, tags.id))
    .leftJoin(
      posts,
      and(eq(posts.id, postTags.postId), eq(posts.published, true)),
    )
    .groupBy(tags.id)
    .orderBy(desc(count(posts.id)), tags.name);

  return rows.map(({ tag, postCount }) => ({ ...tag, postCount }));
}

export async function getTagBySlug(slug: string): Promise<Tag | null> {
  const [tag] = await db.select().from(tags).where(eq(tags.slug, slug)).limit(1);
  return tag ?? null;
}

export async function getPublishedPostsByTagSlug(
  slug: string,
  type?: PostType,
) {
  const conditions = [eq(tags.slug, slug), eq(posts.published, true)];
  if (type) conditions.push(eq(posts.type, type));

  return db
    .select({ post: posts })
    .from(posts)
    .innerJoin(postTags, eq(postTags.postId, posts.id))
    .innerJoin(tags, eq(tags.id, postTags.tagId))
    .where(and(...conditions))
    .orderBy(desc(posts.publishedAt))
    .then((rows) => rows.map((row) => row.post));
}

export async function getTagsForPost(postId: number): Promise<Tag[]> {
  const rows = await db
    .select({ tag: tags })
    .from(tags)
    .innerJoin(postTags, eq(postTags.tagId, tags.id))
    .where(eq(postTags.postId, postId))
    .orderBy(tags.name);

  return rows.map((row) => row.tag);
}

export async function getTagsForPosts(
  postIds: number[],
): Promise<Map<number, Tag[]>> {
  const map = new Map<number, Tag[]>();
  if (postIds.length === 0) return map;

  const rows = await db
    .select({ postId: postTags.postId, tag: tags })
    .from(postTags)
    .innerJoin(tags, eq(tags.id, postTags.tagId))
    .where(inArray(postTags.postId, postIds))
    .orderBy(tags.name);

  for (const row of rows) {
    const list = map.get(row.postId) ?? [];
    list.push(row.tag);
    map.set(row.postId, list);
  }
  return map;
}

async function upsertTagsByNames(names: string[]): Promise<Tag[]> {
  const uniqueNames = Array.from(
    new Set(names.map((name) => name.trim()).filter(Boolean)),
  );
  if (uniqueNames.length === 0) return [];

  const values = uniqueNames.map((name) => ({ name, slug: slugify(name) }));

  return db
    .insert(tags)
    .values(values)
    .onConflictDoUpdate({
      target: tags.slug,
      set: { name: sql`excluded.name` },
    })
    .returning();
}

export async function syncPostTagsByNames(postId: number, names: string[]) {
  const tagRows = await upsertTagsByNames(names);

  await db.delete(postTags).where(eq(postTags.postId, postId));
  if (tagRows.length === 0) return;

  await db
    .insert(postTags)
    .values(tagRows.map((tag) => ({ postId, tagId: tag.id })));
}
