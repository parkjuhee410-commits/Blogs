import type { Metadata } from "next";
import Link from "next/link";

import { getAllPostsForAdmin } from "@/lib/posts";
import { formatDateKo } from "@/lib/utils";

import { deletePostAction, logoutAction } from "./actions";

export const metadata: Metadata = { title: "관리자", robots: { index: false } };
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const posts = await getAllPostsForAdmin();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black">글 관리</h1>
        <div className="flex gap-2">
          <Link
            href="/admin/new"
            className="neo-border neo-shadow-sm neo-interactive bg-(--color-accent) px-4 py-2 text-sm font-bold"
          >
            새 글 작성
          </Link>
          <form action={logoutAction}>
            <button className="neo-border neo-shadow-sm neo-interactive bg-(--color-surface) px-4 py-2 text-sm font-bold">
              로그아웃
            </button>
          </form>
        </div>
      </div>

      {posts.length === 0 ? (
        <p className="text-(--color-muted)">작성된 글이 없습니다.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {posts.map((post) => (
            <div
              key={post.id}
              className="neo-card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`neo-border px-2 py-0.5 text-xs font-bold ${
                      post.published ? "bg-(--color-mint)" : "bg-(--color-surface)"
                    }`}
                  >
                    {post.published ? "게시됨" : "임시저장"}
                  </span>
                  <span className="text-xs font-bold text-(--color-muted)">
                    {formatDateKo(post.createdAt)}
                  </span>
                </div>
                <p className="mt-1 font-extrabold">{post.title}</p>
                <p className="text-xs text-(--color-muted)">/blog/{post.slug}</p>
              </div>
              <div className="flex gap-2">
                <Link
                  href={`/admin/${post.id}/edit`}
                  className="neo-border neo-interactive bg-(--color-surface) px-3 py-1.5 text-sm font-bold"
                >
                  수정
                </Link>
                <form action={deletePostAction}>
                  <input type="hidden" name="id" value={post.id} />
                  <button className="neo-border neo-interactive bg-(--color-coral) px-3 py-1.5 text-sm font-bold">
                    삭제
                  </button>
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
