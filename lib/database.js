import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "library.db");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma("foreign_keys = ON");

db.exec(`
  CREATE TABLE IF NOT EXISTS categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS books (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    category_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    author TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(category_id) REFERENCES categories(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS chapters (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    book_id INTEGER NOT NULL,
    title TEXT NOT NULL,
    pdf_path TEXT NOT NULL,
    page_count INTEGER DEFAULT 0,
    chapter_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(book_id) REFERENCES books(id) ON DELETE CASCADE
  );
`);

export function listCategories() {
  const stmt = db.prepare(`
    SELECT
      c.id,
      c.name,
      c.description,
      c.created_at,
      COUNT(DISTINCT b.id) AS bookCount,
      COUNT(ch.id) AS chapterCount
    FROM categories c
    LEFT JOIN books b ON b.category_id = c.id
    LEFT JOIN chapters ch ON ch.book_id = b.id
    GROUP BY c.id
    ORDER BY c.created_at DESC
  `);
  return stmt.all();
}

export function getCategory(id) {
  const stmt = db.prepare(`
    SELECT id, name, description, created_at
    FROM categories
    WHERE id = ?
  `);
  return stmt.get(id);
}

export function createCategory({ name, description }) {
  const stmt = db.prepare(`
    INSERT INTO categories (name, description)
    VALUES (?, ?)
  `);
  const info = stmt.run(name, description || null);
  return getCategory(info.lastInsertRowid);
}

export function updateCategory(id, { name, description }) {
  const stmt = db.prepare(`
    UPDATE categories
    SET name = ?, description = ?
    WHERE id = ?
  `);
  stmt.run(name, description || null, id);
  return getCategory(id);
}

export function deleteCategory(id) {
  const stmt = db.prepare(`
    DELETE FROM categories WHERE id = ?
  `);
  return stmt.run(id);
}

export function listBooksForCategory(categoryId) {
  const stmt = db.prepare(`
    SELECT
      b.id,
      b.category_id,
      b.title,
      b.author,
      b.description,
      b.created_at,
      COUNT(ch.id) AS chapterCount
    FROM books b
    LEFT JOIN chapters ch ON ch.book_id = b.id
    WHERE b.category_id = ?
    GROUP BY b.id
    ORDER BY b.created_at DESC
  `);
  return stmt.all(categoryId);
}

export function getBook(id) {
  const stmt = db.prepare(`
    SELECT id, category_id, title, author, description, created_at
    FROM books
    WHERE id = ?
  `);
  return stmt.get(id);
}

export function createBook({ categoryId, title, author, description }) {
  const stmt = db.prepare(`
    INSERT INTO books (category_id, title, author, description)
    VALUES (?, ?, ?, ?)
  `);
  const info = stmt.run(categoryId, title, author || null, description || null);
  return getBook(info.lastInsertRowid);
}

export function updateBook(id, { title, author, description }) {
  const stmt = db.prepare(`
    UPDATE books
    SET title = ?, author = ?, description = ?
    WHERE id = ?
  `);
  stmt.run(title, author || null, description || null, id);
  return getBook(id);
}

export function deleteBook(id) {
  const stmt = db.prepare(`
    DELETE FROM books WHERE id = ?
  `);
  return stmt.run(id);
}

export function listChaptersForBook(bookId) {
  const stmt = db.prepare(`
    SELECT
      id,
      book_id,
      title,
      pdf_path,
      page_count,
      chapter_index,
      created_at
    FROM chapters
    WHERE book_id = ?
    ORDER BY chapter_index ASC, created_at ASC
  `);
  return stmt.all(bookId);
}

export function getChapter(id) {
  const stmt = db.prepare(`
    SELECT
      id,
      book_id,
      title,
      pdf_path,
      page_count,
      chapter_index,
      created_at
    FROM chapters
    WHERE id = ?
  `);
  return stmt.get(id);
}

export function createChapter({
  bookId,
  title,
  pdfPath,
  pageCount,
  chapterIndex,
}) {
  const stmt = db.prepare(`
    INSERT INTO chapters (book_id, title, pdf_path, page_count, chapter_index)
    VALUES (?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    bookId,
    title,
    pdfPath,
    pageCount || 0,
    Number.isFinite(chapterIndex) ? chapterIndex : 0
  );
  return getChapter(info.lastInsertRowid);
}

export function updateChapter(id, { title, pdfPath, pageCount, chapterIndex }) {
  const existing = getChapter(id);
  if (!existing) {
    return null;
  }

  const stmt = db.prepare(`
    UPDATE chapters
    SET title = ?, pdf_path = ?, page_count = ?, chapter_index = ?
    WHERE id = ?
  `);

  stmt.run(
    title ?? existing.title,
    pdfPath ?? existing.pdf_path,
    typeof pageCount === "number" ? pageCount : existing.page_count,
    Number.isFinite(chapterIndex) ? chapterIndex : existing.chapter_index,
    id
  );

  return getChapter(id);
}

export function deleteChapter(id) {
  const stmt = db.prepare(`
    DELETE FROM chapters WHERE id = ?
  `);
  return stmt.run(id);
}

export function countCategories() {
  const stmt = db.prepare(`SELECT COUNT(*) AS count FROM categories`);
  const result = stmt.get();
  return result?.count || 0;
}

export function countBooks() {
  const stmt = db.prepare(`SELECT COUNT(*) AS count FROM books`);
  const result = stmt.get();
  return result?.count || 0;
}

export function countChapters() {
  const stmt = db.prepare(`SELECT COUNT(*) AS count FROM chapters`);
  const result = stmt.get();
  return result?.count || 0;
}

export function getRecentBooks(limit = 5) {
  const stmt = db.prepare(`
    SELECT
      b.id,
      b.title,
      b.author,
      b.created_at,
      c.name AS category_name
    FROM books b
    LEFT JOIN categories c ON c.id = b.category_id
    ORDER BY b.created_at DESC
    LIMIT ?
  `);
  return stmt.all(limit);
}

export function getRecentChapters(limit = 5) {
  const stmt = db.prepare(`
    SELECT
      ch.id,
      ch.title,
      ch.created_at,
      ch.chapter_index,
      b.title AS book_title,
      c.name AS category_name
    FROM chapters ch
    LEFT JOIN books b ON b.id = ch.book_id
    LEFT JOIN categories c ON c.id = b.category_id
    ORDER BY ch.created_at DESC
    LIMIT ?
  `);
  return stmt.all(limit);
}
