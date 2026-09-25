import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { toMessage } from "@/lib/data";
import { ENQUIRY_STATUSES, enquiryQuery } from "@/lib/enquiries";
import { Message } from "@/models";

// CSV of the enquiries matching the admin list's filters (?status=&tag=&q=).
// Outside /admin, so it checks the session itself.

const cell = (v: string) => {
  // Neutralise spreadsheet formulas ("=HYPERLINK(...)" typed into the contact form).
  const safe = /^[=+\-@\t\r]/.test(v) ? `'${v}` : v;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
};

export async function GET(request: Request) {
  if (!(await auth())?.user) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const params = new URL(request.url).searchParams;
  await connectDB();
  const docs = await Message.find(
    enquiryQuery({ status: params.get("status") ?? "", tag: params.get("tag") ?? "", q: params.get("q") ?? "" }),
  )
    .sort({ createdAt: -1 })
    .lean();

  const label = (id: string) => ENQUIRY_STATUSES.find((s) => s.id === id)?.label ?? id;
  const header = ["Date", "Name", "Email", "Phone", "Project type", "Message", "Status", "Tags", "Notes"];
  const rows = docs.map(toMessage).map((m) => [
    m.createdAt.slice(0, 16).replace("T", " "),
    m.name,
    m.email,
    m.phone,
    m.subject,
    m.body,
    label(m.status),
    m.tags.join(", "),
    m.notes.map((n) => `${n.at.slice(0, 10)}: ${n.text}`).join("\n"),
  ]);
  // BOM so Excel opens UTF-8 (names with accents) correctly.
  const csv = "﻿" + [header, ...rows].map((r) => r.map(cell).join(",")).join("\r\n");
  const date = new Date().toISOString().slice(0, 10);
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="enquiries-${date}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
