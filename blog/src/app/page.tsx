import Link from "next/link";

import { PostCard } from "@/components/post-card";
import { getAllTags, getPublishedPosts } from "@/lib/posts";

export const revalidate = 60;

export default async function HomePage() {
  const [posts, tags] = await Promise.all([
    getPublishedPosts(),
    getAllTags(),
  ]);

  return (
    <div className="flex flex-col gap-10">
      <section className="neo-card bg-(--color-accent) p-6 sm:p-8">
        <h1 className="text-3xl font-black sm:text-4xl">
          생각을 기록하고 나눕니다
        </h1>
        <p className="mt-2 font-semibold">
          개발, 일상, 그리고 배운 것들에 대한 글을 씁니다.
        </p>
      </section>

      {tags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {tags.map(({ tag, count }) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="neo-border neo-interactive bg-(--color-surface) px-3 py-1 text-sm font-bold"
            >
              #{tag} <span className="text-(--color-muted)">{count}</span>
            </Link>
          ))}
        </div>
      )}

      {posts.length === 0 ? (
        <p className="text-(--color-muted)">아직 게시된 글이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {posts.map((post, index) => (
            <PostCard key={post.id} post={post} index={index} />
          ))}
        </div>
      )}
    </div>
  );
}
