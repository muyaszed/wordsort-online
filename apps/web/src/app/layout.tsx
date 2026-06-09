import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { QueryProvider } from "@/providers/query-provider";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

export const metadata: Metadata = {
  title: "Wordsort",
  description: "Slide the tiles to sort every row into a word",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col bg-slate-50 text-slate-900">
        <QueryProvider>
          <Header />
          <main className="flex flex-1 flex-col">{children}</main>
          <Footer />
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
