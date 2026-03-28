import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { pptxBase64, companyName } = await req.json();

    if (!pptxBase64) {
      return NextResponse.json(
        { error: "No presentation data provided." },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(pptxBase64, "base64");
    const filename = `${(companyName || "pitch-deck").replace(/[^a-zA-Z0-9]/g, "-")}-pitch-deck.pptx`;

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.presentationml.presentation",
        "Content-Disposition": `attachment; filename="${filename}"`,
        "Content-Length": buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error("Download error:", error);
    return NextResponse.json(
      { error: "Failed to generate download." },
      { status: 500 }
    );
  }
}
