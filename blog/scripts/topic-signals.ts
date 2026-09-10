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
  isPostType,
  POST_TYPES,
  postTypeMeta,
} from "../src/lib/taxonomy";
import {
  fetchTopOrganicLandingPages,
  fetchTopPagesByViews,
  hasGa4Config,
} from "./ga4-client";

/** "/insight/nextjs-caching" 같은 GA4 경로를 우리 posts 테이블과 매칭한다. */
function matchPostByPath(
  path: string,
  allPosts: (typeof posts.$inferSelect)[],
) {
  const [, type, slug] = path.split("?")[0].split("/");
  if (!type || !slug || !isPostType(type)) return null;
  return (
    allPosts.find((post) => post.type === type && post.slug === slug) ?? null
  );
}

async function collectGa4Signals(allPosts: (typeof posts.$inferSelect)[]) {
  if (!hasGa4Config()) {
    return {
      available: false as const,
      reason:
        "GA4_PROPERTY_ID/GA4_CLIENT_EMAIL/GA4_PRIVATE_KEY 환경변수가 설정되지 않았습니다. GA4 연동 없이도 아래 온사이트 데이터만으로 진행할 수 있습니다.",
    };
  }

  try {
    const [topPages, topOrganicLandingPages] = await Promise.all([
      fetchTopPagesByViews(28, 15),
      fetchTopOrganicLandingPages(28, 15),
    ]);

    const enrich = (path: string) => {
      const post = matchPostByPath(path, allPosts);
      return post
        ? {
            title: post.title,
            type: post.type,
            category: post.category,
          }
        : null;
    };

    return {
      available: true as const,
      windowDays: 28,
      topPagesByViews: topPages.map((page) => ({
        ...page,
        post: enrich(page.path),
      })),
      topOrganicLandingPages: topOrganicLandingPages.map((page) => ({
        ...page,
        post: enrich(page.path),
      })),
    };
  } catch (error) {
    return {
      available: false as const,
      reason: `GA4 조회 실패: ${error instanceof Error ? error.message : error}`,
    };
  }
}

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

  const ga4 = await collectGa4Signals(allPosts);

  const report = {
    totalPosts: allPosts.length,
    publishedPosts: allPosts.filter((post) => post.published).length,
    coverageGaps,
    topByViews,
    underusedTags,
    openSeries,
    ga4,
  };

  console.log(JSON.stringify(report, null, 2));
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
