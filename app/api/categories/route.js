import { NextResponse } from "next/server";
import { listCategories, createCategory } from "@/lib/db";

export async function GET() {
  try {
    const categories = await listCategories();
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Failed to fetch categories", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const payload = await request.json();
    const name = payload?.name?.trim();
    const description = payload?.description?.trim() || "";

    if (!name) {
      return NextResponse.json(
        { error: "Category name is required" },
        { status: 400 }
      );
    }

    const category = await createCategory({ name, description });
    return NextResponse.json({ category }, { status: 201 });
  } catch (error) {
    console.error("Failed to create category", error);
    if (error && error.code === "P2002") {
      return NextResponse.json(
        { error: "Category name must be unique" },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}
