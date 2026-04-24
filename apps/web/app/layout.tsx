import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "WrapReadyAI – Artwork Prep for Wrap Shops",
  description: "Submit an image. Get a wrap-ready file. Optimized at 120 DPI for large-format print.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#0B0F14] text-white" style={{ fontFamily: "Inter, system-ui, -apple-system, sans-serif" }}>{children}</body>
    </html>
  );
}
