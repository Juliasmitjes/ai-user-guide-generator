import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Work instruction generator",
  description:
  "Generate role-specific work instructions from screenshots for your organisation's tools.",
  openGraph: {
  title: "Work instruction generator",
  description:
  "Generate role-specific work instructions from screenshots for your organisation's tools.",
  type: "website",
}}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
