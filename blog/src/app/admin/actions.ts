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
import { excerptFromMarkdown, isValidSlug, parseTags } from "@/lib/utils";

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
    tags: String(formData.get("tags") ?? ""),
    published: formData.get("published") === "on",
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
  if (await isSlugTaken(raw.slug)) {
    return { error: "이미 사용 중인 슬러그입니다." };
  }

  await createPost({
    slug: raw.slug,
    title: raw.title,
    description: raw.description || excerptFromMarkdown(raw.content),
    content: raw.content,
    coverImageUrl: raw.coverImageUrl || null,
    tags: parseTags(raw.tags),
    published: raw.published,
  });

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
  if (await isSlugTaken(raw.slug, id)) {
    return { error: "이미 사용 중인 슬러그입니다." };
  }

  await updatePost(id, {
    slug: raw.slug,
    title: raw.title,
    description: raw.description || excerptFromMarkdown(raw.content),
    content: raw.content,
    coverImageUrl: raw.coverImageUrl || null,
    tags: parseTags(raw.tags),
    published: raw.published,
  });

  revalidatePath("/");
  revalidatePath("/sitemap.xml");
  revalidatePath(`/blog/${raw.slug}`);
  redirect("/admin");
}

export async function deletePostAction(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isFinite(id)) return;

  await deletePost(id);
  revalidatePath("/");
  revalidatePath("/sitemap.xml");
}
