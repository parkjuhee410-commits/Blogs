import Link from "next/link";

import { siteConfig } from "@/lib/site";

export function Header() {
  return (
    <header className="border-b-[3px] border-(--color-border) bg-(--color-surface)">
      <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-4 py-5 sm:px-6">
        <Link
          href="/"
          className="text-xl font-black tracking-tight"
        >
          {siteConfig.name}
        </Link>
        <nav className="flex items-center gap-4 text-sm font-bold">
          <Link href="/" className="hover:underline">
            글
          </Link>
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
