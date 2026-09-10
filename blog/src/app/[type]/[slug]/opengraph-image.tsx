import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { getPostBySlugAndType } from "@/lib/posts";
import { siteConfig } from "@/lib/site";
import { categoryMeta, isPostType, postTypeMeta } from "@/lib/taxonomy";

export const alt = "게시글 미리보기 이미지";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const pretendard = readFile(
  join(process.cwd(), "src/app/fonts/PretendardVariable.woff2"),
);

type Props = { params: Promise<{ type: string; slug: string }> };

export default async function OgImage({ params }: Props) {
  const { type, slug } = await params;
  const fontData = await pretendard;

  const post = isPostType(type) ? await getPostBySlugAndType(slug, type) : null;
  const title = post?.title ?? siteConfig.name;
  const typeLabel = isPostType(type) ? postTypeMeta[type].label : "";
  const categoryLabel = post ? categoryMeta[post.category].label : "";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#fdfbf4",
          padding: "64px",
          fontFamily: "Pretendard",
        }}
      >
        <div style={{ display: "flex", gap: 16 }}>
          {typeLabel && (
            <div
              style={{
                display: "flex",
                border: "4px solid #111111",
                background: "#ffe142",
                padding: "10px 24px",
                fontSize: 30,
                fontWeight: 700,
                color: "#111111",
              }}
            >
              {typeLabel}
            </div>
          )}
          {categoryLabel && (
            <div
              style={{
                display: "flex",
                border: "4px solid #111111",
                background: "#ffffff",
                padding: "10px 24px",
                fontSize: 30,
                fontWeight: 700,
                color: "#111111",
              }}
            >
              {categoryLabel}
            </div>
          )}
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 700,
            lineHeight: 1.3,
            color: "#111111",
          }}
        >
          {title}
        </div>

        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            border: "4px solid #111111",
            boxShadow: "8px 8px 0 0 #111111",
            background: "#ffffff",
            padding: "16px 28px",
            fontSize: 30,
            fontWeight: 700,
            color: "#111111",
          }}
        >
          {siteConfig.name}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Pretendard", data: fontData, style: "normal", weight: 700 },
      ],
    },
  );
}
