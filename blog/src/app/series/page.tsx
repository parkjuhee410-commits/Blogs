import type { Metadata } from "next";
import Link from "next/link";

import { listSeries } from "@/lib/services/series";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "시리즈",
  description: "연재물 시리즈 모음",
  alternates: { canonical: "/series" },
};

export default async function SeriesPage() {
  const seriesList = await listSeries();
  const activeSeries = seriesList.filter((item) => item.postCount > 0);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-black sm:text-4xl">시리즈</h1>
        <p className="mt-1 text-(--color-muted)">연재 중인 시리즈 모음입니다.</p>
      </div>

      {activeSeries.length === 0 ? (
        <p className="text-(--color-muted)">아직 등록된 시리즈가 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-4">
          {activeSeries.map((item) => (
            <Link
              key={item.id}
              href={`/series/${item.slug}`}
              className="neo-card neo-interactive flex flex-col gap-2 p-5 sm:p-6"
            >
              <h2 className="text-xl font-extrabold sm:text-2xl">{item.title}</h2>
              {item.description && (
                <p className="text-(--color-muted)">{item.description}</p>
              )}
              <p className="text-sm font-bold text-(--color-muted)">
                총 {item.postCount}화
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
