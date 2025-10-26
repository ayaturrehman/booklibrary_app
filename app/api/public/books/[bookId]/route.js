import { NextResponse } from "next/server";
import { getBook, listChaptersForBook } from "@/lib/db";

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
    const { bookId: bookIdRaw } = await resolveParams(context);
    const bookId = normalizeId(bookIdRaw);
    if (!bookId) {
      return NextResponse.json({ error: "Invalid book" }, { status: 400 });
    }

    const book = await getBook(bookId);
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const chapters = await listChaptersForBook(bookId);
    return NextResponse.json({ book, chapters });
  } catch (error) {
    console.error("Failed to fetch public book detail", error);
    return NextResponse.json(
      { error: "Failed to fetch book" },
      { status: 500 }
    );
  }
}
