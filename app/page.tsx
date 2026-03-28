"use client";

import { useState } from "react";

interface SlideOutline {
  slideNumber: number;
  title: string;
  description: string;
}

interface Outline {
  companyName: string;
  tagline: string;
  slides: SlideOutline[];
}

// --- Icon Components ---
function ArrowRight({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.333 8h9.334M8.667 4l4 4-4 4" />
    </svg>
  );
}

function Spinner({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={`animate-spin-slow ${className}`} viewBox="0 0 24 24" fill="none">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2.5" opacity="0.15" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
    </svg>
  );
}

function CheckIcon({ className = "w-3.5 h-3.5", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 8.5L6.5 11.5L12.5 4.5" />
    </svg>
  );
}

function ChevronDown({ className = "w-4 h-4", style }: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg className={className} style={style} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 6l4 4 4-4" />
    </svg>
  );
}

function FileIcon() {
  return (
    <svg className="w-5 h-5" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11.667 2.5H5.833A1.667 1.667 0 004.167 4.167v11.666A1.667 1.667 0 005.833 17.5h8.334a1.667 1.667 0 001.666-1.667V7.5L11.667 2.5z" />
      <path d="M11.667 2.5V7.5h4.166" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="7" width="8" height="7" rx="1" />
      <path d="M5.5 7V5a2.5 2.5 0 015 0v2" />
    </svg>
  );
}

// --- Main Component ---
export default function Home() {
  const [businessIdea, setBusinessIdea] = useState("");
  const [targetAudience, setTargetAudience] = useState("");
  const [stage, setStage] = useState("Pre-seed / Idea stage");
  const [outline, setOutline] = useState<Outline | null>(null);
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [rateLimited, setRateLimited] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [checkingOut, setCheckingOut] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleGenerate = async () => {
    if (!businessIdea.trim()) return;
    setLoading(true);
    setOutline(null);
    setRateLimited(false);
    setErrorMsg("");
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessIdea, targetAudience, stage }),
      });
      const data = await res.json();
      if (res.status === 429) {
        setRateLimited(true);
        setErrorMsg(data.error);
        setGenerated(true);
      } else if (data.outline) {
        setOutline(data.outline);
        setGenerated(true);
      } else {
        setErrorMsg(data.error || "Something went wrong. Please try again.");
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
    }
    setLoading(false);
  };

  const handleUpgrade = async () => {
    setCheckingOut(true);
    try {
      try {
        sessionStorage.setItem(
          "pitchDeckRequest",
          JSON.stringify({ businessIdea, targetAudience, stage })
        );
      } catch {}
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ businessIdea, targetAudience, stage }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setErrorMsg("Failed to start checkout. Please try again.");
        setCheckingOut(false);
      }
    } catch {
      setErrorMsg("Network error. Please try again.");
      setCheckingOut(false);
    }
  };

  const faqs = [
    { q: "What do I get for free?", a: "A complete 10-slide deck outline with titles, descriptions, and structure tailored to your business. Enough to validate your narrative before committing." },
    { q: "What\u2019s in the full PPTX?", a: "10 professionally written slides with detailed bullet points, market sizing, competitive analysis, financial projections, and speaker notes. Downloads as a .pptx file you can open in PowerPoint, Google Slides, or Keynote." },
    { q: "Can I edit the downloaded file?", a: "Yes. It\u2019s a standard .pptx file. Add your logo, tweak the copy, swap colors \u2014 it\u2019s yours." },
    { q: "Is my idea kept private?", a: "We don\u2019t store your business ideas after generation. Your data is processed securely and never used for training." },
    { q: "Can I get a refund?", a: "Since decks are generated instantly, we can\u2019t offer refunds. If something goes wrong, email us and we\u2019ll sort it out." },
  ];

  return (
    <main className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* ---- NAV ---- */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl" style={{ background: 'rgba(9,9,11,0.8)', borderBottom: '1px solid var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto px-6 h-14 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2 text-sm font-semibold tracking-tight" style={{ color: 'var(--text-primary)' }}>
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold text-white" style={{ background: 'var(--accent)' }}>
              VF
            </div>
            Velocity Forge
          </a>
          <div className="flex items-center gap-5">
            <a href="https://cover-letter-ai-one.vercel.app" className="text-xs font-medium transition-colors" style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              Cover Letters
            </a>
            <a href="mailto:mudcrabwarrior@gmail.com" className="text-xs font-medium transition-colors" style={{ color: 'var(--text-muted)' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              Support
            </a>
          </div>
        </div>
      </nav>

      {/* ---- HERO ---- */}
      <section className="relative pt-20 pb-4 overflow-hidden">
        {/* Background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] rounded-full opacity-[0.07]" style={{ background: 'radial-gradient(ellipse, var(--accent-light), transparent 70%)' }} />

        <div className="relative max-w-2xl mx-auto px-6 text-center">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium mb-6"
            style={{ background: 'var(--accent-surface)', color: 'var(--accent-light)', border: '1px solid var(--accent-border)' }}>
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--accent-light)' }} />
            Now with PPTX download
          </div>

          <h1 className="text-[2.5rem] md:text-5xl font-bold leading-[1.1] tracking-tight mb-4" style={{ color: 'var(--text-primary)' }}>
            Your pitch deck,<br />
            <span style={{ color: 'var(--accent-light)' }}>generated.</span>
          </h1>

          <p className="text-base md:text-lg leading-relaxed max-w-lg mx-auto mb-2" style={{ color: 'var(--text-secondary)' }}>
            Describe your startup. Get a 10-slide investor deck with market sizing, financials, and speaker notes. Download as PowerPoint.
          </p>
        </div>
      </section>

      {/* ---- INPUT FORM ---- */}
      <section className="pb-8">
        <div className="max-w-xl mx-auto px-6">
          <div className="rounded-xl p-5 md:p-6" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                  Describe your business <span style={{ color: 'var(--text-muted)' }}>*</span>
                </label>
                <textarea
                  value={businessIdea}
                  onChange={(e) => setBusinessIdea(e.target.value)}
                  placeholder="e.g., An AI platform that helps restaurants optimize menu pricing using ingredient costs, competition data, and demand patterns..."
                  className="w-full h-28 rounded-lg px-3.5 py-2.5 text-sm placeholder:text-zinc-600 resize-none transition-colors"
                  style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  maxLength={5000}
                  onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-light)'}
                  onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Target investors
                  </label>
                  <input
                    type="text"
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value)}
                    placeholder="e.g., Seed VCs in FoodTech"
                    className="w-full rounded-lg px-3.5 py-2.5 text-sm placeholder:text-zinc-600 transition-colors"
                    style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                    onFocus={e => e.currentTarget.style.borderColor = 'var(--accent-light)'}
                    onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium mb-1.5" style={{ color: 'var(--text-secondary)' }}>
                    Stage
                  </label>
                  <select
                    value={stage}
                    onChange={(e) => setStage(e.target.value)}
                    className="w-full rounded-lg px-3.5 py-2.5 text-sm transition-colors"
                    style={{ background: 'var(--surface-elevated)', border: '1px solid var(--border)', color: 'var(--text-primary)' }}
                  >
                    <option>Pre-seed / Idea stage</option>
                    <option>Seed / MVP built</option>
                    <option>Series A / Product-market fit</option>
                    <option>Series B+ / Scaling</option>
                    <option>Bootstrapped / Profitable</option>
                  </select>
                </div>
              </div>

              <button
                onClick={handleGenerate}
                disabled={loading || !businessIdea.trim()}
                className="w-full h-11 rounded-lg text-sm font-medium text-white flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ background: loading ? 'var(--accent)' : 'var(--accent)', }}
                onMouseEnter={e => { if (!loading) e.currentTarget.style.background = 'var(--accent-light)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--accent)'; }}
              >
                {loading ? (
                  <>
                    <Spinner className="w-4 h-4" />
                    <span>Generating outline...</span>
                  </>
                ) : (
                  <>
                    <span>Generate free outline</span>
                    <ArrowRight />
                  </>
                )}
              </button>
            </div>
          </div>
          <p className="text-center text-[11px] mt-3" style={{ color: 'var(--text-muted)' }}>
            Free tier: 3 outlines per hour. No account required.
          </p>
        </div>
      </section>

      {/* ---- ERROR ---- */}
      {errorMsg && !rateLimited && (
        <div className="max-w-xl mx-auto px-6 pb-6 animate-fade-up">
          <div className="rounded-lg p-3.5 text-sm text-center" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
            {errorMsg}
          </div>
        </div>
      )}

      {/* ---- RATE LIMITED ---- */}
      {rateLimited && (
        <div className="max-w-xl mx-auto px-6 pb-6 animate-fade-up">
          <div className="rounded-lg p-5 text-center" style={{ background: 'rgba(234,179,8,0.06)', border: '1px solid rgba(234,179,8,0.15)' }}>
            <p className="text-sm mb-3" style={{ color: '#fde047' }}>{errorMsg}</p>
            <button
              onClick={handleUpgrade}
              disabled={checkingOut}
              className="h-10 px-5 rounded-lg text-sm font-medium text-white transition-all"
              style={{ background: 'var(--accent)' }}
            >
              Get full deck for $12.99
            </button>
          </div>
        </div>
      )}

      {/* ---- OUTLINE RESULT ---- */}
      {generated && outline && (
        <section className="pb-12 animate-fade-up">
          <div className="max-w-xl mx-auto px-6">
            {/* Header */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full" style={{ background: 'var(--success)' }} />
                <span className="text-xs font-medium" style={{ color: 'var(--success)' }}>Outline generated</span>
              </div>
              <h2 className="text-xl font-bold" style={{ color: 'var(--text-primary)' }}>{outline.companyName}</h2>
              <p className="text-sm" style={{ color: 'var(--text-muted)' }}>{outline.tagline}</p>
            </div>

            {/* Slides */}
            <div className="rounded-xl overflow-hidden stagger-children" style={{ border: '1px solid var(--border)' }}>
              {outline.slides.map((slide, i) => (
                <div key={slide.slideNumber}
                  className="flex gap-3.5 px-4 py-3.5"
                  style={{
                    background: i % 2 === 0 ? 'var(--surface)' : 'transparent',
                    borderBottom: i < outline.slides.length - 1 ? '1px solid var(--border-subtle)' : 'none',
                  }}>
                  <span className="flex-shrink-0 w-6 h-6 rounded text-[11px] font-mono font-medium flex items-center justify-center"
                    style={{ background: 'var(--accent-surface)', color: 'var(--accent-light)', border: '1px solid var(--accent-border)' }}>
                    {slide.slideNumber}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{slide.title}</p>
                    <p className="text-xs mt-0.5 leading-relaxed" style={{ color: 'var(--text-muted)' }}>{slide.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Upsell */}
            <div className="mt-6 rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: 'var(--accent-surface)', border: '1px solid var(--accent-border)' }}>
                  <FileIcon />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>Download the full deck</h3>
                  <p className="text-xs leading-relaxed mb-3" style={{ color: 'var(--text-muted)' }}>
                    10 slides with detailed bullets, market sizing, competitive analysis, financial projections, and speaker notes. Ready to present.
                  </p>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4">
                    {["Detailed content", "Speaker notes", "Market data", "PPTX file"].map(item => (
                      <span key={item} className="flex items-center gap-1 text-[11px]" style={{ color: 'var(--text-secondary)' }}>
                        <CheckIcon className="w-3 h-3" style={{ color: 'var(--accent-light)' }} />
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleUpgrade}
                      disabled={checkingOut}
                      className="h-9 px-4 rounded-lg text-sm font-medium text-white flex items-center gap-2 transition-all disabled:opacity-50"
                      style={{ background: 'var(--accent)' }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-light)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'var(--accent)'}
                    >
                      {checkingOut ? (
                        <><Spinner className="w-3.5 h-3.5" /> Processing...</>
                      ) : (
                        <>Get full deck &mdash; $12.99</>
                      )}
                    </button>
                    <span className="text-[11px] flex items-center gap-1" style={{ color: 'var(--text-muted)' }}>
                      <LockIcon /> One-time payment
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---- HOW IT WORKS (pre-generation) ---- */}
      {!generated && (
        <section className="py-16">
          <div className="max-w-3xl mx-auto px-6">
            <h2 className="text-xs font-medium uppercase tracking-widest mb-8 text-center" style={{ color: 'var(--text-muted)' }}>
              How it works
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-px rounded-xl overflow-hidden" style={{ background: 'var(--border)', border: '1px solid var(--border)' }}>
              {[
                { step: "01", title: "Describe", desc: "Enter your business idea, target investors, and company stage." },
                { step: "02", title: "Generate", desc: "Our AI creates a structured 10-slide narrative optimized for investors." },
                { step: "03", title: "Download", desc: "Get your PPTX file. Edit in PowerPoint, Slides, or Keynote." },
              ].map((item) => (
                <div key={item.step} className="p-5" style={{ background: 'var(--bg)' }}>
                  <span className="font-mono text-xs font-medium mb-2 block" style={{ color: 'var(--accent-light)' }}>{item.step}</span>
                  <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--text-primary)' }}>{item.title}</h3>
                  <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---- WHAT YOU GET ---- */}
      {!generated && (
        <section className="py-8 pb-16">
          <div className="max-w-3xl mx-auto px-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Free column */}
              <div className="rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Free outline</h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-surface)', color: 'var(--accent-light)', border: '1px solid var(--accent-border)' }}>
                    $0
                  </span>
                </div>
                <ul className="space-y-2">
                  {["10-slide structure", "AI-generated titles", "Slide descriptions", "Company naming", "Narrative flow"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <CheckIcon className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent-light)' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Paid column */}
              <div className="rounded-xl p-5 relative" style={{ background: 'var(--surface)', border: '1px solid var(--accent-border)' }}>
                <div className="absolute -top-2.5 right-4">
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full text-white" style={{ background: 'var(--accent)' }}>
                    POPULAR
                  </span>
                </div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>Full PPTX deck</h3>
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ background: 'var(--accent-surface)', color: 'var(--accent-light)', border: '1px solid var(--accent-border)' }}>
                    $12.99
                  </span>
                </div>
                <ul className="space-y-2">
                  {["Everything in Free", "Detailed bullet points", "Speaker notes per slide", "Market sizing & TAM", "Competitive analysis", "Financial projections", "Downloadable .pptx file"].map(item => (
                    <li key={item} className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-secondary)' }}>
                      <CheckIcon className="w-3 h-3 flex-shrink-0" style={{ color: 'var(--accent-light)' }} />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ---- FAQ ---- */}
      <section className="py-12">
        <div className="max-w-xl mx-auto px-6">
          <h2 className="text-xs font-medium uppercase tracking-widest mb-6 text-center" style={{ color: 'var(--text-muted)' }}>
            Questions
          </h2>
          <div className="space-y-px rounded-xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {faqs.map((faq, i) => (
              <div key={i} style={{ background: 'var(--surface)', borderBottom: i < faqs.length - 1 ? '1px solid var(--border-subtle)' : 'none' }}>
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-4"
                >
                  <span className="text-sm font-medium" style={{ color: 'var(--text-primary)' }}>{faq.q}</span>
                  <ChevronDown className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}
                    style={{ color: 'var(--text-muted)' }} />
                </button>
                {openFaq === i && (
                  <div className="px-4 pb-3.5 animate-fade-in">
                    <p className="text-xs leading-relaxed" style={{ color: 'var(--text-muted)' }}>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---- FOOTER ---- */}
      <footer className="py-8" style={{ borderTop: '1px solid var(--border-subtle)' }}>
        <div className="max-w-5xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs" style={{ color: 'var(--text-muted)' }}>
            <div className="w-4 h-4 rounded flex items-center justify-center text-[7px] font-bold text-white" style={{ background: 'var(--accent)' }}>
              VF
            </div>
            Velocity Forge AI
          </div>
          <div className="flex items-center gap-4 text-xs" style={{ color: 'var(--text-muted)' }}>
            <a href="https://cover-letter-ai-one.vercel.app" className="hover:underline transition-colors"
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              Cover Letter Generator
            </a>
            <span style={{ color: 'var(--border)' }}>|</span>
            <a href="mailto:mudcrabwarrior@gmail.com" className="hover:underline transition-colors"
              onMouseEnter={e => e.currentTarget.style.color = 'var(--text-secondary)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-muted)'}>
              Support
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
