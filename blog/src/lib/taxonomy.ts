export const POST_TYPES = ["insight", "faq", "glossary", "daily"] as const;
export type PostType = (typeof POST_TYPES)[number];

export const CATEGORIES = ["food", "ai_tech", "real_estate"] as const;
export type Category = (typeof CATEGORIES)[number];

export const postTypeMeta: Record<
  PostType,
  { label: string; path: string; description: string }
> = {
  insight: {
    label: "인사이트",
    path: "insight",
    description: "생각과 분석을 담은 글",
  },
  faq: {
    label: "자주 묻는 질문",
    path: "faq",
    description: "자주 묻는 질문과 답변 모음",
  },
  glossary: {
    label: "용어 사전",
    path: "glossary",
    description: "용어와 정의 모음",
  },
  daily: {
    label: "일상",
    path: "daily",
    description: "일상을 기록한 글",
  },
};

export const categoryMeta: Record<Category, { label: string }> = {
  food: { label: "맛집탐방" },
  ai_tech: { label: "AI/기술" },
  real_estate: { label: "부동산" },
};

export function isPostType(value: string): value is PostType {
  return (POST_TYPES as readonly string[]).includes(value);
}

export function isCategory(value: string): value is Category {
  return (CATEGORIES as readonly string[]).includes(value);
}

export function postPath(post: { type: PostType; slug: string }) {
  return `/${postTypeMeta[post.type].path}/${post.slug}`;
}
