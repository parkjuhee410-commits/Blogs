import type { Metadata } from "next";

import { AdminPostForm } from "@/components/admin-post-form";

import { createPostAction } from "../actions";

export const metadata: Metadata = { title: "새 글 작성", robots: { index: false } };

export default function NewPostPage() {
  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-black">새 글 작성</h1>
      <AdminPostForm action={createPostAction} submitLabel="작성 완료" />
    </div>
  );
}
