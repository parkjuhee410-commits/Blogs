import type { Metadata } from "next";
import Link from "next/link";

import { listTags } from "@/lib/services/tags";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "태그",
  description: "태그별로 글을 모아봅니다.",
  alternates: { canonical: "/tags" },
};

export default async function TagsPage() {
  const tags = await listTags();
  const activeTags = tags.filter((tag) => tag.postCount > 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black sm:text-4xl">태그</h1>
        <p className="mt-1 text-(--color-muted)">태그별로 글을 모아봅니다.</p>
      </div>

      {activeTags.length === 0 ? (
        <p className="text-(--color-muted)">아직 태그가 달린 글이 없습니다.</p>
      ) : (
        <div className="flex flex-wrap gap-3">
          {activeTags.map((tag) => (
            <Link
              key={tag.id}
              href={`/tags/${tag.slug}`}
              className="neo-border neo-shadow-sm neo-interactive bg-(--color-surface) px-3 py-1.5 text-sm font-bold"
            >
              #{tag.name}
              <span className="ml-1 text-(--color-muted)">{tag.postCount}</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
