import Link from "next/link";

import { MarkdownContent } from "@/components/markdown-content";
import { TagBadges } from "@/components/tag-badges";
import type { Post, Tag } from "@/db/schema";
import { siteConfig } from "@/lib/site";
import { categoryMeta, postPath, postTypeMeta } from "@/lib/taxonomy";
import { plainTextFromMarkdown } from "@/lib/utils";

export function FaqView({ post, tags = [] }: { post: Post; tags?: Tag[] }) {
  const url = `${siteConfig.url}${postPath(post)}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: post.title,
        acceptedAnswer: {
          "@type": "Answer",
          text: plainTextFromMarkdown(post.content),
        },
      },
    ],
    url,
  };

  return (
    <article className="flex flex-col gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href={`/${postTypeMeta.faq.path}`} className="text-sm font-bold hover:underline">
        ← {postTypeMeta.faq.label} 목록
      </Link>

      <span className="neo-border w-fit bg-(--color-surface) px-2 py-0.5 text-xs font-bold">
        {categoryMeta[post.category].label}
      </span>

      <div className="neo-card p-6 sm:p-8">
        <p className="mb-2 text-sm font-black text-(--color-violet)">Q.</p>
        <h1 className="text-2xl font-black leading-snug sm:text-3xl">
          {post.title}
        </h1>
      </div>

      <div className="neo-card p-6 sm:p-8">
        <p className="mb-2 text-sm font-black text-(--color-coral)">A.</p>
        <MarkdownContent content={post.content} />
      </div>

      <TagBadges tags={tags} />
    </article>
  );
}
