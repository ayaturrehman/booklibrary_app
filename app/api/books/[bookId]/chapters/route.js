import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import {
  getBook,
  listChaptersForBook,
  createChapter,
} from "@/lib/database";

const uploadsDir = path.join(process.cwd(), "public", "uploads", "chapters");

function ensureUploadsDir() {
  if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
  }
}

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
    console.error("Failed to fetch chapters", error);
    return NextResponse.json(
      { error: "Failed to fetch chapters" },
      { status: 500 }
    );
  }
}

export async function POST(request, context) {
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

    const formData = await request.formData();
    const title = formData.get("title")?.toString().trim();
    const pdfFile = formData.get("pdf");
    const pageCount = Number(formData.get("pageCount"));
    const chapterIndex = Number(formData.get("chapterIndex"));

    if (!title) {
      return NextResponse.json(
        { error: "Chapter title is required" },
        { status: 400 }
      );
    }

    if (!pdfFile || typeof pdfFile.arrayBuffer !== "function") {
      return NextResponse.json(
        { error: "PDF upload is required" },
        { status: 400 }
      );
    }

    ensureUploadsDir();

    const arrayBuffer = await pdfFile.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const originalName = pdfFile.name || "chapter.pdf";
    const sanitizedName = originalName
      .toLowerCase()
      .replace(/[^a-z0-9.]+/g, "-")
      .replace(/^-+|-+$/g, "");
    const fileName = `${Date.now()}-${sanitizedName || "chapter.pdf"}`;
    const filePath = path.join(uploadsDir, fileName);
    fs.writeFileSync(filePath, buffer);

    const pdfPath = path.join("/uploads/chapters", fileName);

    const chapter = createChapter({
      bookId,
      title,
      pdfPath,
      pageCount: Number.isFinite(pageCount) ? pageCount : undefined,
      chapterIndex: Number.isFinite(chapterIndex) ? chapterIndex : undefined,
    });

    return NextResponse.json({ chapter }, { status: 201 });
  } catch (error) {
    console.error("Failed to create chapter", error);
    return NextResponse.json(
      { error: "Failed to create chapter" },
      { status: 500 }
    );
  }
}
