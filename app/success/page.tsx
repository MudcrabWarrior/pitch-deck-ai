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

// --- Icons ---
function DownloadIcon({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2v8.5M4.5 7L8 10.5 11.5 7M3 13h10" />
    </svg>
  );
}

function Spinner({ className = "w-4 h-4", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={`animate-spin-slow ${className}`} style={style} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.15" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckCircle() {
  return (
    <svg className="w-8 h-8" viewBox="0 0 32 32" fill="none">
      <circle cx="16" cy="16" r="15" stroke="var(--success)" strokeWidth="1.5" opacity="0.3" />
      <circle cx="16" cy="16" r="11" fill="var(--success-surface)" />
      <path d="M11.5 16.5l3 3 6.5-6.5" stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowRight({ className = "w-3.5 h-3.5" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.333 8h9.334M8.667 4l4 4-4 4" />
    </svg>
  );
}

// --- Loading State ---
function LoadingState() {
  return (
    <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="text-center max-w-xs">
        <Spinner className="w-8 h-8 mx-auto mb-4" style={{ color: 'var(--accent-light)' }} />
        <p className="text-sm font-medium mb-1" style={{ color: 'var(--text-primary)' }}>Building your pitch deck</p>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
          This takes 30&ndash;60 seconds. We&apos;re generating slides, market data, and speaker notes.
        </p>
        <div className="mt-6 w-full h-1 rounded-full overflow-hidden" style={{ background: 'var(--surface)' }}>
          <div className="h-full rounded-full shimmer" style={{ background: 'var(--accent)', width: '60%', animation: 'loading-bar 2s ease-in-out infinite' }} />
        </div>
        <style jsx>{`
          @keyframes loading-bar {
            0% { width: 10%; }
            50% { width: 70%; }
            100% { width: 10%; }
          }
        `}</style>
      </div>
    </div>
  );
}

// --- Main Content ---
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

  if (loading) return <LoadingState />;

  const currentSlide = deck?.slides[activeSlide];

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: 'rgba(9,9,11,0.8)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ background: 'var(--accent)' }}>
              VF
            </div>
            Velocity Forge
          </a>
          <a href="/" className="text-xs font-medium flex items-center gap-1 transition-colors" style={{ color: 'var(--text-muted)' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
            Generate another deck
            <ArrowRight className="w-3 h-3" />
          </a>
        </div>
      </nav>

      <div className="max-w-3xl mx-auto px-6 py-10">
        {/* Success header */}
        <div className="mb-8 animate-fade-up">
          <div className="flex items-center gap-3 mb-3">
            <CheckCircle />
            <div>
              <p className="text-xs font-medium" style={{ color: 'var(--success)' }}>Payment confirmed</p>
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Your deck is ready to download</p>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg p-4 mb-8 animate-fade-up" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)' }}>
            <p className="text-sm font-medium mb-1" style={{ color: '#fca5a5' }}>{error}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Session: <code className="font-mono text-[11px] px-1.5 py-0.5 rounded" style={{ background: 'var(--surface)' }}>{sessionId}</code>
            </p>
            <p className="text-xs mt-2" style={{ color: 'var(--text-muted)' }}>
              Email <a href="mailto:mudcrabwarrior@gmail.com" className="underline" style={{ color: 'var(--accent-light)' }}>support</a> with your session ID.
            </p>
          </div>
        )}

        {deck && (
          <div className="space-y-6 animate-fade-up" style={{ animationDelay: '100ms' }}>
            {/* Download card */}
            <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-lg font-bold" style={{ color: 'var(--text-primary)' }}>{deck.companyName}</h1>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{deck.tagline} &middot; {deck.slides.length} slides</p>
                </div>
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className="h-10 px-5 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-all disabled:opacity-50 flex-shrink-0"
                  style={{ background: 'var(--accent)' }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
                >
                  {downloading ? (
                    <><Spinner className="w-3.5 h-3.5" /> Downloading...</>
                  ) : (
                    <><DownloadIcon /> Download .pptx</>
                  )}
                </button>
              </div>
            </div>

            {/* Slide navigator */}
            <div className="rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
              {/* Tab bar */}
              <div className="flex items-center gap-0.5 px-3 py-2 overflow-x-auto" style={{ background: 'var(--surface)', borderBottom: '1px solid var(--border-subtle)' }}>
                <span className="text-[10px] font-medium mr-2 flex-shrink-0" style={{ color: 'var(--text-muted)' }}>SLIDES</span>
                {deck.slides.map((slide, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveSlide(i)}
                    className="w-7 h-7 rounded text-[11px] font-mono font-medium flex items-center justify-center transition-all flex-shrink-0"
                    style={{
                      background: activeSlide === i ? 'var(--accent)' : 'transparent',
                      color: activeSlide === i ? 'white' : 'var(--text-muted)',
                    }}
                    onMouseEnter={e => { if (activeSlide !== i) e.currentTarget.style.background = 'var(--surface-elevated)'; }}
                    onMouseLeave={e => { if (activeSlide !== i) e.currentTarget.style.background = 'transparent'; }}
                  >
                    {slide.slideNumber}
                  </button>
                ))}
              </div>

              {/* Slide content */}
              {currentSlide && (
                <div className="p-5" style={{ background: 'var(--bg)' }}>
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-mono text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ background: 'var(--accent-surface)', color: 'var(--accent-light)' }}>
                        {String(currentSlide.slideNumber).padStart(2, '0')}
                      </span>
                      <h2 className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>{currentSlide.title}</h2>
                    </div>
                    {currentSlide.subtitle && (
                      <p className="text-sm ml-8" style={{ color: 'var(--text-secondary)' }}>{currentSlide.subtitle}</p>
                    )}
                  </div>

                  {currentSlide.bullets.length > 0 && (
                    <ul className="space-y-2 mb-5 ml-8">
                      {currentSlide.bullets.map((bullet, j) => (
                        <li key={j} className="flex gap-2.5 text-sm leading-relaxed" style={{ color: 'var(--text-secondary)' }}>
                          <span className="mt-2 flex-shrink-0 w-1 h-1 rounded-full" style={{ background: 'var(--accent-light)' }} />
                          <span>{bullet}</span>
                        </li>
                      ))}
                    </ul>
                  )}

                  {currentSlide.speakerNotes && (
                    <div className="ml-8 rounded-lg p-3.5" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
                      <p className="text-[10px] font-medium uppercase tracking-wider mb-1.5" style={{ color: 'var(--text-muted)' }}>
                        Speaker notes
                      </p>
                      <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>
                        {currentSlide.speakerNotes}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Second download */}
            <div className="text-center py-2">
              <button
                onClick={handleDownload}
                disabled={downloading}
                className="text-xs font-medium flex items-center gap-1.5 mx-auto transition-colors"
                style={{ color: 'var(--text-muted)' }}
                onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
                onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}
              >
                <DownloadIcon className="w-3.5 h-3.5" />
                {downloading ? "Downloading..." : "Download .pptx again"}
              </button>
            </div>

            {/* Cross-promotion */}
            <div className="rounded-xl p-4 flex items-center justify-between" style={{ background: 'var(--surface)', border: '1px solid var(--border-subtle)' }}>
              <div>
                <p className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>Looking for a job too?</p>
                <p className="text-[11px]" style={{ color: 'var(--text-muted)' }}>Generate AI-powered cover letters in seconds.</p>
              </div>
              <a
                href="https://cover-letter-ai-one.vercel.app"
                className="text-xs font-medium flex items-center gap-1 flex-shrink-0 transition-colors"
                style={{ color: 'var(--accent-light)' }}
              >
                Try it <ArrowRight className="w-3 h-3" />
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
      fallback={<LoadingState />}
    >
      <SuccessContent />
    </Suspense>
  );
}
