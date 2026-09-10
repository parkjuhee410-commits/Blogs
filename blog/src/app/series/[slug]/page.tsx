import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getSeriesWithEpisodes } from "@/lib/services/series";
import { formatDateKo } from "@/lib/utils";
import { postPath, postTypeMeta } from "@/lib/taxonomy";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const result = await getSeriesWithEpisodes(slug);
  if (!result) return {};

  return {
    title: result.series.title,
    description: result.series.description ?? `${result.series.title} 시리즈`,
    alternates: { canonical: `/series/${slug}` },
  };
}

export default async function SeriesDetailPage({ params }: Props) {
  const { slug } = await params;
  const result = await getSeriesWithEpisodes(slug);
  if (!result) notFound();

  const { series, episodes } = result;

  return (
    <div className="flex flex-col gap-6">
      <Link href="/series" className="text-sm font-bold hover:underline">
        ← 시리즈 목록
      </Link>

      <div className="neo-card bg-(--color-violet) p-6 sm:p-8">
        <h1 className="text-3xl font-black sm:text-4xl">{series.title}</h1>
        {series.description && (
          <p className="mt-2 font-semibold">{series.description}</p>
        )}
      </div>

      {episodes.length === 0 ? (
        <p className="text-(--color-muted)">아직 게시된 글이 없습니다.</p>
      ) : (
        <ol className="flex flex-col gap-4">
          {episodes.map((episode, index) => (
            <li key={episode.id}>
              <Link
                href={postPath(episode)}
                className="neo-card neo-interactive flex items-center gap-4 p-5 sm:p-6"
              >
                <span className="neo-border flex h-10 w-10 shrink-0 items-center justify-center bg-(--color-accent) font-black">
                  {episode.seriesOrder ?? index + 1}
                </span>
                <div className="flex flex-col gap-1">
                  <span className="text-xs font-bold text-(--color-muted)">
                    {postTypeMeta[episode.type].label} ·{" "}
                    {formatDateKo(episode.publishedAt)}
                  </span>
                  <h2 className="font-extrabold">{episode.title}</h2>
                </div>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
