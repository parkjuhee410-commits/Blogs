"use client";

import { useActionState, useState } from "react";

import type { FormState } from "@/app/admin/actions";
import { slugify } from "@/lib/utils";

type Props = {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: {
    slug: string;
    title: string;
    description: string;
    content: string;
    coverImageUrl: string;
    tags: string;
    published: boolean;
  };
  submitLabel: string;
};

const inputClass =
  "neo-border bg-(--color-surface) px-3 py-2 font-medium outline-none focus:bg-(--color-accent)";

export function AdminPostForm({ action, defaultValues, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues?.slug));

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <label className="flex flex-col gap-1 font-bold">
        제목
        <input
          name="title"
          required
          defaultValue={defaultValues?.title}
          className={inputClass}
          onChange={(e) => {
            if (!slugTouched) setSlug(slugify(e.target.value));
          }}
        />
      </label>

      <label className="flex flex-col gap-1 font-bold">
        슬러그 (URL, 영문 소문자/숫자/하이픈)
        <input
          name="slug"
          required
          value={slug}
          pattern="^[a-z0-9]+(-[a-z0-9]+)*$"
          onChange={(e) => {
            setSlugTouched(true);
            setSlug(e.target.value);
          }}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 font-bold">
        요약 (비워두면 본문에서 자동 생성)
        <textarea
          name="description"
          defaultValue={defaultValues?.description}
          maxLength={300}
          rows={2}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 font-bold">
        커버 이미지 URL (선택)
        <input
          name="coverImageUrl"
          defaultValue={defaultValues?.coverImageUrl}
          placeholder="https://..."
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 font-bold">
        태그 (쉼표로 구분)
        <input
          name="tags"
          defaultValue={defaultValues?.tags}
          placeholder="next.js, 개발일지"
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1 font-bold">
        본문 (Markdown)
        <textarea
          name="content"
          required
          defaultValue={defaultValues?.content}
          rows={18}
          className={`${inputClass} font-mono text-sm`}
        />
      </label>

      <label className="flex items-center gap-2 font-bold">
        <input
          type="checkbox"
          name="published"
          defaultChecked={defaultValues?.published}
          className="h-5 w-5 neo-border"
        />
        바로 게시하기
      </label>

      {state?.error && (
        <p className="font-bold text-(--color-coral)">{state.error}</p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="neo-border neo-shadow-sm neo-interactive w-fit bg-(--color-accent) px-6 py-2 font-bold disabled:opacity-60"
      >
        {pending ? "저장 중..." : submitLabel}
      </button>
    </form>
  );
}
