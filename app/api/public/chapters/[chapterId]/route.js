import { NextResponse } from "next/server";
import { getChapter } from "@/lib/database";

async function resolveParams(context) {
  return (await context?.params) || {};
}

function normalizeId(rawValue) {
  const id = Number(rawValue);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

export const dynamic = "force-dynamic";

export async function GET(_request, context) {
  try {
    const { chapterId: chapterIdRaw } = await resolveParams(context);
    const chapterId = normalizeId(chapterIdRaw);
    if (!chapterId) {
      return NextResponse.json({ error: "Invalid chapter" }, { status: 400 });
    }

    const chapter = getChapter(chapterId);
    if (!chapter) {
      return NextResponse.json({ error: "Chapter not found" }, { status: 404 });
    }

    return NextResponse.json({ chapter });
  } catch (error) {
    console.error("Failed to fetch public chapter detail", error);
    return NextResponse.json(
      { error: "Failed to fetch chapter" },
      { status: 500 }
    );
  }
}
