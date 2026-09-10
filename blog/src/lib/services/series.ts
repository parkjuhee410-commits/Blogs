import "server-only";

import { and, asc, count, eq, sql } from "drizzle-orm";

import { db } from "@/db";
import { type Post, type Series, posts, series } from "@/db/schema";
import { slugify } from "@/lib/utils";

export type SeriesWithCount = Series & { postCount: number };

export async function listSeries(): Promise<SeriesWithCount[]> {
  const rows = await db
    .select({ series, postCount: count(posts.id) })
    .from(series)
    .leftJoin(
      posts,
      and(eq(posts.seriesId, series.id), eq(posts.published, true)),
    )
    .groupBy(series.id)
    .orderBy(series.title);

  return rows.map((row) => ({ ...row.series, postCount: row.postCount }));
}

export async function getSeriesBySlug(slug: string): Promise<Series | null> {
  const [row] = await db
    .select()
    .from(series)
    .where(eq(series.slug, slug))
    .limit(1);
  return row ?? null;
}

export async function getSeriesById(id: number): Promise<Series | null> {
  const [row] = await db.select().from(series).where(eq(series.id, id)).limit(1);
  return row ?? null;
}

export async function getPublishedEpisodes(seriesId: number): Promise<Post[]> {
  return db
    .select()
    .from(posts)
    .where(and(eq(posts.seriesId, seriesId), eq(posts.published, true)))
    .orderBy(sql`${posts.seriesOrder} asc nulls last`, asc(posts.publishedAt));
}

export async function getSeriesWithEpisodes(
  slug: string,
): Promise<{ series: Series; episodes: Post[] } | null> {
  const found = await getSeriesBySlug(slug);
  if (!found) return null;

  const episodes = await getPublishedEpisodes(found.id);
  return { series: found, episodes };
}

export async function getAdjacentEpisodes(post: Post) {
  if (!post.seriesId) return { prev: null, next: null };

  const episodes = await getPublishedEpisodes(post.seriesId);
  const index = episodes.findIndex((episode) => episode.id === post.id);
  if (index === -1) return { prev: null, next: null };

  return {
    prev: episodes[index - 1] ?? null,
    next: episodes[index + 1] ?? null,
  };
}

export async function listAllSeriesForAdmin(): Promise<Series[]> {
  return db.select().from(series).orderBy(series.title);
}

export async function upsertSeriesByTitle(title: string): Promise<Series> {
  const [row] = await db
    .insert(series)
    .values({ title, slug: slugify(title) })
    .onConflictDoUpdate({
      target: series.slug,
      set: { title: sql`excluded.title`, updatedAt: new Date() },
    })
    .returning();
  return row;
}
