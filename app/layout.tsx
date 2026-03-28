import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Pitch Deck Generator | Investor-Ready Slides in Minutes",
  description:
    "Generate a professional 10-slide pitch deck from your business idea. AI-powered, investor-ready PPTX download. Free outline, premium full deck for $12.99.",
  keywords:
    "pitch deck generator, AI pitch deck, startup pitch deck, investor presentation, pitch deck template, AI presentation maker, business plan slides",
  openGraph: {
    title: "AI Pitch Deck Generator — Investor-Ready in Minutes",
    description:
      "Describe your startup. Get a professional 10-slide pitch deck. Powered by AI.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-950 text-white antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
