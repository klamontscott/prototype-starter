import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const { participant, durationMin, sentiment, status, summary } =
      await req.json();

    const prompt = `You are a UX research assistant. Based on this research session record, write a brief synthesis (3-4 sentences) a researcher could paste into a report. Be concrete and neutral.

Session:
- Participant: ${participant}
- Duration: ${durationMin} minutes
- Sentiment: ${sentiment}
- Status: ${status}
- Notes: ${summary || "No notes recorded."}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 300,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Anthropic API error:", err);
      return NextResponse.json({ error: "AI request failed" }, { status: 502 });
    }

    const data = await response.json();
    const text = data.content?.[0]?.text ?? "";
    return NextResponse.json({ synthesis: text });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}