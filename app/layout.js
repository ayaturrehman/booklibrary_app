import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import AdminShell from "@/components/AdminShell";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Book Library Admin",
  description:
    "Administration portal for managing categories, books, and chapters.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AdminShell>{children}</AdminShell>
      </body>
    </html>
  );
}
