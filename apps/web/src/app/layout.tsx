import type { Metadata, Viewport } from "next";
import { Analytics } from "@vercel/analytics/react";
import { QueryProvider } from "@/providers/query-provider";
import { AuthProvider } from "@/providers/auth-provider";
import { AuthModal } from "@/components/auth/AuthModal";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import "./globals.css";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://wordsort.app";

export const metadata: Metadata = {
  title: "WordSort",
  description: "A daily sliding-tile puzzle. Slide letters to spell target words — play once a day.",
  metadataBase: new URL(SITE_URL),
  openGraph: {
    title: "WordSort",
    description: "A daily sliding-tile puzzle. Slide letters to spell target words — play once a day.",
    url: SITE_URL,
    siteName: "WordSort",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "WordSort",
    description: "A daily sliding-tile puzzle. Slide letters to spell target words — play once a day.",
  },
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
          <AuthProvider>
            <Header />
            <main className="flex flex-1 flex-col">{children}</main>
            <Footer />
            <AuthModal />
          </AuthProvider>
        </QueryProvider>
        <Analytics />
      </body>
    </html>
  );
}
