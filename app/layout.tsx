
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "HRIS Portfolio",
  description: "Human Resource Information System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
