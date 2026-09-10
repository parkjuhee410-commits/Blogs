"use client";

import { useActionState, useState } from "react";

import type { FormState } from "@/app/admin/actions";
import {
  CATEGORIES,
  categoryMeta,
  POST_TYPES,
  postTypeMeta,
  type PostType,
} from "@/lib/taxonomy";
import { slugify } from "@/lib/utils";

type Props = {
  action: (prevState: FormState, formData: FormData) => Promise<FormState>;
  defaultValues?: {
    slug: string;
    title: string;
    description: string;
    content: string;
    coverImageUrl: string;
    type: PostType;
    category: string;
    published: boolean;
  };
  submitLabel: string;
};

const inputClass =
  "neo-border bg-(--color-surface) px-3 py-2 font-medium outline-none focus:bg-(--color-accent)";

const FIELD_LABELS: Record<PostType, { title: string; content: string }> = {
  insight: { title: "제목", content: "본문 (Markdown)" },
  faq: { title: "질문", content: "답변 (Markdown)" },
  glossary: { title: "용어", content: "설명 (Markdown)" },
  daily: { title: "제목", content: "본문 (Markdown)" },
};

export function AdminPostForm({ action, defaultValues, submitLabel }: Props) {
  const [state, formAction, pending] = useActionState(action, {});
  const [slug, setSlug] = useState(defaultValues?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(Boolean(defaultValues?.slug));
  const [type, setType] = useState<PostType>(defaultValues?.type ?? "insight");

  const labels = FIELD_LABELS[type];

  return (
    <form action={formAction} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 font-bold">
          글 종류
          <select
            name="type"
            value={type}
            onChange={(e) => setType(e.target.value as PostType)}
            className={inputClass}
          >
            {POST_TYPES.map((t) => (
              <option key={t} value={t}>
                {postTypeMeta[t].label}
              </option>
            ))}
          </select>
        </label>

        <label className="flex flex-col gap-1 font-bold">
          카테고리
          <select
            name="category"
            defaultValue={defaultValues?.category ?? CATEGORIES[0]}
            className={inputClass}
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {categoryMeta[c].label}
              </option>
            ))}
          </select>
        </label>
      </div>

      <label className="flex flex-col gap-1 font-bold">
        {labels.title}
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
        {labels.content}
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
