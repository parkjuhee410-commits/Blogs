import Link from "next/link";

import { MarkdownContent } from "@/components/markdown-content";
import type { Post } from "@/db/schema";
import { siteConfig } from "@/lib/site";
import { categoryMeta, postPath, postTypeMeta } from "@/lib/taxonomy";
import { formatDateKo, readingTimeMinutes } from "@/lib/utils";

export function ArticleView({ post }: { post: Post }) {
  const url = `${siteConfig.url}${postPath(post)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    image: post.coverImageUrl ?? undefined,
    articleSection: categoryMeta[post.category].label,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Person", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
  };

  return (
    <article className="flex flex-col gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href={`/${postTypeMeta[post.type].path}`} className="text-sm font-bold hover:underline">
        ← {postTypeMeta[post.type].label} 목록
      </Link>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          <span className="neo-border bg-(--color-accent) px-2 py-0.5 text-xs font-bold">
            {postTypeMeta[post.type].label}
          </span>
          <span className="neo-border bg-(--color-surface) px-2 py-0.5 text-xs font-bold">
            {categoryMeta[post.category].label}
          </span>
        </div>
        <h1 className="text-3xl font-black leading-tight sm:text-4xl">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-(--color-muted)">
          <time dateTime={post.publishedAt?.toISOString()}>
            {formatDateKo(post.publishedAt)}
          </time>
          <span>· {readingTimeMinutes(post.content)}분 소요</span>
          <span>· 조회 {post.viewCount + 1}</span>
        </div>
      </header>

      {post.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="neo-border neo-shadow w-full object-cover"
        />
      )}

      <MarkdownContent content={post.content} />
    </article>
  );
}
