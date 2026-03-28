"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

interface SlideContent {
  slideNumber: number;
  title: string;
  subtitle?: string;
  bullets: string[];
  speakerNotes: string;
}

interface FullDeck {
  companyName: string;
  tagline: string;
  slides: SlideContent[];
}

function SuccessContent() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const [deck, setDeck] = useState<FullDeck | null>(null);
  const [pptxBase64, setPptxBase64] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeSlide, setActiveSlide] = useState(0);
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!sessionId) {
      setLoading(false);
      setError("No session ID found. Please return to the main page.");
      return;
    }

    let fallbackData: { businessIdea?: string; targetAudience?: string; stage?: string } = {};
    try {
      const stored = sessionStorage.getItem("pitchDeckRequest");
      if (stored) fallbackData = JSON.parse(stored);
    } catch {}

    fetch("/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        sessionId,
        premium: true,
        businessIdea: fallbackData.businessIdea,
        targetAudience: fallbackData.targetAudience,
        stage: fallbackData.stage,
      }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) {
          setError(data.error);
        } else {
          setDeck(data.deck);
          setPptxBase64(data.pptxBase64);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to generate your pitch deck. Please contact support.");
        setLoading(false);
      });
  }, [sessionId]);

  const handleDownload = async () => {
    if (!pptxBase64 || !deck) return;
    setDownloading(true);
    try {
      const res = await fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ pptxBase64, companyName: deck.companyName }),
      });
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${deck.companyName.replace(/[^a-zA-Z0-9]/g, "-")}-pitch-deck.pptx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      setError("Download failed. Please try again.");
    }
    setDownloading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 mx-auto mb-4 text-purple-500" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          <p className="text-lg font-semibold text-white">Generating your pitch deck...</p>
          <p className="text-sm text-gray-500 mt-1">This takes about 30-60 seconds. Hang tight.</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-950 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-4xl mb-2 text-green-400">{"\u2713"}</div>
          <h1 className="text-3xl font-bold text-white">Payment Successful!</h1>
          <p className="text-gray-400 mt-2">
            Your investor-ready pitch deck is ready below.
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-6 text-center mb-8">
            <p className="text-red-300 font-medium">{error}</p>
            <p className="text-sm text-gray-400 mt-2">
              Session ID: <code className="bg-gray-800 px-2 py-1 rounded text-xs text-gray-300">{sessionId}</code>
            </p>
            <p className="text-sm text-gray-500 mt-2">
              Email <a href="mailto:mudcrabwarrior@gmail.com" className="text-purple-400 underline">mudcrabwarrior@gmail.com</a> with your session ID for support.
            </p>
          </div>
        )}

        {deck && (
          <div className="space-y-8">
            {/* Download Button - Prominent */}
            <div className="bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-6 text-center">
              <h2 className="text-xl font-bold text-white mb-2">{deck.companyName}</h2>
              <p className="text-purple-400 mb-4">{deck.tagline}</p>
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-bold text-lg hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25 disabled:opacity-50"
              >
                {downloading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Downloading...
                  </span>
                ) : (
                  "\uD83D\uDCE5 Download PPTX File"
                )}
              </button>
              <p className="text-xs text-gray-500 mt-3">
                Opens in PowerPoint, Google Slides, or Keynote
              </p>
            </div>

            {/* Slide Preview */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Slide Preview</h3>

              {/* Slide tabs */}
              <div className="flex gap-2 mb-4 flex-wrap">
                {deck.slides.map((slide, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      activeSlide === i
                        ? "bg-purple-600 text-white"
                        : "bg-gray-800 text-gray-400 hover:bg-gray-700"
                    }`}
                  >
                    {slide.slideNumber}
                  </button>
                ))}
              </div>

              {/* Active slide preview */}
              {deck.slides[activeSlide] && (
                <div className="bg-gray-800/50 border border-gray-700 rounded-xl p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="bg-purple-500/20 text-purple-400 rounded-lg w-8 h-8 flex items-center justify-center text-sm font-bold">
                      {deck.slides[activeSlide].slideNumber}
                    </span>
                    <h4 className="text-xl font-bold text-white">
                      {deck.slides[activeSlide].title}
                    </h4>
                  </div>

                  {deck.slides[activeSlide].subtitle && (
                    <p className="text-blue-400 mb-4">{deck.slides[activeSlide].subtitle}</p>
                  )}

                  {deck.slides[activeSlide].bullets.length > 0 && (
                    <ul className="space-y-2 mb-4">
                      {deck.slides[activeSlide].bullets.map((bullet, j) => (
                        <li key={j} className="flex gap-3 text-gray-300">
                          <span className="text-purple-400 mt-1">{"\u2022"}</span>
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {deck.slides[activeSlide].speakerNotes && (
                    <div className="mt-4 pt-4 border-t border-gray-700">
                      <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">
                        Speaker Notes
                      </p>
                      <p className="text-sm text-gray-400 italic">
                        {deck.slides[activeSlide].speakerNotes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Second Download CTA */}
            <div className="text-center">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="px-6 py-3 bg-gray-800 border border-gray-700 rounded-xl text-white font-medium hover:bg-gray-700 transition-all"
              >
                {downloading ? "Downloading..." : "\uD83D\uDCE5 Download PPTX Again"}
              </button>
            </div>

            {/* Cross-promotion */}
            <div className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
              <p className="text-gray-400 mb-3">Need a cover letter too?</p>
              <a
                href="https://cover-letter-ai-eight.vercel.app"
                className="text-purple-400 font-medium hover:text-purple-300 transition-colors"
              >
                Try our AI Cover Letter Generator \u2192
              </a>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

export default function SuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-950">
          <p className="text-lg font-semibold text-white">Loading...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
