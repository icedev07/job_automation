import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const { board } = await req.json();

  const startTime = Date.now();
  let jobsSaved = 0;
  let jobsFound = 0;
  let error: string | undefined;

  try {
    const scanResult = await runScanForBoard(board);
    jobsFound = scanResult.found;
    jobsSaved = scanResult.saved;
  } catch (err: any) {
    error = err.message || String(err);
  }

  const durationMs = Date.now() - startTime;

  await prisma.scanLog.create({
    data: {
      board,
      jobsFound,
      jobsSaved,
      errors: error,
      durationMs,
    },
  });

  if (error) {
    return NextResponse.json({ success: false, error }, { status: 500 });
  }
  return NextResponse.json({ success: true, jobsFound, jobsSaved });
}

async function runScanForBoard(board: string): Promise<{ found: number; saved: number }> {
  // For now, scanners are triggered via the existing script mechanism.
  // In the cloud deployment, we import and call the scan logic directly.
  // Placeholder: this will be connected to actual scanner modules.
  throw new Error(
    `Scanner "${board}" is not yet connected for cloud execution. ` +
    `Use the CLI scripts locally for now (npm run ${board}:scan), ` +
    `or implement a lightweight HTTP-based scraper for this board.`
  );
}
