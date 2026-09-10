import Link from "next/link";

import { TagBadges } from "@/components/tag-badges";
import type { Post, Tag } from "@/db/schema";
import { categoryMeta, postPath, postTypeMeta } from "@/lib/taxonomy";
import { formatDateKo } from "@/lib/utils";

const ACCENTS = [
  "bg-(--color-accent)",
  "bg-(--color-mint)",
  "bg-(--color-coral)",
  "bg-(--color-violet)",
];

export function PostCard({
  post,
  index = 0,
  tags = [],
}: {
  post: Post;
  index?: number;
  tags?: Tag[];
}) {
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <article className="neo-card neo-interactive flex flex-col gap-3 p-5 sm:p-6">
      <Link href={postPath(post)} className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`neo-border px-2 py-0.5 text-xs font-bold ${accent}`}>
            {postTypeMeta[post.type].label}
          </span>
          <span className="neo-border bg-(--color-surface) px-2 py-0.5 text-xs font-bold">
            {categoryMeta[post.category].label}
          </span>
        </div>
        <h2 className="text-xl font-extrabold leading-snug sm:text-2xl">
          {post.title}
        </h2>
        <p className="text-(--color-muted) line-clamp-2">{post.description}</p>
        <time
          dateTime={post.publishedAt?.toISOString()}
          className="text-xs font-bold text-(--color-muted)"
        >
          {formatDateKo(post.publishedAt)}
        </time>
      </Link>
      {tags.length > 0 && <TagBadges tags={tags} />}
    </article>
  );
}
