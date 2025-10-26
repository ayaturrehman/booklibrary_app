"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

const emptyBookForm = {
  id: null,
  title: "",
  author: "",
  description: "",
};

export default function BooksPage() {
  const [categories, setCategories] = useState([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState(null);
  const [books, setBooks] = useState([]);
  const [form, setForm] = useState(emptyBookForm);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const selectedCategory = useMemo(
    () => categories.find((item) => item.id === selectedCategoryId) || null,
    [categories, selectedCategoryId]
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
        setBooks([]);
      } else if (
        selectedCategoryId &&
        !list.some((category) => category.id === selectedCategoryId)
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
        if (form.id && !list.some((book) => book.id === form.id)) {
          setForm(emptyBookForm);
        }
      } catch (err) {
        console.error(err);
        setError(err.message || "Failed to load books");
      } finally {
        setLoading(false);
      }
    },
    [form.id]
  );

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    if (selectedCategoryId) {
      loadBooks(selectedCategoryId);
    } else {
      setBooks([]);
    }
  }, [selectedCategoryId, loadBooks]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    resetStatus();
    if (!selectedCategoryId) {
      setError("Select a category before creating a book");
      return;
    }
    if (!form.title.trim()) {
      setError("Book title is required");
      return;
    }
    try {
      setLoading(true);
      const method = form.id ? "PUT" : "POST";
      const url = form.id
        ? `/api/books/${form.id}`
        : `/api/categories/${selectedCategoryId}/books`;
      const payload = {
        title: form.title.trim(),
        author: form.author.trim(),
        description: form.description.trim(),
      };
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unable to save book");
      }
      setMessage(form.id ? "Book updated" : "Book created");
      setForm(emptyBookForm);
      await loadBooks(selectedCategoryId);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to save book");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    resetStatus();
    if (
      !window.confirm(
        "Delete this book? Related chapters will also be removed."
      )
    ) {
      return;
    }
    try {
      setLoading(true);
      const res = await fetch(`/api/books/${id}`, { method: "DELETE" });
      if (!res.ok && res.status !== 204) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Unable to delete book");
      }
      setMessage("Book deleted");
      if (form.id === id) {
        setForm(emptyBookForm);
      }
      await loadBooks(selectedCategoryId);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete book");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (book) => {
    setForm({
      id: book.id,
      title: book.title,
      author: book.author || "",
      description: book.description || "",
    });
    resetStatus();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-slate-900">Books</h2>
          <p className="text-sm text-slate-600">
            Assign each book to a category so readers can find content quickly.
          </p>
        </div>
        <div className="text-sm text-slate-500">
          {selectedCategory
            ? `${selectedCategory.bookCount} books in ${selectedCategory.name}`
            : "Select a category"}
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

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
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
                No categories yet. Create one first.
              </p>
            )}
          </div>
        </aside>

        <section className="space-y-6">
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-slate-900">
                {form.id ? "Update Book" : "Create Book"}
              </h3>
              {selectedCategory && (
                <span className="text-xs uppercase tracking-wide text-slate-500">
                  {selectedCategory.name}
                </span>
              )}
            </div>
            <form onSubmit={handleSubmit} className="mt-4 space-y-4">
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
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                  placeholder="Book title"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Author
                  </label>
                  <input
                    type="text"
                    value={form.author}
                    onChange={(event) =>
                      setForm((prev) => ({ ...prev, author: event.target.value }))
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Optional"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">
                    Description
                  </label>
                  <input
                    type="text"
                    value={form.description}
                    onChange={(event) =>
                      setForm((prev) => ({
                        ...prev,
                        description: event.target.value,
                      }))
                    }
                    className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                    placeholder="Optional"
                  />
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={loading || !selectedCategoryId}
                  className="flex-1 rounded-md bg-emerald-600 px-3 py-2 text-sm font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-emerald-400"
                >
                  {form.id ? "Save Changes" : "Add Book"}
                </button>
                {form.id && (
                  <button
                    type="button"
                    onClick={() => setForm(emptyBookForm)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                )}
              </div>
            </form>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-slate-900">
              Books in Category
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Edit or delete books. Chapters linked to a book will move with it.
            </p>
            <div className="mt-4 space-y-3">
              {books.map((book) => (
                <article
                  key={book.id}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-4 transition hover:border-emerald-300"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="text-base font-semibold text-slate-900">
                        {book.title}
                      </p>
                      {book.author ? (
                        <p className="mt-1 text-xs uppercase tracking-wide text-slate-500">
                          {book.author}
                        </p>
                      ) : null}
                      {book.description ? (
                        <p className="mt-2 text-sm text-slate-600">
                          {book.description}
                        </p>
                      ) : null}
                      <p className="mt-2 text-xs text-slate-500">
                        {book.chapterCount} chapters
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <button
                        type="button"
                        onClick={() => handleEdit(book)}
                        className="rounded-md border border-slate-200 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-100"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(book.id)}
                        className="rounded-md border border-red-200 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              {!books.length && selectedCategoryId && (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  No books in this category yet. Use the form above to create one.
                </div>
              )}
              {!selectedCategoryId && (
                <div className="rounded-lg border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-500">
                  Select a category to view its books.
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
