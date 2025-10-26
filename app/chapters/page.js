"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const emptyChapterForm = {
  id: null,
  title: "",
  pageCount: "",
  chapterIndex: "",
  file: null,
};

export default function ChaptersPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [books, setBooks] = useState([]);
  const [selectedBookId, setSelectedBookId] = useState(null);
  const [chapters, setChapters] = useState([]);
  const [form, setForm] = useState(emptyChapterForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === selectedCategoryId) || null,
    [categories, selectedCategoryId]
  );

  const selectedBook = useMemo(
    () => books.find((item) => item.id === selectedBookId) || null,
    [books, selectedBookId]
  );

  const resetStatus = () => {
    setError("");
    setMessage("");
  };

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/categories", { cache: "no-store" });
      if (!res.ok) {
        throw new Error("Unable to load categories");
      }
      const data = await res.json();
      const list = data.categories || [];
      setCategories(list);
      if (!list.length) {
        setSelectedCategoryId(null);
        setSelectedBookId(null);
        setBooks([]);
        setChapters([]);
      } else if (
        selectedCategoryId &&
        !list.some((item) => item.id === selectedCategoryId)
      ) {
        setSelectedCategoryId(list[0].id);
      } else if (!selectedCategoryId) {
        setSelectedCategoryId(list[0].id);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load categories");
    } finally {
      setLoading(false);
    }
  }, [selectedCategoryId]);

  const loadBooks = useCallback(
    async (categoryId) => {
      if (!categoryId) {
        setBooks([]);
        setSelectedBookId(null);
        return;
      }
      try {
        setLoading(true);
        const res = await fetch(`/api/categories/${categoryId}/books`, {
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Unable to load books");
        }
        const data = await res.json();
        const list = data.books || [];
        setBooks(list);
        if (!list.length) {
          setSelectedBookId(null);
          setChapters([]);
        } else if (
          selectedBookId &&
          !list.some((book) => book.id === selectedBookId)
        ) {
          setSelectedBookId(list[0].id);
        } else if (!selectedBookId) {
          setSelectedBookId(list[0].id);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load books");
      } finally {
        setLoading(false);
      }
    },
    [selectedBookId]
  );

  const loadChapters = useCallback(async (bookId) => {
    if (!bookId) {
      setChapters([]);
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/books/${bookId}/chapters`, {
        cache: "no-store",
      });
      if (!res.ok) {
        throw new Error("Unable to load chapters");
      }
      const data = await res.json();
      setChapters(data.chapters || []);
      if (form.id && !(data.chapters || []).some((c) => c.id === form.id)) {
        setForm(emptyChapterForm);
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to load chapters");
    } finally {
      setLoading(false);
    }
  }, [form.id]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (selectedCategoryId) {
      loadBooks(selectedCategoryId);
    } else {
      setBooks([]);
      setSelectedBookId(null);
      setChapters([]);
    }
  }, [selectedCategoryId, loadBooks]);

  useEffect(() => {
    if (selectedBookId) {
      loadChapters(selectedBookId);
    } else {
      setChapters([]);
    }
  }, [selectedBookId, loadChapters]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetStatus();
    if (!selectedBookId) {
      setError("Select a book before adding chapters");
      return;
    }
    if (!form.title.trim()) {
      setError("Chapter title is required");
      return;
    }
    if (!form.id && !form.file) {
      setError("PDF upload is required for new chapters");
      return;
    }
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("title", form.title.trim());
      if (form.pageCount) {
        formData.append("pageCount", form.pageCount);
      }
      if (form.chapterIndex) {
        formData.append("chapterIndex", form.chapterIndex);
      }
      if (form.file) {
        formData.append("pdf", form.file);
      }

      const url = form.id
        ? `/api/chapters/${form.id}`
        : `/api/books/${selectedBookId}/chapters`;
      const method = form.id ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        body: formData,
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unable to save chapter");
      }
      setMessage(form.id ? "Chapter updated" : "Chapter created");
      setForm(emptyChapterForm);
      await loadChapters(selectedBookId);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save chapter");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    resetStatus();
    if (!window.confirm("Delete this chapter? This action cannot be undone.")) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/chapters/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unable to delete chapter");
      }
      setMessage("Chapter deleted");
      await loadChapters(selectedBookId);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete chapter");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (chapter) => {
    setForm({
      id: chapter.id,
      title: chapter.title,
      pageCount: chapter.page_count ? String(chapter.page_count) : "",
      chapterIndex: Number.isFinite(chapter.chapter_index)
        ? String(chapter.chapter_index)
        : "",
      file: null,
    });
    resetStatus();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Chapters</h2>
          <p className="text-sm text-slate-600">
            Upload PDF files for each chapter and manage metadata like order and
            page counts.
          </p>
        </div>
        <div className="text-sm text-slate-500">
          {selectedBook
            ? `${chapters.length} chapters in ${selectedBook.title}`
            : "Select a book"}
        </div>
      </div>

      {(error || message) && (
        <div>
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
              {error}
            </div>
          )}
          {message && (
            <div className="mt-2 rounded-md border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
              {message}
            </div>
          )}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[260px_260px_1fr] lg:grid-cols-[220px_220px_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Categories
          </h3>
          <div className="mt-4 space-y-2 text-sm">
            {categories.map((category) => {
              const active = category.id === selectedCategoryId;
              return (
                <button
                  key={category.id}
                  type="button"
                  onClick={() => setSelectedCategoryId(category.id)}
                  className={`w-full rounded-md px-3 py-2 text-left font-medium transition ${
                    active
                      ? "bg-blue-600 text-white shadow"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {category.name}
                </button>
              );
            })}
            {!categories.length && (
              <p className="rounded-md border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-500">
                Create categories first to assign books and chapters.
              </p>
            )}
          </div>
        </aside>

        <aside className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Books
          </h3>
          <div className="mt-4 space-y-2 text-sm">
            {books.map((book) => {
              const active = book.id === selectedBookId;
              return (
                <button
                  key={book.id}
                  type="button"
                  onClick={() => setSelectedBookId(book.id)}
                  className={`w-full rounded-md px-3 py-2 text-left font-medium transition ${
                    active
                      ? "bg-emerald-600 text-white shadow"
                      : "text-slate-600 hover:bg-slate-100"
                  }`}
                >
                  {book.title}
                </button>
              );
            })}
            {!books.length && selectedCategoryId && (
              <p className="rounded-md border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-500">
                No books in this category. Add at least one to manage chapters.
              </p>
            )}
            {!selectedCategoryId && (
              <p className="rounded-md border border-dashed border-slate-200 px-3 py-6 text-center text-xs text-slate-500">
                Select a category to view books.
              </p>
            )}
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                {form.id ? "Update Chapter" : "Create Chapter"}
              </h3>
              {selectedBook && (
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  {selectedBook.title}
                </span>
              )}
            </div>
            <form
              onSubmit={handleSubmit}
              className="mt-4 space-y-4"
              encType="multipart/form-data"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Title
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, title: event.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Chapter name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    PDF File
                  </label>
                  <input
                    type="file"
                    accept="application/pdf"
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        file: event.target.files?.[0] || null,
                      }))
                    }
                    className="mt-1 block w-full text-sm text-slate-600 file:mr-4 file:rounded-md file:border-0 file:bg-indigo-50 file:px-3 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
                  />
                  {form.id && (
                    <p className="mt-1 text-xs text-slate-500">
                      Leave blank to keep the current PDF.
                    </p>
                  )}
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Page Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={form.pageCount}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        pageCount: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={form.chapterIndex}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        chapterIndex: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Optional"
                  />
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    disabled={loading || !selectedBookId}
                    className="w-full rounded-md bg-indigo-600 px-3 py-2 text-sm font-medium text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-400"
                  >
                    {form.id ? "Save Changes" : "Add Chapter"}
                  </button>
                </div>
              </div>
              {form.id && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setForm(emptyChapterForm)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                </div>
              )}
            </form>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Chapters List
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Manage chapter order and view uploaded files.
            </p>
            <div className="mt-4 space-y-3">
              {chapters.map((chapter) => (
                <article
                  key={chapter.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-indigo-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {chapter.title}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Order: {chapter.chapter_index ?? "—"} · Pages:{" "}
                        {chapter.page_count ?? "—"}
                      </p>
                      <a
                        href={chapter.pdf_path}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-block text-xs font-medium text-indigo-600 hover:underline"
                      >
                        View PDF
                      </a>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(chapter)}
                        className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(chapter.id)}
                        className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {!chapters.length && selectedBookId && (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  No chapters uploaded yet. Use the form above to add one.
                </div>
              )}
              {!selectedBookId && (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  Select a book to manage its chapters.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
