import Link from "next/link";

import type { Post } from "@/db/schema";
import { PostCard } from "@/components/post-card";
import {
  CATEGORIES,
  categoryMeta,
  type Category,
  postTypeMeta,
  type PostType,
} from "@/lib/taxonomy";

export function TypeListing({
  type,
  posts,
  activeCategory,
}: {
  type: PostType;
  posts: Post[];
  activeCategory?: Category;
}) {
  const meta = postTypeMeta[type];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black sm:text-4xl">{meta.label}</h1>
        <p className="mt-1 text-(--color-muted)">{meta.description}</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <Link
          href={`/${meta.path}`}
          className={`neo-border neo-interactive px-3 py-1 text-sm font-bold ${
            activeCategory ? "bg-(--color-surface)" : "bg-(--color-accent)"
          }`}
        >
          전체
        </Link>
        {CATEGORIES.map((category) => (
          <Link
            key={category}
            href={`/${meta.path}?category=${category}`}
            className={`neo-border neo-interactive px-3 py-1 text-sm font-bold ${
              activeCategory === category
                ? "bg-(--color-accent)"
                : "bg-(--color-surface)"
            }`}
          >
            {categoryMeta[category].label}
          </Link>
        ))}
      </div>

      {posts.length === 0 ? (
        <p className="text-(--color-muted)">아직 게시된 글이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {posts.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
