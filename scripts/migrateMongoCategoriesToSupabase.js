/**
 * Migrate MongoDB class categories to Supabase `public.categories`.
 *
 * In MongoDB, categories are embedded inside each Community document under
 * `community.classes[]` — each entry has { id, title, classes: [...] }.
 * We flatten those into a single Supabase `categories` table, keyed by
 * `mongo_id = category.id` so re-runs are idempotent.
 *
 * Usage:
 *   node scripts/migrateMongoCategoriesToSupabase.js            # full run
 *   node scripts/migrateMongoCategoriesToSupabase.js --dry-run
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { MongoClient, ServerApiVersion } from "mongodb";
import { createClient } from "@supabase/supabase-js";

const args = process.argv.slice(2);
const DRY_RUN = args.includes("--dry-run");

async function chunkedUpsert(supabase, table, rows, onConflict) {
  if (DRY_RUN || rows.length === 0) return rows;
  const chunkSize = 500;
  const out = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { data, error } = await supabase
      .from(table)
      .upsert(chunk, { onConflict })
      .select("id, mongo_id");
    if (error) {
      throw new Error(
        `Upsert ${table} failed (${i}-${i + chunk.length}): ${error.message}`,
      );
    }
    if (data) out.push(...data);
  }
  return out;
}

async function main() {
  const required = [
    "MONGODB_URI",
    "MONGODB_DB",
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
  ];
  for (const key of required) {
    if (!process.env[key]) {
      console.error(`Missing required env var: ${key}`);
      process.exit(1);
    }
  }

  console.log("\nMigrate MongoDB Categories → Supabase");
  console.log(`  Dry run: ${DRY_RUN ? "YES" : "no"}\n`);

  const mongo = new MongoClient(process.env.MONGODB_URI, {
    serverApi: ServerApiVersion.v1,
  });
  await mongo.connect();
  const db = mongo.db(process.env.MONGODB_DB);

  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY,
    { auth: { persistSession: false } },
  );

  // ---------------------------------------------------------------------------
  // Walk all communities and collect their embedded categories.
  // ---------------------------------------------------------------------------
  console.log("Reading Communities from MongoDB...");
  const communities = await db
    .collection("Communities")
    .find({}, { projection: { classes: 1, name: 1 } })
    .toArray();
  console.log(`  ${communities.length} community documents.\n`);

  const seen = new Set(); // dedupe category ids across communities
  const rows = [];
  const conflicts = [];

  for (const community of communities) {
    const categories = Array.isArray(community.classes)
      ? community.classes
      : [];
    for (const category of categories) {
      if (!category?.id) continue;
      const mongoId = String(category.id);
      if (seen.has(mongoId)) {
        conflicts.push({
          mongo_id: mongoId,
          title: category.title,
          community: community.name,
        });
        continue;
      }
      seen.add(mongoId);
      rows.push({
        mongo_id: mongoId,
        name: category.title || null,
      });
    }
  }

  console.log(`Prepared ${rows.length} unique categories to upsert.`);
  if (conflicts.length > 0) {
    console.log(
      `  (${conflicts.length} duplicate category ids across communities — kept first.)`,
    );
  }

  if (rows.length > 0) {
    const upserted = await chunkedUpsert(
      supabase,
      "categories",
      rows,
      "mongo_id",
    );
    console.log(
      `  ${DRY_RUN ? "Would upsert" : "Upserted"} ${DRY_RUN ? rows.length : upserted.length} categories.`,
    );
  }

  await mongo.close();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
