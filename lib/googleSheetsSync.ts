import { google } from "googleapis";
import { getConfig } from "./config";
import { prisma } from "./prisma";

function getAuth(credentialsJson: string) {
  const credentials = JSON.parse(credentialsJson);
  return new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export async function syncJobToSheet(job: {
  id: number;
  title: string;
  company: string;
  source: string;
  externalUrl: string;
  status: string;
  jobrightMatchScore?: number | null;
  hasResume: boolean;
  hasCoverLetter: boolean;
  createdAt: Date;
}) {
  const config = await getConfig();
  if (!config.googleSheetsCredentials || !config.googleSheetId) return;

  const auth = getAuth(config.googleSheetsCredentials);
  const sheets = google.sheets({ version: "v4", auth });

  const values = [
    [
      job.id,
      job.title,
      job.company,
      job.source,
      job.externalUrl,
      job.status,
      job.jobrightMatchScore ?? "",
      job.hasResume ? "Yes" : "No",
      job.hasCoverLetter ? "Yes" : "No",
      job.createdAt.toISOString().split("T")[0],
    ],
  ];

  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: config.googleSheetId,
    range: "Jobs!A:A",
  });

  const rows = existing.data.values || [];
  let rowIndex = -1;
  for (let i = 0; i < rows.length; i++) {
    if (String(rows[i][0]) === String(job.id)) {
      rowIndex = i;
      break;
    }
  }

  if (rowIndex >= 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: config.googleSheetId,
      range: `Jobs!A${rowIndex + 1}:J${rowIndex + 1}`,
      valueInputOption: "RAW",
      requestBody: { values },
    });
  } else {
    await sheets.spreadsheets.values.append({
      spreadsheetId: config.googleSheetId,
      range: "Jobs!A:J",
      valueInputOption: "RAW",
      requestBody: { values },
    });
  }
}

export async function fullSyncToSheet() {
  const config = await getConfig();
  if (!config.googleSheetsCredentials || !config.googleSheetId) {
    throw new Error("Google Sheets not configured. Go to /admin/api-keys to set credentials.");
  }

  const auth = getAuth(config.googleSheetsCredentials);
  const sheets = google.sheets({ version: "v4", auth });

  const jobs = await prisma.jobApplication.findMany({
    include: {
      tailoredResumes: { select: { id: true }, take: 1 },
      coverLetters: { select: { id: true }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
  });

  const header = [
    ["ID", "Title", "Company", "Source", "URL", "Status", "Match Score", "Resume", "Cover Letter", "Created"],
  ];

  const data = jobs.map((job) => [
    job.id,
    job.title,
    job.company,
    job.source,
    job.externalUrl,
    job.status,
    job.jobrightMatchScore ?? "",
    job.tailoredResumes.length > 0 ? "Yes" : "No",
    job.coverLetters.length > 0 ? "Yes" : "No",
    job.createdAt.toISOString().split("T")[0],
  ]);

  await sheets.spreadsheets.values.clear({
    spreadsheetId: config.googleSheetId,
    range: "Jobs!A:J",
  });

  await sheets.spreadsheets.values.update({
    spreadsheetId: config.googleSheetId,
    range: "Jobs!A1",
    valueInputOption: "RAW",
    requestBody: { values: [...header, ...data] },
  });

  return { synced: jobs.length };
}
