import Link from "next/link";

import type { Post } from "@/db/schema";
import { formatDateKo } from "@/lib/utils";

const ACCENTS = [
  "bg-(--color-accent)",
  "bg-(--color-mint)",
  "bg-(--color-coral)",
  "bg-(--color-violet)",
];

export function PostCard({ post, index = 0 }: { post: Post; index?: number }) {
  const accent = ACCENTS[index % ACCENTS.length];

  return (
    <Link href={`/blog/${post.slug}`} className="block">
      <article className="neo-card neo-interactive flex flex-col gap-3 p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          {post.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className={`neo-border px-2 py-0.5 text-xs font-bold ${accent}`}
            >
              #{tag}
            </span>
          ))}
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
      </article>
    </Link>
  );
}
