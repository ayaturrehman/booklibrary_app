import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

dotenv.config({ path: ".env.local" });
dotenv.config();

const prisma = new PrismaClient();

const demoData = [
  {
    name: "Science",
    description: "Research papers and scientific literature.",
    books: [
      {
        title: "Physics Basics",
        author: "A. Einstein",
        description: "Introductory physics concepts.",
        chapters: [
          {
            title: "Classical Mechanics",
            pdf_path: "https://example.com/placeholder.pdf",
            page_count: 42,
            chapter_index: 1,
          },
        ],
      },
    ],
  },
  {
    name: "History",
    description: "Historical documents and archives.",
    books: [
      {
        title: "Ancient Civilizations",
        author: "H. Historian",
        description: "A dive into early societies.",
        chapters: [
          {
            title: "Mesopotamia",
            pdf_path: "https://example.com/placeholder.pdf",
            page_count: 30,
            chapter_index: 1,
          },
        ],
      },
    ],
  },
];

async function main() {
  const existing = await prisma.category.count();
  if (existing > 0) {
    console.log("Database already contains categories; skipping seed.");
    return;
  }

  for (const category of demoData) {
    const createdCategory = await prisma.category.create({
      data: {
        name: category.name,
        description: category.description,
        books: {
          create: category.books.map((book) => ({
            title: book.title,
            author: book.author,
            description: book.description,
            chapters: {
              create: book.chapters.map((chapter) => ({
                title: chapter.title,
                pdf_path: chapter.pdf_path,
                page_count: chapter.page_count,
                chapter_index: chapter.chapter_index,
              })),
            },
          })),
        },
      },
    });

    console.log(`Inserted category ${createdCategory.name}`);
  }
}

main()
  .then(() => console.log("Seed data inserted."))
  .catch((error) => {
    console.error("Seeding failed:", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
