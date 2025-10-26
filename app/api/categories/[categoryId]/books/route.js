import { NextResponse } from "next/server";
import { getCategory, listBooksForCategory, createBook } from "@/lib/db";

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
    const { categoryId: categoryIdRaw } = await resolveParams(context);
    const categoryId = normalizeId(categoryIdRaw);
    if (!categoryId) {
      return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
    }

    const category = await getCategory(categoryId);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const books = await listBooksForCategory(categoryId);
    return NextResponse.json({ category, books });
  } catch (error) {
    console.error("Failed to fetch books for category", error);
    return NextResponse.json(
      { error: "Failed to fetch books" },
      { status: 500 }
    );
  }
}

export async function POST(request, context) {
  try {
    const { categoryId: categoryIdRaw } = await resolveParams(context);
    const categoryId = normalizeId(categoryIdRaw);
    if (!categoryId) {
      return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
    }

    const category = await getCategory(categoryId);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const payload = await request.json();
    const title = payload?.title?.trim();
    const author = payload?.author?.trim();
    const description = payload?.description?.trim();

    if (!title) {
      return NextResponse.json(
        { error: "Book title is required" },
        { status: 400 }
      );
    }

    const book = await createBook({
      categoryId,
      title,
      author,
      description,
    });

    return NextResponse.json({ book }, { status: 201 });
  } catch (error) {
    console.error("Failed to create book", error);
    return NextResponse.json(
      { error: "Failed to create book" },
      { status: 500 }
    );
  }
}
