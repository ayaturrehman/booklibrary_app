import { NextResponse } from "next/server";
import { getBook, updateBook, deleteBook, listChaptersForBook } from "@/lib/database";

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

export async function GET(_request, context) {
  try {
    const { bookId: bookIdRaw } = await resolveParams(context);
    const bookId = normalizeId(bookIdRaw);
    if (!bookId) {
      return NextResponse.json({ error: "Invalid book id" }, { status: 400 });
    }

    const book = getBook(bookId);
    if (!book) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const chapters = listChaptersForBook(bookId);
    return NextResponse.json({ book, chapters });
  } catch (error) {
    console.error("Failed to get book", error);
    return NextResponse.json({ error: "Failed to get book" }, { status: 500 });
  }
}

export async function PUT(request, context) {
  try {
    const { bookId: bookIdRaw } = await resolveParams(context);
    const bookId = normalizeId(bookIdRaw);
    if (!bookId) {
      return NextResponse.json({ error: "Invalid book id" }, { status: 400 });
    }

    const existing = getBook(bookId);
    if (!existing) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    const payload = await request.json();
    const title = payload?.title?.trim();
    const author =
      payload?.author !== undefined ? payload.author.trim() : existing.author;
    const description =
      payload?.description !== undefined
        ? payload.description.trim()
        : existing.description;

    if (!title) {
      return NextResponse.json(
        { error: "Book title is required" },
        { status: 400 }
      );
    }

    const book = updateBook(bookId, { title, author, description });
    return NextResponse.json({ book });
  } catch (error) {
    console.error("Failed to update book", error);
    return NextResponse.json(
      { error: "Failed to update book" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, context) {
  try {
    const { bookId: bookIdRaw } = await resolveParams(context);
    const bookId = normalizeId(bookIdRaw);
    if (!bookId) {
      return NextResponse.json({ error: "Invalid book id" }, { status: 400 });
    }

    const existing = getBook(bookId);
    if (!existing) {
      return NextResponse.json({ error: "Book not found" }, { status: 404 });
    }

    deleteBook(bookId);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete book", error);
    return NextResponse.json(
      { error: "Failed to delete book" },
      { status: 500 }
    );
  }
}
