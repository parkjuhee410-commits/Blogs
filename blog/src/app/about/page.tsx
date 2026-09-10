import type { Metadata } from "next";

import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "소개",
  description: `${siteConfig.name} 소개 페이지입니다.`,
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-3xl font-black">소개</h1>
      <div className="neo-card p-6 sm:p-8">
        <p className="leading-relaxed">
          안녕하세요, {siteConfig.name}에 오신 것을 환영합니다.
          {" "}
          {siteConfig.description}
        </p>
      </div>
    </div>
  );
}
