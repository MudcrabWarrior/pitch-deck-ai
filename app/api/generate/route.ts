import { NextRequest, NextResponse } from "next/server";
import { generateOutline, generateFullDeck } from "@/lib/anthropic";
import { rateLimit } from "@/lib/rate-limit";
import { getStripe } from "@/lib/stripe";
import { generatePptxBuffer } from "@/lib/pptx";

// Track which sessions have already been used
const usedSessions = new Set<string>();

// Sanitize user input to prevent prompt injection
function sanitizeInput(input: string): string {
  return input
    .replace(/\b(ignore|disregard|forget)\s+(all\s+)?(previous|above|prior)\s+(instructions?|prompts?|rules?)/gi, '[filtered]')
    .replace(/\b(you\s+are\s+now|act\s+as|pretend\s+to\s+be|new\s+instructions?)\b/gi, '[filtered]')
    .replace(/\b(system\s*prompt|system\s*message|<\/?system>)/gi, '[filtered]');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { premium, sessionId } = body;

    // --- PREMIUM PATH: Generate full deck after payment ---
    if (premium) {
      if (!sessionId) {
        return NextResponse.json(
          { error: "Missing session ID. Payment verification required." },
          { status: 400 }
        );
      }

      if (usedSessions.has(sessionId)) {
        return NextResponse.json(
          { error: "This session has already been used to generate a deck." },
          { status: 403 }
        );
      }

      const stripe = getStripe();
      let session;
      try {
        session = await stripe.checkout.sessions.retrieve(sessionId);
      } catch {
        return NextResponse.json(
          { error: "Invalid session ID." },
          { status: 400 }
        );
      }

      if (session.payment_status !== "paid") {
        return NextResponse.json(
          { error: "Payment not completed. Please complete checkout first." },
          { status: 403 }
        );
      }

      const businessIdea = session.metadata?.businessIdea || body.businessIdea;
      const targetAudience = session.metadata?.targetAudience || body.targetAudience;
      const stage = session.metadata?.stage || body.stage;

      if (!businessIdea) {
        return NextResponse.json(
          { error: "Missing business data. Please try again from the main page." },
          { status: 400 }
        );
      }

      usedSessions.add(sessionId);

      if (usedSessions.size > 10000) {
        const arr = Array.from(usedSessions);
        for (let i = 0; i < 5000; i++) usedSessions.delete(arr[i]);
      }

      const deck = await generateFullDeck(
        sanitizeInput(businessIdea.slice(0, 5000)),
        sanitizeInput((targetAudience || "General investors").slice(0, 2000)),
        (stage || "Early stage").slice(0, 500)
      );

      // Generate PPTX buffer and encode as base64
      const pptxBuffer = await generatePptxBuffer(deck);
      const pptxBase64 = Buffer.from(pptxBuffer).toString("base64");

      return NextResponse.json({ deck, pptxBase64 });
    }

    // --- FREE PATH: Generate outline only ---
    const { businessIdea, targetAudience, stage } = body;

    if (!businessIdea) {
      return NextResponse.json(
        { error: "Please describe your business idea." },
        { status: 400 }
      );
    }

    const ip =
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "unknown";

    // 3 free outlines per IP per hour
    const { success, remaining, resetAt } = rateLimit(ip, 3, 60 * 60 * 1000);

    if (!success) {
      const minutesLeft = Math.ceil((resetAt - Date.now()) / 60000);
      return NextResponse.json(
        {
          error: `You've used all free generations this hour. Try again in ${minutesLeft} minutes, or upgrade to get the full deck.`,
          rateLimited: true,
        },
        { status: 429 }
      );
    }

    const outline = await generateOutline(
      sanitizeInput(businessIdea.slice(0, 5000)),
      sanitizeInput((targetAudience || "General investors").slice(0, 2000)),
      (stage || "Early stage").slice(0, 500)
    );

    return NextResponse.json({ outline, remaining });
  } catch (error) {
    console.error("Generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate pitch deck. Please try again." },
      { status: 500 }
    );
  }
}
