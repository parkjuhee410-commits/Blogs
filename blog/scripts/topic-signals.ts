/**
 * lib/posts.ts와 lib/services/*는 "server-only"로 태그되어 있어 Next.js
 * 서버 런타임 밖(이 스크립트 같은 일반 Node 프로세스)에서는 로드할 수 없다.
 * 그래서 이 스크립트는 db/schema를 직접 사용해 필요한 조회만 다시 작성한다.
 */
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

import { and, count, desc, eq } from "drizzle-orm";

import { db } from "../src/db";
import { postTags, posts, series, tags } from "../src/db/schema";
import {
  CATEGORIES,
  categoryMeta,
  POST_TYPES,
  postTypeMeta,
} from "../src/lib/taxonomy";

async function main() {
  const allPosts = await db.select().from(posts).orderBy(desc(posts.viewCount));

  const coverage = new Map<string, number>();
  for (const type of POST_TYPES) {
    for (const category of CATEGORIES) {
      coverage.set(`${type}:${category}`, 0);
    }
  }
  for (const post of allPosts) {
    const key = `${post.type}:${post.category}`;
    coverage.set(key, (coverage.get(key) ?? 0) + 1);
  }

  const coverageGaps = Array.from(coverage.entries())
    .filter(([, postCount]) => postCount === 0)
    .map(([key]) => {
      const [type, category] = key.split(":") as [
        (typeof POST_TYPES)[number],
        (typeof CATEGORIES)[number],
      ];
      return {
        type,
        category,
        typeLabel: postTypeMeta[type].label,
        categoryLabel: categoryMeta[category].label,
      };
    });

  const topByViews = allPosts
    .filter((post) => post.published)
    .slice(0, 5)
    .map((post) => ({
      title: post.title,
      type: post.type,
      category: post.category,
      viewCount: post.viewCount,
    }));

  const tagRows = await db
    .select({ tag: tags, postCount: count(posts.id) })
    .from(tags)
    .leftJoin(postTags, eq(postTags.tagId, tags.id))
    .leftJoin(
      posts,
      and(eq(posts.id, postTags.postId), eq(posts.published, true)),
    )
    .groupBy(tags.id);

  const underusedTags = tagRows
    .filter((row) => row.postCount === 1)
    .map((row) => row.tag.name);

  const seriesRows = await db
    .select({ series, postCount: count(posts.id) })
    .from(series)
    .leftJoin(
      posts,
      and(eq(posts.seriesId, series.id), eq(posts.published, true)),
    )
    .groupBy(series.id);

  const openSeries = seriesRows
    .filter((row) => row.postCount > 0)
    .map((row) => ({ title: row.series.title, episodes: row.postCount }));

  const report = {
    totalPosts: allPosts.length,
    publishedPosts: allPosts.filter((post) => post.published).length,
    coverageGaps,
    topByViews,
    underusedTags,
    openSeries,
  };

  console.log(JSON.stringify(report, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
