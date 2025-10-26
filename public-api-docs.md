# 📘 Public API Documentation example

## **GET** `/api/public/categories`

```json
{
  "categories": [
    {
      "id": 2,
      "name": "math",
      "description": null,
      "created_at": "2025-10-26 19:26:35",
      "bookCount": 1,
      "chapterCount": 1
    },
    {
      "id": 1,
      "name": "Science",
      "description": null,
      "created_at": "2025-10-26 19:09:46",
      "bookCount": 0,
      "chapterCount": 0
    }
  ]
}
```

---

## **GET** `/api/public/categories/:categoryId`

```json
{
  "category": {
    "id": 2,
    "name": "math",
    "description": null,
    "created_at": "2025-10-26 19:26:35"
  },
  "books": [
    {
      "id": 1,
      "category_id": 2,
      "title": "text book",
      "author": null,
      "description": null,
      "created_at": "2025-10-26 19:29:43",
      "chapterCount": 1
    }
  ]
}
```

---

## **GET** `/api/public/books/:bookId`

```json
{
  "book": {
    "id": 1,
    "category_id": 2,
    "title": "text book",
    "author": null,
    "description": null,
    "created_at": "2025-10-26 19:29:43"
  },
  "chapters": [
    {
      "id": 1,
      "book_id": 1,
      "title": "Chapter 1",
      "pdf_path": "/uploads/chapters/1761507027761-power-of-attorney-for-vehicle-sale.pdf",
      "page_count": 0,
      "chapter_index": 0,
      "created_at": "2025-10-26 19:30:27"
    }
  ]
}
```

---

## **GET** `/api/public/chapters/:chapterId`

```json
{
  "chapter": {
    "id": 1,
    "book_id": 1,
    "title": "Chapter 1",
    "pdf_path": "/uploads/chapters/1761507027761-power-of-attorney-for-vehicle-sale.pdf",
    "page_count": 0,
    "chapter_index": 0,
    "created_at": "2025-10-26 19:30:27"
  }
}
```
