import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AdminPostForm } from "@/components/admin-post-form";
import { getPostById } from "@/lib/posts";

import { updatePostAction } from "../../actions";

export const metadata: Metadata = { title: "글 수정", robots: { index: false } };

type Props = {
  params: Promise<{ id: string }>;
};

export default async function EditPostPage({ params }: Props) {
  const { id } = await params;
  const post = await getPostById(Number(id));

  if (!post) {
    notFound();
  }

  const boundAction = updatePostAction.bind(null, post.id);

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-2xl font-black">글 수정</h1>
      <AdminPostForm
        action={boundAction}
        submitLabel="수정 완료"
        defaultValues={{
          slug: post.slug,
          title: post.title,
          description: post.description,
          content: post.content,
          coverImageUrl: post.coverImageUrl ?? "",
          tags: post.tags.join(", "),
          published: post.published,
        }}
      />
    </div>
  );
}
