import Link from "next/link";

import { MarkdownContent } from "@/components/markdown-content";
import type { Post } from "@/db/schema";
import { siteConfig } from "@/lib/site";
import { categoryMeta, postPath, postTypeMeta } from "@/lib/taxonomy";
import { plainTextFromMarkdown } from "@/lib/utils";

export function GlossaryView({ post }: { post: Post }) {
  const url = `${siteConfig.url}${postPath(post)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "DefinedTerm",
    name: post.title,
    description: plainTextFromMarkdown(post.content),
    inDefinedTermSet: `${siteConfig.name} 용어 사전`,
    url,
  };

  return (
    <article className="flex flex-col gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link
        href={`/${postTypeMeta.glossary.path}`}
        className="text-sm font-bold hover:underline"
      >
        ← {postTypeMeta.glossary.label} 목록
      </Link>

      <span className="neo-border w-fit bg-(--color-surface) px-2 py-0.5 text-xs font-bold">
        {categoryMeta[post.category].label}
      </span>

      <header className="neo-card bg-(--color-mint) p-6 sm:p-8">
        <p className="mb-1 text-sm font-black">용어</p>
        <h1 className="text-3xl font-black leading-tight sm:text-4xl">
          {post.title}
        </h1>
      </header>

      <MarkdownContent content={post.content} />
    </article>
  );
}
