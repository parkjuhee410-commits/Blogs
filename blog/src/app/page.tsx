import Link from "next/link";

import { PostCard } from "@/components/post-card";
import { getLatestPostsByType } from "@/lib/posts";
import { getTagsForPosts } from "@/lib/services/tags";
import { POST_TYPES, postTypeMeta } from "@/lib/taxonomy";

export const revalidate = 60;

export default async function HomePage() {
  const sections = await Promise.all(
    POST_TYPES.map(async (type) => {
      const posts = await getLatestPostsByType(type, 3);
      const tagsByPost = await getTagsForPosts(posts.map((post) => post.id));
      return { type, posts, tagsByPost };
    }),
  );

  return (
    <div className="flex flex-col gap-12">
      <section className="neo-card bg-(--color-accent) p-6 sm:p-8">
        <h1 className="text-3xl font-black sm:text-4xl">
          생각을 기록하고 나눕니다
        </h1>
        <p className="mt-2 font-semibold">
          인사이트, 자주 묻는 질문, 용어 사전, 일상까지 — 맛집탐방, AI/기술,
          부동산 이야기를 담습니다.
        </p>
      </section>

      {sections.map(({ type, posts, tagsByPost }) => {
        const meta = postTypeMeta[type];
        return (
          <section key={type} className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-black">{meta.label}</h2>
                <p className="text-sm text-(--color-muted)">{meta.description}</p>
              </div>
              <Link
                href={`/${meta.path}`}
                className="neo-border neo-shadow-sm neo-interactive shrink-0 bg-(--color-surface) px-3 py-1.5 text-sm font-bold"
              >
                전체 보기
              </Link>
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
          </section>
        );
      })}
    </div>
  );
}
