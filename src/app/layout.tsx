import type { Metadata } from "next";
import "./globals.css";
import { Header } from "@/ui/Header";

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
      <body>
        <Header />
        {children}
      </body>
    </html>
  );
}
