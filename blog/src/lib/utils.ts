const SLUG_PATTERN = /^[a-z0-9]+(-[a-z0-9]+)*$/;

export function isValidSlug(slug: string) {
  return SLUG_PATTERN.test(slug);
}

export function slugify(input: string) {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function plainTextFromMarkdown(markdown: string) {
  return markdown
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/!\[[^\]]*\]\([^)]*\)/g, " ")
    .replace(/\[([^\]]*)\]\([^)]*\)/g, "$1")
    .replace(/[#>*_~`-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function excerptFromMarkdown(markdown: string, maxLength = 150) {
  const plain = plainTextFromMarkdown(markdown);
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength).trim()}...`;
}

export function readingTimeMinutes(markdown: string) {
  const words = markdown.trim().split(/\s+/).filter(Boolean).length;
  const koreanChars = (markdown.match(/[가-힣]/g) ?? []).length;
  const minutes = Math.max(1, Math.round((words + koreanChars / 2) / 350));
  return minutes;
}

export function formatDateKo(date: Date | string | null) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(d);
}
