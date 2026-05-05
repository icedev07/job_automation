import { NextRequest, NextResponse } from "next/server";
export const dynamic = "force-dynamic";
import { getConfig } from "@/lib/config";
import { upsertScrapedJob } from "@/lib/scrapedJobs";
import { analyzeJob } from "@/lib/jobAnalyzer";
import { syncJobToLinkedInTab } from "@/lib/googleSheetsSync";
import { prisma } from "@/lib/prisma";

function corsHeaders() {
  return {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, X-API-Key",
  };
}

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}

export async function POST(req: NextRequest) {
  const config = await getConfig();

  if (config.extensionApiKey) {
    const apiKey = req.headers.get("x-api-key");
    if (apiKey !== config.extensionApiKey) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401, headers: corsHeaders() }
      );
    }
  }

  const body = await req.json();
  const { title, company, location, url, description, easyApply } = body;

  if (!title || !company || !url) {
    return NextResponse.json(
      { error: "title, company, and url are required" },
      { status: 400, headers: corsHeaders() }
    );
  }

  try {
    // Log what was received from the extension
    console.log(`[Extension] Received: title="${title}", company="${company}", location="${location}", easyApply=${easyApply}, descLen=${description?.length || 0}, url=${url}`);

    const MAX_DESC_CHARS = 120_000;

    if (easyApply) {
      const saved = await upsertScrapedJob({
        platform: "linkedin",
        title,
        company,
        url,
        location,
        description:
          typeof description === "string" ? description.slice(0, MAX_DESC_CHARS) : description,
      });

      if (!saved) {
        return NextResponse.json(
          { action: "easy_apply", reason: "Easy Apply (skip rule matched)", alreadyExists: false, score: 0 },
          { headers: corsHeaders() }
        );
      }

      const easyUp = await prisma.scrapedJob.updateMany({
        where: { id: saved.id },
        data: {
          status: "REJECTED",
          aiScore: 0,
          aiReason: "Easy Apply - auto rejected (detected by extension)",
        },
      });
      if (easyUp.count === 0) {
        return NextResponse.json(
          { error: "Job record not found", action: "error", linkedInDismiss: false },
          { status: 500, headers: corsHeaders() }
        );
      }

      await prisma.analysisLog.create({
        data: {
          scrapedJobId: saved.id,
          model: "extension-auto",
          approved: false,
          score: 0,
          reason: "Easy Apply - auto rejected (detected by extension)",
          tokensUsed: 0,
          durationMs: 0,
        },
      });

      return NextResponse.json(
        { action: "easy_apply", reason: "Easy Apply - auto rejected", alreadyExists: false, score: 0 },
        { headers: corsHeaders() }
      );
    }

    const saved = await upsertScrapedJob({
      platform: "linkedin",
      title,
      company,
      url,
      location,
      description:
        typeof description === "string" ? description.slice(0, MAX_DESC_CHARS) : description,
    });

    if (!saved) {
      return NextResponse.json(
        { action: "skipped", reason: "Blocked by skip rule", alreadyExists: false, score: 0 },
        { headers: corsHeaders() }
      );
    }

    const existing = await prisma.scrapedJob.findUnique({
      where: { id: saved.id },
      select: { status: true, aiScore: true, aiReason: true },
    });

    if (existing && existing.status !== "PENDING") {
      return NextResponse.json(
        {
          action: existing.status === "APPROVED" ? "approved" : "rejected",
          reason: existing.aiReason || "Already analyzed",
          alreadyExists: true,
          score: existing.aiScore || 0,
        },
        { headers: corsHeaders() }
      );
    }

    if (typeof description === "string" && description.length > 0) {
      const descUp = await prisma.scrapedJob.updateMany({
        where: { id: saved.id },
        data: { description: description.slice(0, MAX_DESC_CHARS) },
      });
      if (descUp.count === 0) {
        return NextResponse.json(
          { error: "Job record not found for description update", action: "error", linkedInDismiss: false },
          { status: 500, headers: corsHeaders() }
        );
      }
    }

    const result = await analyzeJob(saved.id);
    console.log(`[Extension] AI result for "${title}": approved=${result.approved}, score=${result.score}, reason="${result.reason}"`);

    if (result.approved) {
      const job = await prisma.scrapedJob.findUnique({ where: { id: saved.id } });
      if (job) {
        try {
          await syncJobToLinkedInTab(job);
        } catch (err: any) {
          console.error(`LinkedIn sheet sync failed: ${err.message}`);
        }
      }
    }

    return NextResponse.json(
      {
        action: result.approved ? "approved" : "rejected",
        reason: result.reason,
        alreadyExists: false,
        score: result.score,
        ...(!result.approved && result.linkedInDismiss === false ? { linkedInDismiss: false } : {}),
      },
      { headers: corsHeaders() }
    );
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message, action: "error", linkedInDismiss: false },
      { status: 500, headers: corsHeaders() }
    );
  }
}
