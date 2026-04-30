import { google } from "googleapis";
import { getConfig, getSheetColumns } from "./config";
import { prisma } from "./prisma";

function getAuth(credentialsJson: string) {
  const credentials = JSON.parse(credentialsJson);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

function getJobValue(job: Record<string, any>, key: string): string {
  if (key === "createdAt") return job.createdAt?.toISOString?.()?.split("T")[0] || String(job.createdAt || "");
  if (key === "aiScore") return job.aiScore != null ? String(job.aiScore) : "";
  return String(job[key] ?? "");
}

export async function syncApprovedJobsToSheet(): Promise<{ synced: number }> {
  const config = await getConfig();
  if (!config.googleSheetsCredentials || !config.googleSheetId) {
    throw new Error("Google Sheets not configured. Go to /admin/settings to set credentials.");
  }

  const auth = getAuth(config.googleSheetsCredentials);
  const sheets = google.sheets({ version: "v4", auth });
  const columns = getSheetColumns(config.sheetColumns);

  const jobs = await prisma.scrapedJob.findMany({
    where: { status: "APPROVED", sheetSynced: false },
    orderBy: { createdAt: "asc" },
  });

  if (jobs.length === 0) return { synced: 0 };

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: config.googleSheetId,
    range: "Jobs!A1:A1",
  }).catch(() => null);

  const hasHeader = existing?.data?.values && existing.data.values.length > 0;

  if (!hasHeader) {
    const header = columns.map((c) => c.label);
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.googleSheetId,
      range: "Jobs!A1",
      valueInputOption: "RAW",
      requestBody: { values: [header] },
    });
  }

  const rows = jobs.map((job) =>
    columns.map((col) => getJobValue(job, col.key))
  );

  const batchSize = 50;
  for (let i = 0; i < rows.length; i += batchSize) {
    const batch = rows.slice(i, i + batchSize);
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.googleSheetId,
      range: "Jobs!A:Z",
      valueInputOption: "RAW",
      requestBody: { values: batch },
    });
  }

  const syncedIds = jobs.map((j) => j.id);
  await prisma.scrapedJob.updateMany({
    where: { id: { in: syncedIds } },
    data: { sheetSynced: true },
  });

  return { synced: jobs.length };
}

export async function fullSyncToSheet(): Promise<{ synced: number }> {
  const config = await getConfig();
  if (!config.googleSheetsCredentials || !config.googleSheetId) {
    throw new Error("Google Sheets not configured. Go to /admin/settings to set credentials.");
  }

  const auth = getAuth(config.googleSheetsCredentials);
  const sheets = google.sheets({ version: "v4", auth });
  const columns = getSheetColumns(config.sheetColumns);

  const jobs = await prisma.scrapedJob.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
  });

  const header = [columns.map((c) => c.label)];
  const data = jobs.map((job) =>
    columns.map((col) => getJobValue(job, col.key))
  );

  await sheets.spreadsheets.values.clear({
    spreadsheetId: config.googleSheetId,
    range: "Jobs!A:Z",
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: config.googleSheetId,
    range: "Jobs!A1",
    valueInputOption: "RAW",
    requestBody: { values: [...header, ...data] },
  });

  await prisma.scrapedJob.updateMany({
    where: { status: "APPROVED" },
    data: { sheetSynced: true },
  });

  return { synced: jobs.length };
}
