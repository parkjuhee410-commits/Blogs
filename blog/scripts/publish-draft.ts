/**
 * lib/posts.ts와 lib/services/*는 "server-only"로 태그되어 있어 Next.js
 * 서버 런타임 밖(이 스크립트 같은 일반 Node 프로세스)에서는 로드할 수 없다.
 * 그래서 이 스크립트는 db/schema를 직접 사용해 필요한 쓰기 로직만 다시 작성한다.
 */
import { config } from "dotenv";

config({ path: ".env.local", quiet: true });

import { readFileSync } from "node:fs";

import { eq, sql } from "drizzle-orm";
import matter from "gray-matter";

import { db } from "../src/db";
import { postTags, posts, series, tags } from "../src/db/schema";
import { isCategory, isPostType } from "../src/lib/taxonomy";
import { excerptFromMarkdown, isValidSlug, slugify } from "../src/lib/utils";

type DraftFrontmatter = {
  title?: string;
  slug?: string;
  description?: string;
  type?: string;
  category?: string;
  tags?: string[];
  seriesTitle?: string;
  seriesOrder?: number;
  coverImageUrl?: string;
  metaTitle?: string;
  metaDescription?: string;
  noindex?: boolean;
  published?: boolean;
  status?: string;
};

async function isSlugTaken(slug: string) {
  const [row] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.slug, slug))
    .limit(1);
  return Boolean(row);
}

async function upsertSeriesByTitle(title: string) {
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
  const filePath = process.argv[2];
  if (!filePath) {
    console.error("사용법: npm run content:publish -- <draft-markdown-경로>");
    process.exit(1);
  }

  const raw = readFileSync(filePath, "utf-8");
  const { data, content } = matter(raw) as unknown as {
    data: DraftFrontmatter;
    content: string;
  };

  if (!data.title) throw new Error("frontmatter에 title이 없습니다.");
  if (!content.trim()) throw new Error("본문 내용이 비어 있습니다.");
  if (!data.type || !isPostType(data.type)) {
    throw new Error(
      "frontmatter의 type이 없거나 올바르지 않습니다 (insight/faq/glossary/daily).",
    );
  }
  if (!data.category || !isCategory(data.category)) {
    throw new Error(
      "frontmatter의 category가 없거나 올바르지 않습니다 (food/ai_tech/real_estate).",
    );
  }

  const slug = data.slug?.trim() || slugify(data.title);
  if (!isValidSlug(slug)) {
    throw new Error(
      `슬러그가 올바르지 않습니다: "${slug}" (영문 소문자/숫자/하이픈만 가능)`,
    );
  }
  if (await isSlugTaken(slug)) {
    throw new Error(`이미 사용 중인 슬러그입니다: ${slug}`);
  }

  if (data.status && !["seo-ready", "ready", "reviewed"].includes(data.status)) {
    console.warn(
      `⚠️  draft status가 "${data.status}"입니다. 검수/SEO 단계를 건너뛴 채 발행하는 것은 아닌지 확인하세요.`,
    );
  }

  const seriesRow = data.seriesTitle?.trim()
    ? await upsertSeriesByTitle(data.seriesTitle.trim())
    : null;

  const [post] = await db
    .insert(posts)
    .values({
      slug,
      title: data.title,
      description: data.description?.trim() || excerptFromMarkdown(content),
      content,
      coverImageUrl: data.coverImageUrl?.trim() || null,
      type: data.type,
      category: data.category,
      published: data.published ?? false,
      seriesId: seriesRow?.id ?? null,
      seriesOrder: seriesRow ? (data.seriesOrder ?? null) : null,
      metaTitle: data.metaTitle?.trim() || null,
      metaDescription: data.metaDescription?.trim() || null,
      noindex: data.noindex ?? false,
      publishedAt: data.published ? new Date() : null,
    })
    .returning();

  await syncPostTagsByNames(post.id, data.tags ?? []);

  console.log(
    `✅ 게시글 ${post.published ? "발행" : "임시저장"} 완료: /${data.type}/${slug} (id=${post.id})`,
  );
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌", error instanceof Error ? error.message : error);
    process.exit(1);
  });
