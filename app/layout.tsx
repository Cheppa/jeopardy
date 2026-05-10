import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Jeopardy Game Tool",
  description: "A game master tool for running Jeopardy games",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="bg-[var(--background)]">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
