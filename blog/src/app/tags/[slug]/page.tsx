import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostCard } from "@/components/post-card";
import { getPublishedPostsByTagSlug, getTagBySlug, getTagsForPosts } from "@/lib/services/tags";
import { siteConfig } from "@/lib/site";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) return {};

  return {
    title: `#${tag.name}`,
    description: `#${tag.name} 태그가 달린 글 모음`,
    alternates: { canonical: `/tags/${tag.slug}` },
  };
}

export default async function TagDetailPage({ params }: Props) {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const posts = await getPublishedPostsByTagSlug(slug);
  const tagsByPost = await getTagsForPosts(posts.map((post) => post.id));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm font-bold text-(--color-muted)">{siteConfig.name} 태그</p>
        <h1 className="text-3xl font-black sm:text-4xl">#{tag.name}</h1>
      </div>

      {posts.length === 0 ? (
        <p className="text-(--color-muted)">아직 게시된 글이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {posts.map((post, index) => (
            <PostCard
              key={post.id}
              post={post}
              index={index}
              tags={tagsByPost.get(post.id) ?? []}
            />
          ))}
        </div>
      )}
    </div>
  );
}
