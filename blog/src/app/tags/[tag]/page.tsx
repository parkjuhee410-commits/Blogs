import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { PostCard } from "@/components/post-card";
import { getAllTags, getPublishedPostsByTag } from "@/lib/posts";

export const revalidate = 60;

type Props = {
  params: Promise<{ tag: string }>;
};

export async function generateStaticParams() {
  const tags = await getAllTags();
  return tags.map(({ tag }) => ({ tag }));
}

export async function generateMetadata({
  params,
}: Props): Promise<Metadata> {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  return {
    title: `#${decoded}`,
    description: `#${decoded} 태그가 달린 글 모음`,
    alternates: { canonical: `/tags/${tag}` },
  };
}

export default async function TagPage({ params }: Props) {
  const { tag } = await params;
  const decoded = decodeURIComponent(tag);
  const posts = await getPublishedPostsByTag(decoded);

  if (posts.length === 0) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link href="/" className="text-sm font-bold hover:underline">
          ← 전체 글
        </Link>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">#{decoded}</h1>
      </div>
      <div className="flex flex-col gap-5">
        {posts.map((post, index) => (
          <PostCard key={post.id} post={post} index={index} />
        ))}
      </div>
    </div>
  );
}
