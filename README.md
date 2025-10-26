# Book Library Admin

Next.js admin portal and REST API for managing a digital book library. Admins can organise categories, books, and chapters (with PDF uploads) through the web console, while a Flutter client consumes public read-only endpoints to browse the catalogue.

## Features
- SQLite data store via `better-sqlite3` for local persistence.
- Category → Book → Chapter hierarchy with cascaded deletes and PDF file storage under `public/uploads/chapters`.
- Admin dashboard with dedicated CRUD pages for categories, books, and chapters; PDF upload and chapter ordering supported.
- Simple session-based authentication (email/password from environment variables) with middleware protection.
- Public read-only API routes for the Flutter app to fetch categories, books, and chapters.

## Requirements
- Node.js 18+
- npm (or another Node package manager)

## Local Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Create `.env.local` in the project root and configure admin credentials (use your own secure values; the example below is only illustrative):
   ```env
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=library123
   AUTH_SECRET=replace-with-long-random-value
   ```
3. Run the dev server:
   ```bash
   npm run dev
   ```
4. Visit `http://localhost:3000/login`, sign in with the configured credentials, and manage the library.

Uploaded PDFs are stored on disk at `public/uploads/chapters`. The repository keeps the directory (via `.gitignore`) but ignores individual files.

## API Reference

### Auth (protected)
| Method | Route | Description |
| --- | --- | --- |
| `POST` | `/api/auth/login` | `{ email, password }` → sets admin session cookie |
| `POST` | `/api/auth/logout` | Clears session cookie |

### Admin APIs (require session cookie)
| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/categories` | List categories with counts |
| `POST` | `/api/categories` | Create category |
| `GET` | `/api/categories/:categoryId` | Category detail + books |
| `PUT` | `/api/categories/:categoryId` | Update category |
| `DELETE` | `/api/categories/:categoryId` | Delete category (cascade) |
| `GET` | `/api/categories/:categoryId/books` | Books in category |
| `POST` | `/api/categories/:categoryId/books` | Create book |
| `GET` | `/api/books/:bookId` | Book detail + chapters |
| `PUT` | `/api/books/:bookId` | Update book |
| `DELETE` | `/api/books/:bookId` | Delete book (cascade) |
| `GET` | `/api/books/:bookId/chapters` | Chapters in book |
| `POST` | `/api/books/:bookId/chapters` | Create chapter (multipart) |
| `GET` | `/api/chapters/:chapterId` | Chapter detail |
| `PUT` | `/api/chapters/:chapterId` | Update chapter (JSON or multipart) |
| `DELETE` | `/api/chapters/:chapterId` | Delete chapter and PDF |

### Public APIs (no auth, for Flutter)
| Method | Route | Description |
| --- | --- | --- |
| `GET` | `/api/public/categories` | List categories with aggregate counts |
| `GET` | `/api/public/categories/:categoryId` | Category detail + books |
| `GET` | `/api/public/books/:bookId` | Book detail + chapters |
| `GET` | `/api/public/chapters/:chapterId` | Chapter detail |

Responses mirror the admin APIs. Chapter objects include `pdf_path`, which is a publicly accessible URL the Flutter app can download.

## Development Notes
- Database file lives at `data/library.db`. Delete it to reset data.
- Middleware guards all pages/APIs except `/login`, `/api/auth/*`, `/api/public/*`, and static assets.
- Update the public API policy once the Flutter app is authenticated—these endpoints are intended as temporary read-only access.

## Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint check |

---
Planned next steps include integrating full auth for the Flutter app, adding analytics, and expanding sharing features on the mobile side. Contributions are welcome! ⭐
