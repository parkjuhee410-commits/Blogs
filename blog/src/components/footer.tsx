import { siteConfig } from "@/lib/site";

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t-[3px] border-(--color-border) bg-(--color-surface)">
      <div className="mx-auto w-full max-w-3xl px-4 py-6 text-sm font-medium text-(--color-muted) sm:px-6">
        © {year} {siteConfig.name}. All rights reserved.
      </div>
    </footer>
  );
}
