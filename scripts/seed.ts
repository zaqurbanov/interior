// Fills an empty database with the site's default content and creates the
// admin account. Safe to re-run: it only inserts what is missing and never
// overwrites records that were edited in the admin panel.
//
// Usage:
//   npm run seed                    add missing content and the admin account
//   npm run seed -- --reset-admin   set ADMIN_EMAIL's password to ADMIN_PASSWORD
//                                   (creates the account if needed) and removes
//                                   the placeholder admin@example.com account
import bcrypt from "bcryptjs";
import mongoose from "mongoose";
import { connectDB } from "../src/lib/db";
import { defaultProjects, defaultServices, defaultSiteContent } from "../src/lib/defaults";
import { Project, Service, SiteContent, User } from "../src/models";

// Values from .env.example — they must never reach a real database.
const PLACEHOLDER_EMAIL = "admin@example.com";
const PLACEHOLDER_PASSWORD = "ChangeMe123!";

async function main() {
  await connectDB();
  console.log(`Connected to "${mongoose.connection.name}".`);

  // Site content (single document).
  const site = await SiteContent.findOne({ key: "main" }).lean();
  if (site) {
    console.log("Site content: already present, left as is.");
  } else {
    await SiteContent.create({ key: "main", ...defaultSiteContent });
    console.log("Site content: created.");
  }

  // Services and projects: insert the slugs that are not there yet.
  let services = 0;
  for (const { id: _id, ...s } of defaultServices) {
    const res = await Service.updateOne({ slug: s.slug }, { $setOnInsert: s }, { upsert: true });
    services += res.upsertedCount;
  }
  console.log(`Services: ${services} added, ${defaultServices.length - services} already present.`);

  let projects = 0;
  for (const { id: _id, publishAt: _publishAt, previewToken: _previewToken, createdAt: _createdAt, ...p } of defaultProjects) {
    const res = await Project.updateOne({ slug: p.slug }, { $setOnInsert: p }, { upsert: true });
    projects += res.upsertedCount;
  }
  console.log(`Projects: ${projects} added, ${defaultProjects.length - projects} already present.`);

  // Admin account from ADMIN_EMAIL / ADMIN_PASSWORD.
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const reset = process.argv.includes("--reset-admin");

  if (!email || !password) {
    console.log("Admin: ADMIN_EMAIL / ADMIN_PASSWORD not set, skipped.");
  } else if (email === PLACEHOLDER_EMAIL || password === PLACEHOLDER_PASSWORD || password.length < 10) {
    // Never put a publicly known (or trivially short) password on a live database.
    console.log("Admin: skipped — set a real ADMIN_EMAIL and an ADMIN_PASSWORD of 10+ characters (not the .env.example values).");
    process.exitCode = 1;
  } else if (reset) {
    const passwordHash = await bcrypt.hash(password, 12);
    await User.updateOne(
      { email },
      { $set: { passwordHash }, $setOnInsert: { email, name: "Admin", role: "admin" } },
      { upsert: true },
    );
    const removed = await User.deleteMany({ email: PLACEHOLDER_EMAIL });
    console.log(`Admin: password for ${email} set.${removed.deletedCount ? " Placeholder account removed." : ""}`);
  } else if (await User.exists({ email })) {
    console.log(`Admin: ${email} already exists, password not changed (use --reset-admin to change it).`);
  } else {
    await User.create({ email, name: "Admin", role: "admin", passwordHash: await bcrypt.hash(password, 12) });
    console.log(`Admin: ${email} created.`);
  }
}

main()
  .catch((err) => {
    console.error("Seed failed:", err instanceof Error ? err.message : err);
    process.exitCode = 1;
  })
  .finally(() => mongoose.disconnect());
