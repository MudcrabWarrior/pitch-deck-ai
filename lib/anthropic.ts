import Anthropic from "@anthropic-ai/sdk";

let _anthropic: Anthropic | null = null;

function getAnthropic(): Anthropic {
  if (!_anthropic) {
    _anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY!,
    });
  }
  return _anthropic;
}

export interface SlideContent {
  slideNumber: number;
  title: string;
  subtitle?: string;
  bullets: string[];
  speakerNotes: string;
}

export interface PitchDeckOutline {
  companyName: string;
  tagline: string;
  slides: {
    slideNumber: number;
    title: string;
    description: string;
  }[];
}

export interface FullPitchDeck {
  companyName: string;
  tagline: string;
  slides: SlideContent[];
}

function extractJSON(text: string): unknown {
  let cleaned = text.trim();
  cleaned = cleaned.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/, "");
  return JSON.parse(cleaned);
}

export async function generateOutline(
  businessIdea: string,
  targetAudience: string,
  stage: string
): Promise<PitchDeckOutline> {
  const anthropic = getAnthropic();
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 2000,
    messages: [
      {
        role: "user",
        content: `You are an expert startup pitch deck consultant who has helped raise billions in funding. Generate a pitch deck OUTLINE for this business.

BUSINESS IDEA:
${businessIdea}

TARGET AUDIENCE / INVESTORS:
${targetAudience}

COMPANY STAGE:
${stage}

IMPORTANT: Return ONLY raw JSON. No markdown, no code fences. Start with { and end with }.

{
  "companyName": "A compelling company/product name based on the idea",
  "tagline": "A punchy one-line tagline",
  "slides": [
    {"slideNumber": 1, "title": "Title Slide", "description": "Brief description of what goes here"},
    {"slideNumber": 2, "title": "The Problem", "description": "What pain point are we solving"},
    {"slideNumber": 3, "title": "The Solution", "description": "How we solve it"},
    {"slideNumber": 4, "title": "Market Opportunity", "description": "TAM/SAM/SOM breakdown"},
    {"slideNumber": 5, "title": "Business Model", "description": "How we make money"},
    {"slideNumber": 6, "title": "Traction", "description": "Key metrics and milestones"},
    {"slideNumber": 7, "title": "Competitive Landscape", "description": "Why we win"},
    {"slideNumber": 8, "title": "Go-to-Market Strategy", "description": "How we grow"},
    {"slideNumber": 9, "title": "The Team", "description": "Why this team wins"},
    {"slideNumber": 10, "title": "The Ask", "description": "Funding ask and use of proceeds"}
  ]
}

Make the outline specific to THIS business idea. Each description should be 1-2 sentences with concrete details about what the slide will cover for this specific business.`,
      },
    ],
  });

  const block = message.content[0];
  if (block.type === "text") {
    try {
      return extractJSON(block.text) as PitchDeckOutline;
    } catch {
      return {
        companyName: "Your Startup",
        tagline: "Innovation Meets Opportunity",
        slides: [
          { slideNumber: 1, title: "Title Slide", description: "Company name and tagline" },
          { slideNumber: 2, title: "The Problem", description: "The pain point you're solving" },
          { slideNumber: 3, title: "The Solution", description: "Your innovative approach" },
          { slideNumber: 4, title: "Market Opportunity", description: "Total addressable market" },
          { slideNumber: 5, title: "Business Model", description: "Revenue strategy" },
          { slideNumber: 6, title: "Traction", description: "Key metrics" },
          { slideNumber: 7, title: "Competitive Landscape", description: "Your advantages" },
          { slideNumber: 8, title: "Go-to-Market", description: "Growth strategy" },
          { slideNumber: 9, title: "The Team", description: "Key team members" },
          { slideNumber: 10, title: "The Ask", description: "Funding requirements" },
        ],
      };
    }
  }
  throw new Error("Failed to generate outline");
}

export async function generateFullDeck(
  businessIdea: string,
  targetAudience: string,
  stage: string
): Promise<FullPitchDeck> {
  const anthropic = getAnthropic();
  const message = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 8000,
    messages: [
      {
        role: "user",
        content: `You are an elite pitch deck consultant who has helped companies raise billions from top VCs. Generate a COMPLETE, detailed 10-slide pitch deck for this business.

BUSINESS IDEA:
${businessIdea}

TARGET AUDIENCE / INVESTORS:
${targetAudience}

COMPANY STAGE:
${stage}

IMPORTANT: Return ONLY raw JSON. No markdown, no code fences. Start with { and end with }.

{
  "companyName": "Compelling company/product name",
  "tagline": "Punchy one-line tagline",
  "slides": [
    {
      "slideNumber": 1,
      "title": "Company Name",
      "subtitle": "Tagline goes here",
      "bullets": ["Key value proposition point 1", "Key value proposition point 2"],
      "speakerNotes": "Detailed speaker notes for this slide (3-4 sentences)"
    },
    {
      "slideNumber": 2,
      "title": "The Problem",
      "subtitle": "A world without our solution",
      "bullets": ["Specific pain point 1 with data", "Specific pain point 2 with data", "Specific pain point 3 with impact", "Why existing solutions fail"],
      "speakerNotes": "Detailed speaker notes (3-4 sentences)"
    },
    {
      "slideNumber": 3,
      "title": "Our Solution",
      "subtitle": "How we fix everything",
      "bullets": ["Core feature/benefit 1", "Core feature/benefit 2", "Core feature/benefit 3", "Key differentiator"],
      "speakerNotes": "Detailed speaker notes (3-4 sentences)"
    },
    {
      "slideNumber": 4,
      "title": "Market Opportunity",
      "subtitle": "A massive and growing market",
      "bullets": ["TAM: Total addressable market with $ figure", "SAM: Serviceable addressable market", "SOM: Serviceable obtainable market", "Market growth rate and trends"],
      "speakerNotes": "Detailed speaker notes (3-4 sentences)"
    },
    {
      "slideNumber": 5,
      "title": "Business Model",
      "subtitle": "How we make money",
      "bullets": ["Revenue stream 1 with pricing", "Revenue stream 2", "Unit economics (CAC, LTV, margins)", "Path to profitability"],
      "speakerNotes": "Detailed speaker notes (3-4 sentences)"
    },
    {
      "slideNumber": 6,
      "title": "Traction & Milestones",
      "subtitle": "Proof that it works",
      "bullets": ["Key metric 1 (users, revenue, growth)", "Key metric 2", "Notable achievements/partnerships", "Upcoming milestones"],
      "speakerNotes": "Detailed speaker notes (3-4 sentences)"
    },
    {
      "slideNumber": 7,
      "title": "Competitive Landscape",
      "subtitle": "Why we win",
      "bullets": ["Competitor 1 and their weakness", "Competitor 2 and their weakness", "Our unfair advantage", "Defensibility / moat"],
      "speakerNotes": "Detailed speaker notes (3-4 sentences)"
    },
    {
      "slideNumber": 8,
      "title": "Go-to-Market Strategy",
      "subtitle": "How we dominate",
      "bullets": ["Channel strategy 1", "Channel strategy 2", "Partnership opportunities", "Expansion roadmap"],
      "speakerNotes": "Detailed speaker notes (3-4 sentences)"
    },
    {
      "slideNumber": 9,
      "title": "The Team",
      "subtitle": "World-class execution",
      "bullets": ["Founder/CEO - relevant background", "Co-founder/CTO - relevant background", "Key advisor/board member", "What we're hiring for next"],
      "speakerNotes": "Detailed speaker notes (3-4 sentences)"
    },
    {
      "slideNumber": 10,
      "title": "The Ask",
      "subtitle": "Join us on this journey",
      "bullets": ["Raising $X in [round type]", "Use of funds breakdown", "Key milestones this funding enables", "Contact information"],
      "speakerNotes": "Detailed speaker notes (3-4 sentences)"
    }
  ]
}

Make EVERYTHING specific to THIS business. Use realistic numbers, concrete details, and compelling language. Every bullet should be substantive, not generic. Speaker notes should be detailed enough to actually present from.`,
      },
    ],
  });

  const block = message.content[0];
  if (block.type === "text") {
    try {
      return extractJSON(block.text) as FullPitchDeck;
    } catch {
      throw new Error("Failed to parse pitch deck JSON. Raw: " + block.text.substring(0, 200));
    }
  }
  throw new Error("Failed to generate pitch deck");
}
