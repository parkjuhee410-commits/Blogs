import Link from "next/link";

import type { Tag } from "@/db/schema";

export function TagBadges({ tags }: { tags: Tag[] }) {
  if (tags.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {tags.map((tag) => (
        <Link
          key={tag.id}
          href={`/tags/${tag.slug}`}
          className="neo-border neo-interactive bg-(--color-surface) px-2 py-0.5 text-xs font-bold"
        >
          #{tag.name}
        </Link>
      ))}
    </div>
  );
}
