import type { EnquiryStatus } from "./types";

// Enquiry pipeline shared by the admin UI, server actions and the CSV export.
export const ENQUIRY_STATUSES: { id: EnquiryStatus; label: string; badge: string }[] = [
  { id: "new", label: "New", badge: "bg-bronze/15 text-bronze" },
  { id: "replied", label: "Replied", badge: "bg-sky-100 text-sky-800" },
  { id: "proposal", label: "Proposal sent", badge: "bg-violet-100 text-violet-800" },
  { id: "won", label: "Won", badge: "bg-green-100 text-green-800" },
  { id: "lost", label: "Lost", badge: "bg-gray-100 text-gray-600" },
  { id: "spam", label: "Spam", badge: "bg-red-100 text-red-800" },
];

export const isEnquiryStatus = (s: string): s is EnquiryStatus => ENQUIRY_STATUSES.some((x) => x.id === s);

/** Tags are short lowercase labels ("villa", "dubai", "urgent"). */
export const normalizeTag = (t: string) => t.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^\p{L}\p{N}-]/gu, "").slice(0, 30);

export type EnquiryFilter = { status?: string; tag?: string; q?: string };

/** Mongo query for the admin list and the CSV export. Spam only shows when asked for. */
export function enquiryQuery({ status, tag, q }: EnquiryFilter) {
  const query: Record<string, unknown> = {};
  if (status && isEnquiryStatus(status)) query.status = status;
  else query.status = { $ne: "spam" };
  if (tag) query.tags = normalizeTag(tag);
  const text = q?.trim();
  if (text) {
    const rx = new RegExp(text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "i");
    query.$or = [{ name: rx }, { email: rx }, { phone: rx }, { subject: rx }, { body: rx }, { "notes.text": rx }];
  }
  return query;
}
