# Book Library Admin

Next.js admin portal and REST API for managing a digital book library. Admins can organise categories, books, and chapters (with PDF uploads) through the web console, while a Flutter client consumes public read-only endpoints to browse the catalogue. Data is persisted with **Vercel Postgres** using **Prisma**, and PDFs are stored in **Vercel Blob**, making the app deployable on Vercel without extra infrastructure.

## Features
- Vercel Postgres data store accessed through Prisma.
- Category → Book → Chapter hierarchy with cascaded deletes and PDF files stored in Vercel Blob.
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
2. Provision Vercel Postgres and Vercel Blob for your project (Vercel dashboard ▸ Storage ▸ Add).

3. Create `.env.local` in the project root and configure credentials and storage tokens (use your own secure values; the values below are placeholders). `DATABASE_URL` should be the **direct / non-pooled** connection string from Vercel Postgres (labelled `POSTGRES_URL_NON_POOLING` in the dashboard).
   ```env
   ADMIN_EMAIL=admin@example.com
   ADMIN_PASSWORD=library123
   AUTH_SECRET=replace-with-long-random-value
   DATABASE_URL=postgres://user:password@host:5432/dbname
   BLOB_READ_WRITE_TOKEN=vercel_blob_token
   ```
   Sync those variables to Vercel with `vercel env pull` / `vercel env push`.

4. Apply the schema and optional seed data (requires `DATABASE_URL`):
   ```bash
   npm run db:migrate
   npm run db:seed   # optional sample content
   ```

5. Run the dev server:
   ```bash
   npm run dev
   ```
6. Visit `http://localhost:3000/login`, sign in with the configured credentials, and manage the library.

Uploaded PDFs are stored in Vercel Blob; the API responds with the public URL which the Flutter app can open directly.

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

Responses mirror the admin APIs. Chapter objects include `pdf_path`, which is a Vercel Blob URL the Flutter app can download.

## Development Notes
- Schema is created automatically on cold start if missing, but you should manage migrations using your preferred tooling for Postgres in production.
- Authentication requires the admin env vars; requests fail with 500 if they are not set.
- Proxy guards all pages/APIs except `/login`, `/api/auth/*`, `/api/public/*`, and static assets.
- Update the public API policy once the Flutter app is authenticated—these endpoints are intended as temporary read-only access.

## Scripts
| Command | Description |
| --- | --- |
| `npm run dev` | Start dev server |
| `npm run build` | Production build |
| `npm run start` | Run production server |
| `npm run lint` | ESLint check |
| `npm run db:migrate` | Ensure database schema exists |
| `npm run db:seed` | Insert sample categories/books/chapters |

---
Planned next steps include integrating full auth for the Flutter app, adding analytics, and expanding sharing features on the mobile side. Contributions are welcome! ⭐
