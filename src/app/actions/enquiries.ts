"use server";

import { revalidatePath } from "next/cache";
import { isValidObjectId } from "mongoose";
import { requireAdmin } from "@/auth";
import { connectDB } from "@/lib/db";
import { isEnquiryStatus, normalizeTag } from "@/lib/enquiries";
import { enquiryNoteSchema, type FormState } from "@/lib/validators";
import { Message } from "@/models";

async function load(id: string) {
  await requireAdmin();
  if (!isValidObjectId(id)) throw new Error("Unknown enquiry.");
  await connectDB();
}

const done = (message = "Saved"): FormState => {
  revalidatePath("/admin", "layout");
  return { ok: true, message };
};

export async function setEnquiryStatus(id: string, status: string): Promise<FormState> {
  await load(id);
  if (!isEnquiryStatus(status)) return { ok: false, message: "Unknown status." };
  // Moving an enquiry along the pipeline means it has been looked at.
  await Message.updateOne({ _id: id }, { $set: { status, read: true } });
  return done();
}

export async function setEnquiryTags(id: string, tags: string[]): Promise<FormState> {
  await load(id);
  const clean = [...new Set(tags.map(normalizeTag).filter(Boolean))].slice(0, 12);
  await Message.updateOne({ _id: id }, { $set: { tags: clean } });
  return done();
}

export async function addEnquiryNote(id: string, text: string): Promise<FormState> {
  await load(id);
  const parsed = enquiryNoteSchema.safeParse(text);
  if (!parsed.success) return { ok: false, message: parsed.error.issues[0].message };
  await Message.updateOne({ _id: id }, { $push: { notes: { text: parsed.data, at: new Date() } }, $set: { read: true } });
  return done("Note added");
}

/** Notes are identified by their timestamp (ISO), which is unique per enquiry in practice. */
export async function deleteEnquiryNote(id: string, at: string): Promise<FormState> {
  await load(id);
  const when = new Date(at);
  if (Number.isNaN(when.getTime())) return { ok: false, message: "Unknown note." };
  await Message.updateOne({ _id: id }, { $pull: { notes: { at: when } } });
  return done("Note deleted");
}
