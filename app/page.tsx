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

  return (
    <main className="min-h-screen bg-gray-950">
      {/* Hero */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-gray-950 to-blue-900/20" />
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-blue-500 to-purple-500" />
        <div className="relative max-w-4xl mx-auto px-4 pt-16 pb-12">
          <div className="text-center mb-4">
            <span className="inline-block px-3 py-1 text-xs font-medium bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30 mb-6">
              POWERED BY AI
            </span>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4 leading-tight">
              Investor-Ready Pitch Deck
              <br />
              <span className="bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                in Minutes, Not Weeks
              </span>
            </h1>
            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Describe your startup. Our AI generates a professional 10-slide pitch deck
              with compelling copy, market sizing, and speaker notes. Download as PPTX.
            </p>
          </div>
        </div>
      </div>

      {/* Input Form */}
      <div className="max-w-3xl mx-auto px-4 pb-8">
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8 shadow-2xl">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Your Business Idea *
              </label>
              <textarea
                value={businessIdea}
                onChange={(e) => setBusinessIdea(e.target.value)}
                placeholder="e.g., An AI-powered platform that helps small restaurants optimize their menu pricing based on ingredient costs, local competition, and customer demand patterns..."
                className="w-full h-32 bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                maxLength={5000}
              />
              <p className="text-xs text-gray-500 mt-1">
                Be specific — the more detail you give, the better your deck will be.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Target Investors
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Seed-stage VCs, angel investors in FoodTech"
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Company Stage
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
              className="w-full py-4 rounded-xl font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating Your Deck Outline...
                </span>
              ) : (
                "Generate Free Outline \u2192"
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Error */}
      {errorMsg && !rateLimited && (
        <div className="max-w-3xl mx-auto px-4 pb-6">
          <div className="bg-red-900/30 border border-red-800 rounded-xl p-4 text-center">
            <p className="text-red-300">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Rate Limited */}
      {rateLimited && (
        <div className="max-w-3xl mx-auto px-4 pb-6">
          <div className="bg-yellow-900/30 border border-yellow-700 rounded-xl p-6 text-center">
            <p className="text-yellow-300 mb-3">{errorMsg}</p>
            <button
              onClick={handleUpgrade}
              disabled={checkingOut}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg text-white font-bold hover:from-purple-500 hover:to-blue-500 transition-all"
            >
              Get Full Deck for $12.99 \u2192
            </button>
          </div>
        </div>
      )}

      {/* FREE Outline Result */}
      {generated && outline && (
        <div className="max-w-3xl mx-auto px-4 pb-8 animate-fadeIn">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 md:p-8">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white">{outline.companyName}</h2>
              <p className="text-purple-400 mt-1">{outline.tagline}</p>
            </div>

            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider mb-4">
              Your 10-Slide Outline
            </h3>

            <div className="space-y-3">
              {outline.slides.map((slide) => (
                <div key={slide.slideNumber} className="flex gap-4 p-4 bg-gray-800/50 rounded-xl border border-gray-700/50">
                  <div className="flex-shrink-0 w-8 h-8 bg-purple-500/20 text-purple-400 rounded-lg flex items-center justify-center text-sm font-bold">
                    {slide.slideNumber}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{slide.title}</h4>
                    <p className="text-sm text-gray-400 mt-1">{slide.description}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Upsell */}
            <div className="mt-8 bg-gradient-to-br from-purple-900/30 to-blue-900/30 border border-purple-500/30 rounded-2xl p-6 text-center">
              <h3 className="text-xl font-bold text-white mb-2">Want the Full Deck?</h3>
              <p className="text-gray-400 mb-1">Get a professional 10-slide PPTX file with:</p>
              <div className="flex flex-wrap justify-center gap-3 my-4">
                {["Detailed bullet points", "Speaker notes", "Market sizing", "Competitive analysis", "Financial projections", "PPTX download"].map((item) => (
                  <span key={item} className="px-3 py-1.5 bg-gray-800 rounded-full text-sm text-gray-300 border border-gray-700">
                    \u2713 {item}
                  </span>
                ))}
              </div>
              <div className="mb-4">
                <span className="text-3xl font-bold text-white">$12.99</span>
                <span className="text-gray-500 ml-2 line-through">$49</span>
                <span className="text-sm text-green-400 ml-2">74% off</span>
              </div>
              <button
                onClick={handleUpgrade}
                disabled={checkingOut}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl text-white font-bold text-lg hover:from-purple-500 hover:to-blue-500 transition-all shadow-lg shadow-purple-500/25 hover:shadow-purple-500/40 animate-pulse-glow disabled:opacity-50"
              >
                {checkingOut ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Redirecting to checkout...
                  </span>
                ) : (
                  "Download Full PPTX Deck \u2014 $12.99"
                )}
              </button>
              <p className="text-xs text-gray-500 mt-3">One-time payment. Instant download. No subscription.</p>
            </div>
          </div>
        </div>
      )}

      {/* Features - shown before generation */}
      {!generated && (
        <div className="max-w-4xl mx-auto px-4 pb-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: "\u26A1", title: "Ready in 60 Seconds", desc: "Our AI analyzes your business and generates a complete investor-ready deck in under a minute." },
              { icon: "\uD83D\uDCCA", title: "10 Professional Slides", desc: "Problem, solution, market size, business model, traction, team, and the ask \u2014 all covered." },
              { icon: "\uD83D\uDCE5", title: "PPTX Download", desc: "Download as a PowerPoint file. Edit it, customize it, make it yours. Present with confidence." },
            ].map((feature) => (
              <div key={feature.title} className="bg-gray-900/50 border border-gray-800 rounded-xl p-6 text-center">
                <div className="text-3xl mb-3">{feature.icon}</div>
                <h3 className="font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-400">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="max-w-3xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-white text-center mb-8">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "What do I get for free?", a: "A complete 10-slide deck outline with AI-generated titles, structure, and descriptions tailored to your specific business idea." },
            { q: "What\u2019s included in the paid version?", a: "A downloadable PPTX file with 10 professionally designed slides, detailed bullet points, market sizing data, competitive analysis, financial projections, and speaker notes you can present from." },
            { q: "Can I edit the PPTX file?", a: "Absolutely. The file opens in PowerPoint, Google Slides, or Keynote. Add your branding, tweak the copy, insert images \u2014 it\u2019s yours to customize." },
            { q: "What AI model powers this?", a: "We use Claude by Anthropic \u2014 one of the most capable AI models available \u2014 specifically tuned for business strategy and compelling pitch narratives." },
            { q: "Is my business idea kept private?", a: "Yes. We don\u2019t store your business ideas after generation. Your data is processed securely and not used for training." },
            { q: "Can I get a refund?", a: "Since the deck is generated instantly and delivered digitally, we generally can\u2019t offer refunds. But if something goes wrong, email us and we\u2019ll make it right." },
          ].map((faq) => (
            <details key={faq.q} className="bg-gray-900/50 border border-gray-800 rounded-xl group">
              <summary className="px-6 py-4 cursor-pointer text-white font-medium flex items-center justify-between">
                {faq.q}
                <span className="text-gray-500 group-open:rotate-180 transition-transform">\u25BE</span>
              </summary>
              <div className="px-6 pb-4 text-sm text-gray-400">{faq.a}</div>
            </details>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            Built by <span className="text-purple-400 font-medium">Velocity Forge AI</span> \u2014 Create Faster. Think Smarter. Scale Higher.
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs text-gray-600">
            <a href="https://cover-letter-ai-eight.vercel.app" className="hover:text-gray-400 transition-colors">AI Cover Letter Generator</a>
            <span>\u00B7</span>
            <a href="mailto:mudcrabwarrior@gmail.com" className="hover:text-gray-400 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
