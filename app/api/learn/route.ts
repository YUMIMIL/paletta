import Anthropic from "@anthropic-ai/sdk";
import { NextRequest } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { FieldValue } from "firebase-admin/firestore";
import { PALETTA_SYSTEM_PROMPT, URL_ANALYSIS_PROMPT } from "@/lib/paletta-prompt";

const client = new Anthropic();

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();

    if (!url || typeof url !== "string") {
      return Response.json({ error: "url is required" }, { status: 400 });
    }

    // Fetch the page HTML
    const pageRes = await fetch(url, {
      headers: { "User-Agent": "Paletta/1.0 (Design Analyzer)" },
    });
    if (!pageRes.ok) {
      return Response.json(
        { error: `Failed to fetch URL: ${pageRes.status}` },
        { status: 400 }
      );
    }
    const html = await pageRes.text();

    // Ask Claude (as Paletta) to analyze the design
    const message = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2000,
      system: PALETTA_SYSTEM_PROMPT,
      messages: [
        { role: "user", content: URL_ANALYSIS_PROMPT(html, url) },
      ],
    });

    const text =
      message.content[0].type === "text" ? message.content[0].text : "";

    // Parse the JSON response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return Response.json(
        { error: "Failed to parse analysis result" },
        { status: 500 }
      );
    }

    const analysis = JSON.parse(jsonMatch[0]);

    // Save to Firestore
    const docRef = await adminDb.collection("design_learnings").add({
      type: "url_analysis",
      url,
      fetched_at: FieldValue.serverTimestamp(),
      design_analysis: analysis.design_analysis,
      paletta_verdict: analysis.paletta_verdict,
      created_at: FieldValue.serverTimestamp(),
      created_by: "paletta",
    });

    return Response.json({
      id: docRef.id,
      analysis: analysis.design_analysis,
      verdict: analysis.paletta_verdict,
      comment: analysis.paletta_comment,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Unknown error";
    console.error("Learn API error:", msg);
    return Response.json({ error: msg }, { status: 500 });
  }
}
