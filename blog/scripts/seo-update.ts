/**
 * 이미 존재하는 게시글의 SEO 관련 필드(metaTitle/metaDescription/noindex/tags)만
 * 좁게 수정한다. 제목/본문/카테고리/슬러그 등은 절대 건드리지 않는다.
 * lib/posts.ts, lib/services/*는 "server-only"라 이 스크립트에서 바로
 * import할 수 없어 db/schema를 직접 사용한다.
 *
 * 사용법:
 *   npm run content:seo-update -- <postId> \
 *     --metaTitle "..." --metaDescription "..." --noindex true --tags "a,b,c"
 * (플래그는 준 것만 반영된다. --tags를 주면 태그 전체를 그 목록으로 교체한다.)
 */
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

import { eq, sql } from "drizzle-orm";

import { db } from "../src/db";
import { postTags, posts, tags } from "../src/db/schema";
import { slugify } from "../src/lib/utils";

function parseFlags(argv: string[]) {
  const flags: Record<string, string> = {};
  for (let i = 0; i < argv.length; i += 1) {
    if (argv[i].startsWith("--")) {
      const key = argv[i].slice(2);
      flags[key] = argv[i + 1];
      i += 1;
    }
  }
  return flags;
}

async function syncPostTagsByNames(postId: number, names: string[]) {
  const uniqueNames = Array.from(
    new Set(names.map((name) => name.trim()).filter(Boolean)),
  );

  await db.delete(postTags).where(eq(postTags.postId, postId));
  if (uniqueNames.length === 0) return;

  const tagRows = await db
    .insert(tags)
    .values(uniqueNames.map((name) => ({ name, slug: slugify(name) })))
    .onConflictDoUpdate({
      target: tags.slug,
      set: { name: sql`excluded.name` },
    })
    .returning();

  await db
    .insert(postTags)
    .values(tagRows.map((tag) => ({ postId, tagId: tag.id })));
}

async function main() {
  const postId = Number(process.argv[2]);
  if (!Number.isFinite(postId)) {
    console.error(
      '사용법: npm run content:seo-update -- <postId> [--metaTitle "..."] [--metaDescription "..."] [--noindex true|false] [--tags "a,b,c"]',
    );
    process.exit(1);
  }

  const flags = parseFlags(process.argv.slice(3));
  const patch: Partial<typeof posts.$inferInsert> = {};

  if ("metaTitle" in flags) patch.metaTitle = flags.metaTitle || null;
  if ("metaDescription" in flags)
    patch.metaDescription = flags.metaDescription || null;
  if ("noindex" in flags) patch.noindex = flags.noindex === "true";

  if (Object.keys(patch).length === 0 && !("tags" in flags)) {
    throw new Error("수정할 필드를 최소 하나는 지정하세요 (--metaTitle/--metaDescription/--noindex/--tags).");
  }

  if (Object.keys(patch).length > 0) {
    patch.updatedAt = new Date();
    const [updated] = await db
      .update(posts)
      .set(patch)
      .where(eq(posts.id, postId))
      .returning();
    if (!updated) throw new Error(`postId ${postId}를 찾을 수 없습니다.`);
  }

  if ("tags" in flags) {
    await syncPostTagsByNames(postId, flags.tags.split(","));
  }

  console.log(`✅ post ${postId}의 SEO 필드를 업데이트했습니다.`);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌", error instanceof Error ? error.message : error);
    process.exit(1);
  });
