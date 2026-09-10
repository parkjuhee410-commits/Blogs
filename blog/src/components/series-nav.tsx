import Link from "next/link";

import type { Post, Series } from "@/db/schema";
import { postPath } from "@/lib/taxonomy";

export function SeriesNav({
  series,
  prev,
  next,
}: {
  series: Series;
  prev: Post | null;
  next: Post | null;
}) {
  return (
    <div className="neo-card flex flex-col gap-3 bg-(--color-violet) p-5 sm:p-6">
      <Link href={`/series/${series.slug}`} className="w-fit text-sm font-bold underline">
        시리즈: {series.title}
      </Link>
      <div className="flex flex-col gap-2 text-sm font-bold sm:flex-row sm:justify-between">
        {prev ? (
          <Link href={postPath(prev)} className="hover:underline">
            ← 이전화: {prev.title}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link href={postPath(next)} className="text-right hover:underline">
            다음화: {next.title} →
          </Link>
        ) : (
          <span />
        )}
      </div>
    </div>
  );
}
