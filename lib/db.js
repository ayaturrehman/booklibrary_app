import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis;
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

export async function listCategories() {
  const categories = await prisma.category.findMany({
    orderBy: { created_at: "desc" },
    include: {
      _count: { select: { books: true } },
      books: {
        select: {
          _count: { select: { chapters: true } },
        },
      },
    },
  });

  return categories.map((category) => ({
    id: category.id,
    name: category.name,
    description: category.description,
    created_at: category.created_at,
    bookCount: category._count.books,
    chapterCount: category.books.reduce(
      (total, book) => total + book._count.chapters,
      0
    ),
  }));
}

export async function getCategory(id) {
  const category = await prisma.category.findUnique({
    where: { id: Number(id) },
  });
  if (!category) {
    return null;
  }
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    created_at: category.created_at,
  };
}

export async function createCategory({ name, description }) {
  const category = await prisma.category.create({
    data: {
      name,
      description: description || null,
    },
  });
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    created_at: category.created_at,
  };
}

export async function updateCategory(id, { name, description }) {
  const category = await prisma.category.update({
    where: { id: Number(id) },
    data: {
      name,
      description: description ?? null,
    },
  });
  return {
    id: category.id,
    name: category.name,
    description: category.description,
    created_at: category.created_at,
  };
}

export async function deleteCategory(id) {
  await prisma.category.delete({
    where: { id: Number(id) },
  });
}

export async function listBooksForCategory(categoryId) {
  const books = await prisma.book.findMany({
    where: { category_id: Number(categoryId) },
    orderBy: { created_at: "desc" },
    include: {
      _count: { select: { chapters: true } },
    },
  });
  return books.map((book) => ({
    id: book.id,
    category_id: book.category_id,
    title: book.title,
    author: book.author,
    description: book.description,
    created_at: book.created_at,
    chapterCount: book._count.chapters,
  }));
}

export async function getBook(id) {
  const book = await prisma.book.findUnique({
    where: { id: Number(id) },
  });
  if (!book) {
    return null;
  }
  return {
    id: book.id,
    category_id: book.category_id,
    title: book.title,
    author: book.author,
    description: book.description,
    created_at: book.created_at,
  };
}

export async function createBook({ categoryId, title, author, description }) {
  const book = await prisma.book.create({
    data: {
      category_id: Number(categoryId),
      title,
      author: author || null,
      description: description || null,
    },
  });
  return {
    id: book.id,
    category_id: book.category_id,
    title: book.title,
    author: book.author,
    description: book.description,
    created_at: book.created_at,
  };
}

export async function updateBook(id, { title, author, description }) {
  const book = await prisma.book.update({
    where: { id: Number(id) },
    data: {
      title,
      author: author ?? null,
      description: description ?? null,
    },
  });
  return {
    id: book.id,
    category_id: book.category_id,
    title: book.title,
    author: book.author,
    description: book.description,
    created_at: book.created_at,
  };
}

export async function deleteBook(id) {
  await prisma.book.delete({
    where: { id: Number(id) },
  });
}

export async function listChaptersForBook(bookId) {
  const chapters = await prisma.chapter.findMany({
    where: { book_id: Number(bookId) },
    orderBy: [
      { chapter_index: "asc" },
      { created_at: "asc" },
    ],
  });
  return chapters.map((chapter) => ({
    id: chapter.id,
    book_id: chapter.book_id,
    title: chapter.title,
    pdf_path: chapter.pdf_path,
    page_count: chapter.page_count,
    chapter_index: chapter.chapter_index,
    created_at: chapter.created_at,
  }));
}

export async function getChapter(id) {
  const chapter = await prisma.chapter.findUnique({
    where: { id: Number(id) },
  });
  if (!chapter) {
    return null;
  }
  return {
    id: chapter.id,
    book_id: chapter.book_id,
    title: chapter.title,
    pdf_path: chapter.pdf_path,
    page_count: chapter.page_count,
    chapter_index: chapter.chapter_index,
    created_at: chapter.created_at,
  };
}

export async function createChapter({
  bookId,
  title,
  pdfPath,
  pageCount,
  chapterIndex,
}) {
  const chapter = await prisma.chapter.create({
    data: {
      book_id: Number(bookId),
      title,
      pdf_path: pdfPath,
      page_count: Number.isFinite(pageCount) ? Number(pageCount) : 0,
      chapter_index: Number.isFinite(chapterIndex) ? Number(chapterIndex) : 0,
    },
  });
  return {
    id: chapter.id,
    book_id: chapter.book_id,
    title: chapter.title,
    pdf_path: chapter.pdf_path,
    page_count: chapter.page_count,
    chapter_index: chapter.chapter_index,
    created_at: chapter.created_at,
  };
}

export async function updateChapter(id, { title, pdfPath, pageCount, chapterIndex }) {
  const existing = await prisma.chapter.findUnique({
    where: { id: Number(id) },
  });
  if (!existing) {
    return null;
  }

  const chapter = await prisma.chapter.update({
    where: { id: Number(id) },
    data: {
      title: title ?? existing.title,
      pdf_path: pdfPath ?? existing.pdf_path,
      page_count:
        typeof pageCount === "number" && Number.isFinite(pageCount)
          ? pageCount
          : existing.page_count,
      chapter_index:
        typeof chapterIndex === "number" && Number.isFinite(chapterIndex)
          ? chapterIndex
          : existing.chapter_index,
    },
  });

  return {
    id: chapter.id,
    book_id: chapter.book_id,
    title: chapter.title,
    pdf_path: chapter.pdf_path,
    page_count: chapter.page_count,
    chapter_index: chapter.chapter_index,
    created_at: chapter.created_at,
  };
}

export async function deleteChapter(id) {
  const chapter = await prisma.chapter.delete({
    where: { id: Number(id) },
  });
  return {
    id: chapter.id,
    book_id: chapter.book_id,
    title: chapter.title,
    pdf_path: chapter.pdf_path,
    page_count: chapter.page_count,
    chapter_index: chapter.chapter_index,
    created_at: chapter.created_at,
  };
}

export async function countCategories() {
  return prisma.category.count();
}

export async function countBooks() {
  return prisma.book.count();
}

export async function countChapters() {
  return prisma.chapter.count();
}

export async function getRecentBooks(limit = 5) {
  const books = await prisma.book.findMany({
    orderBy: { created_at: "desc" },
    take: limit,
    include: {
      category: {
        select: {
          name: true,
        },
      },
    },
  });

  return books.map((book) => ({
    id: book.id,
    category_id: book.category_id,
    title: book.title,
    author: book.author,
    description: book.description,
    created_at: book.created_at,
    category_name: book.category?.name ?? null,
  }));
}

export async function getRecentChapters(limit = 5) {
  const chapters = await prisma.chapter.findMany({
    orderBy: { created_at: "desc" },
    take: limit,
    include: {
      book: {
        select: {
          title: true,
          category: { select: { name: true } },
        },
      },
    },
  });

  return chapters.map((chapter) => ({
    id: chapter.id,
    book_id: chapter.book_id,
    title: chapter.title,
    pdf_path: chapter.pdf_path,
    page_count: chapter.page_count,
    chapter_index: chapter.chapter_index,
    created_at: chapter.created_at,
    book_title: chapter.book?.title ?? null,
    category_name: chapter.book?.category?.name ?? null,
  }));
}
