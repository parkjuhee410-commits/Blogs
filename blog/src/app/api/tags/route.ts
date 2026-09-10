import { NextResponse } from "next/server";

import { listTags } from "@/lib/services/tags";

export const revalidate = 60;

export async function GET() {
  const tags = await listTags();
  return NextResponse.json({ tags });
}
