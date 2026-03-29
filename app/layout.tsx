import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Pitch Deck Generator — AI-Powered Investor Decks | Velocity Forge",
  description:
    "Turn your startup idea into a 10-slide investor pitch deck in under 60 seconds. Professional PPTX with market sizing, financials, and speaker notes. Free outline, full deck $12.99.",
  keywords:
    "pitch deck generator, AI pitch deck, startup pitch deck, investor presentation, pitch deck template, AI presentation maker",
  openGraph: {
    title: "Pitch Deck Generator — Velocity Forge",
    description:
      "Turn your startup idea into a 10-slide investor pitch deck. AI-powered. Download as PPTX.",
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
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
