"use server";

import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ADMIN_SESSION_COOKIE, createSessionToken } from "@/lib/auth";
import {
  createPost,
  deletePost,
  isSlugTaken,
  updatePost,
} from "@/lib/posts";
import { upsertSeriesByTitle } from "@/lib/services/series";
import { syncPostTagsByNames } from "@/lib/services/tags";
import { isCategory, isPostType } from "@/lib/taxonomy";
import { excerptFromMarkdown, isValidSlug } from "@/lib/utils";

export type FormState = { error?: string };

export async function loginAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const password = String(formData.get("password") ?? "");

  if (!process.env.ADMIN_PASSWORD) {
    return { error: "서버에 ADMIN_PASSWORD 환경변수가 설정되지 않았습니다." };
  }
  if (password !== process.env.ADMIN_PASSWORD) {
    return { error: "비밀번호가 올바르지 않습니다." };
  }

  const token = await createSessionToken();
  const cookieStore = await cookies();
  cookieStore.set(ADMIN_SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });

  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_SESSION_COOKIE);
  redirect("/admin/login");
}

function readPostForm(formData: FormData) {
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    content: String(formData.get("content") ?? ""),
    coverImageUrl: String(formData.get("coverImageUrl") ?? "").trim(),
    type: String(formData.get("type") ?? ""),
    category: String(formData.get("category") ?? ""),
    published: formData.get("published") === "on",
    tags: String(formData.get("tags") ?? "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean),
    seriesTitle: String(formData.get("seriesTitle") ?? "").trim(),
    seriesOrder: formData.get("seriesOrder")
      ? Number(formData.get("seriesOrder"))
      : null,
    metaTitle: String(formData.get("metaTitle") ?? "").trim(),
    metaDescription: String(formData.get("metaDescription") ?? "").trim(),
    noindex: formData.get("noindex") === "on",
  };
}

export async function createPostAction(
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = readPostForm(formData);

  if (!raw.title) return { error: "제목을 입력하세요." };
  if (!raw.content) return { error: "내용을 입력하세요." };
  if (!isValidSlug(raw.slug)) {
    return { error: "슬러그는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다." };
  }
  if (!isPostType(raw.type)) return { error: "글 종류를 선택하세요." };
  if (!isCategory(raw.category)) return { error: "카테고리를 선택하세요." };
  if (await isSlugTaken(raw.slug)) {
    return { error: "이미 사용 중인 슬러그입니다." };
  }

  const series = raw.seriesTitle
    ? await upsertSeriesByTitle(raw.seriesTitle)
    : null;

  const post = await createPost({
    slug: raw.slug,
    title: raw.title,
    description: raw.description || excerptFromMarkdown(raw.content),
    content: raw.content,
    coverImageUrl: raw.coverImageUrl || null,
    type: raw.type,
    category: raw.category,
    published: raw.published,
    seriesId: series?.id ?? null,
    seriesOrder: series ? raw.seriesOrder : null,
    metaTitle: raw.metaTitle || null,
    metaDescription: raw.metaDescription || null,
    noindex: raw.noindex,
  });

  await syncPostTagsByNames(post.id, raw.tags);

  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  redirect("/admin");
}

export async function updatePostAction(
  id: number,
  _prevState: FormState,
  formData: FormData,
): Promise<FormState> {
  const raw = readPostForm(formData);

  if (!raw.title) return { error: "제목을 입력하세요." };
  if (!raw.content) return { error: "내용을 입력하세요." };
  if (!isValidSlug(raw.slug)) {
    return { error: "슬러그는 영문 소문자, 숫자, 하이픈만 사용할 수 있습니다." };
  }
  if (!isPostType(raw.type)) return { error: "글 종류를 선택하세요." };
  if (!isCategory(raw.category)) return { error: "카테고리를 선택하세요." };
  if (await isSlugTaken(raw.slug, id)) {
    return { error: "이미 사용 중인 슬러그입니다." };
  }

  const series = raw.seriesTitle
    ? await upsertSeriesByTitle(raw.seriesTitle)
    : null;

  await updatePost(id, {
    slug: raw.slug,
    title: raw.title,
    description: raw.description || excerptFromMarkdown(raw.content),
    content: raw.content,
    coverImageUrl: raw.coverImageUrl || null,
    type: raw.type,
    category: raw.category,
    published: raw.published,
    seriesId: series?.id ?? null,
    seriesOrder: series ? raw.seriesOrder : null,
    metaTitle: raw.metaTitle || null,
    metaDescription: raw.metaDescription || null,
    noindex: raw.noindex,
  });

  await syncPostTagsByNames(id, raw.tags);

  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  revalidatePath(`/${raw.type}/${raw.slug}`);
  redirect("/admin");
}

export async function deletePostAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;

  await deletePost(id);
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}
