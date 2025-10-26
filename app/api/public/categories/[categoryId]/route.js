import { NextResponse } from "next/server";
import { getCategory, listBooksForCategory } from "@/lib/database";

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
    const { categoryId: categoryIdRaw } = await resolveParams(context);
    const categoryId = normalizeId(categoryIdRaw);
    if (!categoryId) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    const category = getCategory(categoryId);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const books = listBooksForCategory(categoryId);
    return NextResponse.json({ category, books });
  } catch (error) {
    console.error("Failed to fetch public category detail", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
      { status: 500 }
    );
  }
}
