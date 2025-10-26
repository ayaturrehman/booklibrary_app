import { NextResponse } from "next/server";
import {
  getCategory,
  updateCategory,
  deleteCategory,
  listBooksForCategory,
} from "@/lib/db";

async function resolveParams(context) {
  return (await context?.params) || {};
}

function normalizeId(rawId) {
  const id = Number(rawId);
  if (!Number.isInteger(id) || id <= 0) {
    return null;
  }
  return id;
}

export async function GET(_request, context) {
  try {
    const { categoryId } = await resolveParams(context);
    const id = normalizeId(categoryId);
    if (!id) {
      return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
    }

    const category = await getCategory(id);
    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const books = await listBooksForCategory(id);
    return NextResponse.json({ category, books });
  } catch (error) {
    console.error("Failed to get category", error);
    return NextResponse.json(
      { error: "Failed to get category" },
      { status: 500 }
    );
  }
}

export async function PUT(request, context) {
  try {
    const { categoryId } = await resolveParams(context);
    const id = normalizeId(categoryId);
    if (!id) {
      return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
    }

    const existing = await getCategory(id);
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const payload = await request.json();
    const name = payload?.name?.trim();
    const description =
      payload?.description !== undefined
        ? payload.description.trim()
        : existing.description;

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const category = await updateCategory(id, { name, description });
    return NextResponse.json({ category });
  } catch (error) {
    console.error("Failed to update category", error);
    if (error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Category name must be unique" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

export async function DELETE(_request, context) {
  try {
    const { categoryId } = await resolveParams(context);
    const id = normalizeId(categoryId);
    if (!id) {
      return NextResponse.json({ error: "Invalid category id" }, { status: 400 });
    }

    const existing = await getCategory(id);
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await deleteCategory(id);
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Failed to delete category", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
