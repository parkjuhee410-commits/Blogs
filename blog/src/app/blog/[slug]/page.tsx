import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarkdownContent } from "@/components/markdown-content";
import { getPostBySlug, getPublishedPosts, incrementViewCount } from "@/lib/posts";
import { siteConfig } from "@/lib/site";
import { formatDateKo, readingTimeMinutes } from "@/lib/utils";

export const revalidate = 60;

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || !post.published) {
    return {};
  }

  const url = `${siteConfig.url}/blog/${post.slug}`;

  return {
    title: post.title,
    description: post.description,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description: post.description,
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt.toISOString(),
      tags: post.tags,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
    twitter: {
      card: post.coverImageUrl ? "summary_large_image" : "summary",
      title: post.title,
      description: post.description,
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function PostPage({ params }: Props) {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post || !post.published) {
    notFound();
  }

  incrementViewCount(post.id).catch(() => {});

  const url = `${siteConfig.url}/blog/${post.slug}`;
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt.toISOString(),
    image: post.coverImageUrl ?? undefined,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    author: { "@type": "Person", name: siteConfig.name },
    publisher: { "@type": "Organization", name: siteConfig.name },
  };

  return (
    <article className="flex flex-col gap-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <Link href="/" className="text-sm font-bold hover:underline">
        ← 전체 글
      </Link>

      <header className="flex flex-col gap-3">
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <Link
              key={tag}
              href={`/tags/${encodeURIComponent(tag)}`}
              className="neo-border bg-(--color-accent) px-2 py-0.5 text-xs font-bold"
            >
              #{tag}
            </Link>
          ))}
        </div>
        <h1 className="text-3xl font-black leading-tight sm:text-4xl">
          {post.title}
        </h1>
        <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-(--color-muted)">
          <time dateTime={post.publishedAt?.toISOString()}>
            {formatDateKo(post.publishedAt)}
          </time>
          <span>· {readingTimeMinutes(post.content)}분 소요</span>
          <span>· 조회 {post.viewCount + 1}</span>
        </div>
      </header>

      {post.coverImageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={post.coverImageUrl}
          alt={post.title}
          className="neo-border neo-shadow w-full object-cover"
        />
      )}

      <MarkdownContent content={post.content} />
    </article>
  );
}
