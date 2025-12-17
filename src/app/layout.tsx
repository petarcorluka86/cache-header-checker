import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cache Header Checker",
  description: "Check cache headers for a given URL",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
