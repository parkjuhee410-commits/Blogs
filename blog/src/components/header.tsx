import Link from "next/link";

import { siteConfig } from "@/lib/site";
import { POST_TYPES, postTypeMeta } from "@/lib/taxonomy";

export function Header() {
  return (
    <header className="border-b-[3px] border-(--color-border) bg-(--color-surface)">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3 px-4 py-5 sm:px-6 md:flex-row md:items-center md:justify-between">
        <Link href="/" className="text-xl font-black tracking-tight">
          {siteConfig.name}
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-bold">
          {POST_TYPES.map((type) => (
            <Link key={type} href={`/${postTypeMeta[type].path}`} className="hover:underline">
              {postTypeMeta[type].label}
            </Link>
          ))}
          <Link href="/about" className="hover:underline">
            소개
          </Link>
          <Link href="/rss.xml" className="hover:underline">
            RSS
          </Link>
        </nav>
      </div>
    </header>
  );
}
