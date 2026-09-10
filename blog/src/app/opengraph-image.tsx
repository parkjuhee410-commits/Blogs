import { readFile } from "node:fs/promises";
import { join } from "node:path";

import { ImageResponse } from "next/og";

import { siteConfig } from "@/lib/site";

export const alt = siteConfig.name;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const pretendard = readFile(
  join(process.cwd(), "src/app/fonts/PretendardVariable.woff2"),
);

export default async function OgImage() {
  const fontData = await pretendard;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          gap: 24,
          background: "#fdfbf4",
          padding: "64px",
          fontFamily: "Pretendard",
        }}
      >
        <div
          style={{
            display: "flex",
            alignSelf: "flex-start",
            border: "5px solid #111111",
            boxShadow: "10px 10px 0 0 #111111",
            background: "#ffe142",
            padding: "24px 36px",
            fontSize: 72,
            fontWeight: 700,
            color: "#111111",
          }}
        >
          {siteConfig.name}
        </div>
        <div style={{ display: "flex", fontSize: 34, fontWeight: 700, color: "#5b5b5b" }}>
          {siteConfig.description}
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
