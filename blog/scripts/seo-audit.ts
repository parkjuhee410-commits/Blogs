/**
 * DB의 모든 게시글을 훑어 SEO 관점에서 손볼 곳이 있는지 보고한다 (읽기 전용,
 * 아무것도 수정하지 않는다). lib/posts.ts는 "server-only"라 이 스크립트에서
 * 바로 import할 수 없어 db/schema를 직접 사용한다.
 */
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

import { desc, eq } from "drizzle-orm";

import { db } from "../src/db";
import { postTags, posts, tags } from "../src/db/schema";
import { isValidSlug } from "../src/lib/utils";

const TITLE_SOFT_LIMIT = 60; // 검색 결과 노출 기준 권장치 (DB 제한은 200)
const DESCRIPTION_SOFT_MIN = 70;
const DESCRIPTION_SOFT_MAX = 155; // 검색 결과 노출 기준 권장치 (DB 제한은 300)

async function main() {
  const allPosts = await db.select().from(posts).orderBy(desc(posts.publishedAt));

  const report = [];

  for (const post of allPosts) {
    const issues: string[] = [];
    const effectiveTitle = post.metaTitle || post.title;
    const effectiveDescription = post.metaDescription || post.description;

    if (effectiveTitle.length > TITLE_SOFT_LIMIT) {
      issues.push(
        `SEO 제목이 ${effectiveTitle.length}자입니다 (권장 ${TITLE_SOFT_LIMIT}자 이하). metaTitle로 줄여보세요.`,
      );
    }
    if (effectiveDescription.length < DESCRIPTION_SOFT_MIN) {
      issues.push(
        `SEO 설명이 ${effectiveDescription.length}자로 너무 짧습니다 (권장 ${DESCRIPTION_SOFT_MIN}~${DESCRIPTION_SOFT_MAX}자).`,
      );
    } else if (effectiveDescription.length > DESCRIPTION_SOFT_MAX) {
      issues.push(
        `SEO 설명이 ${effectiveDescription.length}자로 깁니다 (권장 ${DESCRIPTION_SOFT_MIN}~${DESCRIPTION_SOFT_MAX}자). metaDescription으로 요약하세요.`,
      );
    }
    if (!isValidSlug(post.slug)) {
      issues.push(`슬러그 "${post.slug}"가 URL 규칙(영문 소문자/숫자/하이픈)에 맞지 않습니다.`);
    }
    if (post.published && !post.coverImageUrl) {
      issues.push("커버 이미지가 없어 소셜 공유 시 자동 생성 OG 이미지만 사용됩니다 (문제는 아니지만 참고).");
    }

    const postTagRows = await db
      .select({ tag: tags })
      .from(postTags)
      .innerJoin(tags, eq(tags.id, postTags.tagId))
      .where(eq(postTags.postId, post.id));

    if (post.published && postTagRows.length === 0) {
      issues.push("태그가 하나도 없습니다. 관련 태그를 추가하면 /tags 페이지 노출에 도움이 됩니다.");
    }

    if (issues.length > 0) {
      report.push({
        id: post.id,
        slug: post.slug,
        type: post.type,
        category: post.category,
        published: post.published,
        title: post.title,
        issues,
      });
    }
  }

  console.log(
    JSON.stringify(
      {
        totalPosts: allPosts.length,
        postsWithIssues: report.length,
        report,
      },
      null,
      2,
    ),
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
