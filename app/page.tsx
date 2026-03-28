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
    <main className="min-h-screen">
      {/* Hero */}
      <section className="bg-gradient-to-br from-brand-900 to-brand-700 text-white py-16 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            AI Pitch Deck Generator
          </h1>
          <p className="text-xl text-blue-100 mb-2">
            Describe your startup. Get a 10-slide investor deck. Under 60 seconds.
          </p>
          <p className="text-sm text-blue-200">
            Free outline — no signup required
          </p>
        </div>
      </section>

      {/* Form */}
      <section className="max-w-3xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-xl shadow-lg p-6 md:p-8">
          <div className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">
                Describe your business *
              </label>
              <textarea
                value={businessIdea}
                onChange={(e) => setBusinessIdea(e.target.value)}
                placeholder="e.g., An AI platform that helps restaurants optimize menu pricing using ingredient costs, competition data, and demand patterns..."
                rows={4}
                maxLength={5000}
                className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none resize-y"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Target investors
                </label>
                <input
                  type="text"
                  value={targetAudience}
                  onChange={(e) => setTargetAudience(e.target.value)}
                  placeholder="e.g., Seed VCs in FoodTech"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  Stage
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-brand-500 focus:border-transparent outline-none"
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
              className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors text-lg"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Generating outline...
                </span>
              ) : generated ? (
                "Generate Another"
              ) : (
                "Generate Free Outline"
              )}
            </button>
          </div>

          <p className="text-xs text-gray-500 text-center mt-3">
            Free tier: 3 outlines per hour. No account required.
          </p>

          {/* Error */}
          {errorMsg && !rateLimited && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700 text-center">
              {errorMsg}
            </div>
          )}

          {/* Rate Limited */}
          {rateLimited && (
            <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg text-center">
              <p className="text-sm text-yellow-700 mb-3">{errorMsg}</p>
              <button
                onClick={handleUpgrade}
                disabled={checkingOut}
                className="bg-brand-600 hover:bg-brand-700 text-white font-semibold py-2 px-5 rounded-lg transition-colors text-sm"
              >
                Get full deck for $12.99
              </button>
            </div>
          )}

          {/* Outline Result */}
          {generated && outline && (
            <div className="mt-8 border-t pt-6">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-2 h-2 rounded-full bg-green-500" />
                <span className="text-xs font-medium text-green-600">Outline generated</span>
              </div>
              <h2 className="text-xl font-bold text-gray-900">{outline.companyName}</h2>
              <p className="text-sm text-gray-500 mb-4">{outline.tagline}</p>

              {/* Slides */}
              <div className="border rounded-lg overflow-hidden">
                {outline.slides.map((slide, i) => (
                  <div
                    key={slide.slideNumber}
                    className={`flex gap-3.5 px-4 py-3 ${i % 2 === 0 ? "bg-gray-50" : "bg-white"} ${i < outline.slides.length - 1 ? "border-b" : ""}`}
                  >
                    <span className="flex-shrink-0 w-6 h-6 rounded bg-brand-50 text-brand-600 text-xs font-mono font-medium flex items-center justify-center border border-brand-100">
                      {slide.slideNumber}
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900">{slide.title}</p>
                      <p className="text-xs mt-0.5 leading-relaxed text-gray-500">{slide.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Upgrade CTA */}
              <div className="mt-6 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                  Download the Full Deck — $12.99
                </h3>
                <p className="text-sm text-gray-600 mb-3">
                  10 slides with detailed bullets, market sizing, competitive analysis, financial projections, and speaker notes. Ready to present.
                </p>
                <ul className="text-sm text-gray-700 space-y-1.5 mb-4">
                  {["Detailed content per slide", "Speaker notes included", "Market data & financials", "Downloadable PPTX file"].map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <span className="text-green-500 mt-0.5">&#10003;</span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleUpgrade}
                  disabled={checkingOut}
                  className="w-full bg-brand-600 hover:bg-brand-700 disabled:bg-gray-300 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
                >
                  {checkingOut ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    "Get Full Deck — $12.99"
                  )}
                </button>
                <p className="text-xs text-gray-500 mt-2 text-center">
                  One-time payment. Instant delivery. Powered by Stripe.
                </p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Stats */}
      <section className="max-w-3xl mx-auto px-4 py-12 text-center">
        <div className="grid grid-cols-3 gap-4">
          <div>
            <div className="text-2xl font-bold text-brand-700">500+</div>
            <div className="text-sm text-gray-500">Decks Generated</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-brand-700">60 sec</div>
            <div className="text-sm text-gray-500">Average Generation</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-brand-700">Free</div>
            <div className="text-sm text-gray-500">No Signup Required</div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      {!generated && (
        <section className="max-w-3xl mx-auto px-4 pb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { step: "1", title: "Describe", desc: "Enter your business idea, target investors, and company stage." },
              { step: "2", title: "Generate", desc: "Our AI creates a structured 10-slide narrative optimized for investors." },
              { step: "3", title: "Download", desc: "Get your PPTX file. Edit in PowerPoint, Slides, or Keynote." },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 bg-brand-50 text-brand-700 rounded-full flex items-center justify-center mx-auto mb-3 text-lg font-bold border border-brand-100">
                  {item.step}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Free vs Paid */}
      {!generated && (
        <section className="max-w-3xl mx-auto px-4 pb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">Free vs Full Deck</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white border rounded-xl p-6">
              <div className="flex items-baseline gap-2 mb-4">
                <h3 className="text-xl font-bold text-gray-900">Free Outline</h3>
                <span className="text-sm text-gray-500">$0</span>
              </div>
              <ul className="space-y-2">
                {["10-slide structure", "AI-generated titles", "Slide descriptions", "Company naming", "Narrative flow"].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-green-500">&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="bg-white border-2 border-brand-500 rounded-xl p-6 relative">
              <div className="absolute -top-2.5 right-4">
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full text-white bg-brand-600">
                  POPULAR
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-4">
                <h3 className="text-xl font-bold text-gray-900">Full PPTX Deck</h3>
                <span className="text-sm font-semibold text-brand-600">$12.99</span>
              </div>
              <ul className="space-y-2">
                {["Everything in Free", "Detailed bullet points", "Speaker notes per slide", "Market sizing & TAM", "Competitive analysis", "Financial projections", "Downloadable .pptx file"].map(item => (
                  <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                    <span className="text-brand-600">&#10003;</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </section>
      )}

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 pb-16">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {[
            { q: "What do I get for free?", a: "A complete 10-slide deck outline with titles, descriptions, and structure tailored to your business. Enough to validate your narrative before committing." },
            { q: "What\u2019s in the full PPTX?", a: "10 professionally written slides with detailed bullet points, market sizing, competitive analysis, financial projections, and speaker notes. Downloads as a .pptx file you can open in PowerPoint, Google Slides, or Keynote." },
            { q: "Can I edit the downloaded file?", a: "Yes. It\u2019s a standard .pptx file. Add your logo, tweak the copy, swap colors \u2014 it\u2019s yours." },
            { q: "Is my idea kept private?", a: "We don\u2019t store your business ideas after generation. Your data is processed securely and never used for training." },
            { q: "Can I get a refund?", a: "Since decks are generated instantly, we can\u2019t offer refunds. If something goes wrong, email us and we\u2019ll sort it out." },
          ].map((faq, i) => (
            <details key={i} className="bg-white border rounded-lg p-4">
              <summary className="font-semibold text-gray-800 cursor-pointer">
                {faq.q}
              </summary>
              <p className="mt-2 text-sm text-gray-600">{faq.a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-100 border-t py-8 px-4 text-center text-sm text-gray-500">
        <p>
          Built by{" "}
          <a href="https://velocityforgeai.gumroad.com" className="text-brand-600 hover:underline">
            Velocity Forge AI
          </a>
        </p>
        <p className="mt-1">Create Faster. Think Smarter. Scale Higher.</p>
        <div className="mt-3 flex items-center justify-center gap-4 text-xs">
          <a href="https://cover-letter-ai-one.vercel.app" className="text-brand-600 hover:underline">Cover Letters</a>
          <span className="text-gray-300">|</span>
          <a href="https://content-calendar-ai-delta.vercel.app" className="text-brand-600 hover:underline">Content Calendar</a>
          <span className="text-gray-300">|</span>
          <a href="https://website-roaster-ai-jade.vercel.app" className="text-brand-600 hover:underline">Website Roaster</a>
          <span className="text-gray-300">|</span>
          <a href="https://business-name-ai.vercel.app" className="text-brand-600 hover:underline">Business Names</a>
        </div>
      </footer>
    </main>
  );
}
