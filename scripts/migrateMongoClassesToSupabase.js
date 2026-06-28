/**
 * Migrate MongoDB Classes (collection: "Classes") to Supabase.
 *
 * Targets three Supabase tables:
 *   - public.classes      (one row per Mongo class document)
 *   - public.students     (one row per signup inside the class)
 *   - public.attendance   (one row per attendance record inside the class)
 *
 * Mapping is done via the `mongo_id` columns on each Supabase table so that
 * re-running the script is idempotent.
 *
 * Categories are resolved via the Supabase `categories.mongo_id` column
 * (populated by scripts/migrateMongoCategoriesToSupabase.js). Classes with
 * an unresolved categoryId land with category_id = NULL.
 *
 * Usage:
 *   node scripts/migrateMongoClassesToSupabase.js                # full run
 *   node scripts/migrateMongoClassesToSupabase.js --dry-run      # no writes
 *   node scripts/migrateMongoClassesToSupabase.js --limit=10
 *   node scripts/migrateMongoClassesToSupabase.js --community=66a811814800d08c300d88fd
 *   node scripts/migrateMongoClassesToSupabase.js --backfill-only  # only refresh category_id on existing classes
 */

import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { MongoClient, ServerApiVersion } from "mongodb";
import { createClient } from "@supabase/supabase-js";

// -----------------------------------------------------------------------------
// CLI args
// -----------------------------------------------------------------------------
const args = process.argv.slice(2);
const flag = (name) => args.find((a) => a === `--${name}`);
const value = (name) => {
  const hit = args.find((a) => a.startsWith(`--${name}=`));
  return hit ? hit.split("=").slice(1).join("=") : null;
};

const DRY_RUN = !!flag("dry-run");
const LIMIT = value("limit") ? parseInt(value("limit"), 10) : null;
const COMMUNITY_FILTER = value("community"); // Mongo communityId
const BACKFILL_ONLY = !!flag("backfill-only");

// -----------------------------------------------------------------------------
// Legacy community ID map (old MongoDB _id → new Supabase UUID).
// Mirrors src/app/api/database/overview-report/route.ts
// -----------------------------------------------------------------------------
const newToOldCommunity = {
  "a78e8c7c-eca4-4f13-b6c8-e5603d1c36da": "66a811814800d08c300d88fd",
  "b3381b98-e44f-4f1f-b067-04e575c515ca": "66df56bef05bd41ef9493f33",
  "7c446e80-323d-4268-b595-6945e915330f": "66df56e6f05bd41ef9493f34",
  "7c8731bc-1aee-406a-9847-7dc1e5255587": "66df5707f05bd41ef9493f35",
  "0806b0f4-9d56-4c1f-b976-ee04f60af194": "66df577bf05bd41ef9493f37",
  "bf4a7d58-b880-4c18-b923-6c89e2597c71": "66df5790f05bd41ef9493f38",
  "0bdf52a4-2efa-465b-a3b1-5ec4d1701967": "66df57a2f05bd41ef9493f39",
  "995c1860-9d5b-472f-a206-1c2dd40947bd": "66df57b3f05bd41ef9493f3a",
  "af0df8f5-dab7-47e4-aafc-9247fee6f29d": "66df57c2f05bd41ef9493f3b",
  "5de22b0b-5dc8-4d72-b424-95b0d1c94fcc": "66df57d1f05bd41ef9493f3c",
  "252cd4b1-830c-4cdb-913f-a1460f218616": "66df57e6f05bd41ef9493f3d",
  "5a8ae569-ff30-465e-978f-01a6aad83e14": "6838adb32243dc8160ce207d", // Layton - Layton East
  "7d059ebc-78ee-4b47-97ab-276ae480b8de": "6a3f0427a607f560c9ece42b", // Layton - Layton West
  "4687e12e-497f-40a2-ab1b-ab455f250fce": "66df57faf05bd41ef9493f3e",
  "2bc57e19-0c73-4781-9fc6-ef26fc729847": "66df580bf05bd41ef9493f3f",
  "0076ad61-e165-4cd0-b6af-f4a30af2510c": "66df581af05bd41ef9493f40",
  "724b1aa6-0950-40ba-9453-cdd80085c5d4": "6876c09a2a087f662c17feed",
  "dcf35fbc-8053-40fa-b4a4-faaa61e2fbef": "6912655528c9b9c20ee4dede",
  "a6c19a50-7fc3-4759-b386-6ebdeca3ed9e": "fb34e335-5cc6-4e6c-b5fc-2b64588fe921",
};

// Reverse: old MongoDB id → new Supabase UUID
const legacyOldToNew = {};
for (const [newId, oldId] of Object.entries(newToOldCommunity)) {
  legacyOldToNew[oldId] = newId;
}

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------
const VALID_DAYS = new Set([
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
]);

function uniq(arr) {
  return Array.from(new Set(arr));
}

/**
 * Coerce a Mongo date string ("YYYY-MM-DD" or ISO) to "YYYY-MM-DD".
 * Returns null if unparseable.
 */
function toDateOnly(input) {
  if (!input) return null;
  const s = String(input);
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  // ISO-style
  const m = s.match(/^(\d{4}-\d{2}-\d{2})/);
  if (m) return m[1];
  const d = new Date(s);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 10);
}

/**
 * Normalize a time string to HH:MM:SS for Postgres `time` columns.
 * Accepts "HH:MM", "HH:MM:SS", or "h:MM AM/PM".
 */
function toTimeString(input) {
  if (!input) return null;
  const raw = String(input).trim();

  // 12-hour like "9:00 AM" / "12:30 PM"
  const ampm = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i);
  if (ampm) {
    let hh = parseInt(ampm[1], 10);
    const mm = ampm[2];
    const ss = ampm[3] || "00";
    const isPM = /pm/i.test(ampm[4]);
    if (hh === 12) hh = 0;
    if (isPM) hh += 12;
    return `${String(hh).padStart(2, "0")}:${mm}:${ss}`;
  }

  // 24-hour like "09:00" or "09:00:00"
  const military = raw.match(/^(\d{1,2}):(\d{2})(?::(\d{2}))?$/);
  if (military) {
    const hh = String(parseInt(military[1], 10)).padStart(2, "0");
    return `${hh}:${military[2]}:${military[3] || "00"}`;
  }

  return null;
}

function pickFirstMeeting(meetings) {
  if (!Array.isArray(meetings) || meetings.length === 0) return null;
  return meetings[0];
}

// Insert/upsert in chunks to stay under PostgREST limits.
async function chunkedUpsert(supabase, table, rows, opts = {}) {
  if (DRY_RUN || rows.length === 0) return rows;
  const chunkSize = opts.chunkSize || 500;
  const onConflict = opts.onConflict;
  const select = opts.select || "*";
  const out = [];
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    let q = supabase.from(table).upsert(chunk, { onConflict });
    if (select) q = q.select(select);
    const { data, error } = await q;
    if (error) {
      throw new Error(
        `Upsert ${table} failed (chunk ${i}-${i + chunk.length}): ${error.message}`,
      );
    }
    if (data) out.push(...data);
  }
  return out;
}

async function chunkedInsert(supabase, table, rows, chunkSize = 500) {
  if (DRY_RUN || rows.length === 0) return;
  for (let i = 0; i < rows.length; i += chunkSize) {
    const chunk = rows.slice(i, i + chunkSize);
    const { error } = await supabase.from(table).insert(chunk);
    if (error) {
      throw new Error(
        `Insert ${table} failed (chunk ${i}-${i + chunk.length}): ${error.message}`,
      );
    }
  }
}

// -----------------------------------------------------------------------------
// Build community map: Mongo community id → Supabase UUID
// -----------------------------------------------------------------------------
async function buildCommunityMap(supabase) {
  const map = new Map();
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("communities")
      .select("id, mongo_id")
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`Fetch communities failed: ${error.message}`);
    if (!data || data.length === 0) break;
    for (const row of data) {
      if (row.mongo_id) map.set(row.mongo_id, row.id);
    }
    if (data.length < pageSize) break;
    from += pageSize;
  }

  // Add legacy fallback entries (old Mongo _id → new Supabase UUID)
  for (const [oldId, newId] of Object.entries(legacyOldToNew)) {
    if (!map.has(oldId)) map.set(oldId, newId);
  }

  return map;
}

// -----------------------------------------------------------------------------
// Build category map: Mongo category id → Supabase UUID
// -----------------------------------------------------------------------------
async function buildCategoryMap(supabase) {
  const map = new Map();
  const pageSize = 1000;
  let from = 0;

  while (true) {
    const { data, error } = await supabase
      .from("categories")
      .select("id, mongo_id")
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`Fetch categories failed: ${error.message}`);
    if (!data || data.length === 0) break;
    for (const row of data) {
      if (row.mongo_id) map.set(row.mongo_id, row.id);
    }
    if (data.length < pageSize) break;
    from += pageSize;
  }

  return map;
}

// -----------------------------------------------------------------------------
// Transformers
// -----------------------------------------------------------------------------
function transformClass(cls, communityId, categoryId) {
  const meetings = Array.isArray(cls.meetings) ? cls.meetings : [];
  const first = pickFirstMeeting(meetings);

  const meetingDays = uniq(
    meetings
      .map((m) => m?.day)
      .filter((d) => typeof d === "string" && VALID_DAYS.has(d)),
  );

  return {
    mongo_id: String(cls.id),
    title: cls.title || "(untitled)",
    description: cls.description ?? null,
    start_date: toDateOnly(cls.startDate) || toDateOnly(cls.endDate),
    end_date: toDateOnly(cls.endDate) || toDateOnly(cls.startDate),
    location: cls.location ?? null,
    capacity:
      typeof cls.capacity === "number"
        ? cls.capacity
        : parseInt(cls.capacity, 10) || 0,
    show_capacity:
      typeof cls.showCapacity === "boolean" ? cls.showCapacity : true,
    icon: cls.icon ?? null,
    class_banner_url: cls.classBannerUrl ?? null,
    start_time: toTimeString(first?.startTime) || "00:00:00",
    end_time: toTimeString(first?.endTime) || "00:00:00",
    meeting_days: meetingDays,
    is_waitlist_enabled:
      typeof cls.isWaitlistEnabled === "boolean"
        ? cls.isWaitlistEnabled
        : false,
    waitlist_capacity:
      typeof cls.waitlistCapacity === "number"
        ? cls.waitlistCapacity
        : parseInt(cls.waitlistCapacity, 10) || 0,
    visibility: typeof cls.visibility === "boolean" ? cls.visibility : true,
    community_id: communityId,
    category_id: categoryId,
    created_at: cls.createdAt
      ? new Date(cls.createdAt).toISOString()
      : new Date().toISOString(),
    updated_at: cls.updatedAt
      ? new Date(cls.updatedAt).toISOString()
      : new Date().toISOString(),
  };
}

function transformSignup(signup, classUuid) {
  return {
    mongo_id: String(signup.id),
    class_id: classUuid,
    first_name: signup.firstName || "",
    last_name: signup.lastName || "",
    guardian_first_name: signup.guardianFirstName ?? null,
    guardian_last_name: signup.guardianLastName ?? null,
    email: signup.email ?? null,
    phone: signup.phone ?? null,
    communication_consent:
      typeof signup.communicationConsent === "boolean"
        ? signup.communicationConsent
        : false,
    photo_release:
      typeof signup.photoRelease === "boolean" ? signup.photoRelease : false,
    terms_accepted:
      typeof signup.termsAccepted === "boolean"
        ? signup.termsAccepted
        : typeof signup.termsAndConditions === "boolean"
          ? signup.termsAndConditions
          : false,
    created_at: signup.createdAt
      ? new Date(signup.createdAt).toISOString()
      : new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

function transformAttendance(record, classUuid, studentMongoToUuid) {
  const studentUuid = studentMongoToUuid.get(String(record.studentId));
  if (!studentUuid) return null; // orphaned attendance row → skip
  const dateOnly = toDateOnly(record.date);
  if (!dateOnly) return null;
  return {
    student_id: studentUuid,
    class_id: classUuid,
    date: dateOnly,
    present: record.present === true,
  };
}

// -----------------------------------------------------------------------------
// Main
// -----------------------------------------------------------------------------
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

  console.log("\nMigrate MongoDB Classes → Supabase");
  console.log(`  Dry run:           ${DRY_RUN ? "YES" : "no"}`);
  console.log(`  Mode:              ${BACKFILL_ONLY ? "backfill category_id only" : "full migration"}`);
  if (LIMIT) console.log(`  Limit:             ${LIMIT}`);
  if (COMMUNITY_FILTER) console.log(`  Community filter:  ${COMMUNITY_FILTER}`);
  console.log("");

  // ---------------------------------------------------------------------------
  // Connect
  // ---------------------------------------------------------------------------
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
  // Build community + category lookups
  // ---------------------------------------------------------------------------
  console.log("Loading Supabase communities...");
  const communityMap = await buildCommunityMap(supabase);
  console.log(`  ${communityMap.size} community ids known.`);

  console.log("Loading Supabase categories...");
  const categoryMap = await buildCategoryMap(supabase);
  console.log(`  ${categoryMap.size} category ids known.\n`);

  // ---------------------------------------------------------------------------
  // Pull classes from Mongo
  // ---------------------------------------------------------------------------
  const classesCollection = db.collection("Classes");
  const query = COMMUNITY_FILTER ? { communityId: COMMUNITY_FILTER } : {};
  const cursor = classesCollection.find(query);
  if (LIMIT) cursor.limit(LIMIT);
  const allClasses = await cursor.toArray();
  console.log(`Fetched ${allClasses.length} classes from MongoDB.\n`);

  // ---------------------------------------------------------------------------
  // Process
  // ---------------------------------------------------------------------------
  const stats = {
    classesProcessed: 0,
    classesUpserted: 0,
    classesSkippedNoCommunity: 0,
    classesSkippedNoId: 0,
    classesSkippedNotInSupabase: 0, // backfill-only: class not yet migrated
    categoriesLinked: 0,
    categoriesUnresolved: 0,
    studentsUpserted: 0,
    attendanceInserted: 0,
    attendanceOrphaned: 0,
    errors: 0,
  };

  const unknownCommunities = new Map(); // mongoId → count
  const unknownCategories = new Map(); // mongoId → count

  for (const cls of allClasses) {
    stats.classesProcessed++;

    if (!cls.id) {
      stats.classesSkippedNoId++;
      console.warn(
        `  ! Skipping class with no .id field (Mongo _id=${cls._id})`,
      );
      continue;
    }

    const mongoCommunityId = cls.communityId;
    const supabaseCommunityId = mongoCommunityId
      ? communityMap.get(mongoCommunityId) || null
      : null;

    if (mongoCommunityId && !supabaseCommunityId) {
      unknownCommunities.set(
        mongoCommunityId,
        (unknownCommunities.get(mongoCommunityId) || 0) + 1,
      );
      stats.classesSkippedNoCommunity++;
      continue;
    }

    // Resolve category (optional — null is allowed)
    const mongoCategoryId = cls.categoryId ? String(cls.categoryId) : null;
    const supabaseCategoryId = mongoCategoryId
      ? categoryMap.get(mongoCategoryId) || null
      : null;
    if (mongoCategoryId && !supabaseCategoryId) {
      unknownCategories.set(
        mongoCategoryId,
        (unknownCategories.get(mongoCategoryId) || 0) + 1,
      );
      stats.categoriesUnresolved++;
    } else if (supabaseCategoryId) {
      stats.categoriesLinked++;
    }

    try {
      // -----------------------------------------------------------------------
      // BACKFILL-ONLY: just update category_id on an already-migrated class.
      // -----------------------------------------------------------------------
      if (BACKFILL_ONLY) {
        if (DRY_RUN) {
          stats.classesUpserted++;
          continue;
        }
        const { data, error } = await supabase
          .from("classes")
          .update({
            category_id: supabaseCategoryId,
            updated_at: new Date().toISOString(),
          })
          .eq("mongo_id", String(cls.id))
          .select("id");
        if (error) {
          throw new Error(`backfill category_id: ${error.message}`);
        }
        if (!data || data.length === 0) {
          stats.classesSkippedNotInSupabase++;
          continue;
        }
        stats.classesUpserted++;
        continue;
      }

      const classRow = transformClass(
        cls,
        supabaseCommunityId,
        supabaseCategoryId,
      );

      // -----------------------------------------------------------------------
      // 1. Upsert the class row (returns the Supabase UUID)
      // -----------------------------------------------------------------------
      let classUuid;
      if (DRY_RUN) {
        classUuid = "(dry-run-uuid)";
      } else {
        const { data, error } = await supabase
          .from("classes")
          .upsert(classRow, { onConflict: "mongo_id" })
          .select("id")
          .single();
        if (error) {
          throw new Error(`upsert class: ${error.message}`);
        }
        classUuid = data.id;
      }
      stats.classesUpserted++;

      // -----------------------------------------------------------------------
      // 2. Upsert students (signups)
      // -----------------------------------------------------------------------
      const signups = Array.isArray(cls.signups) ? cls.signups : [];
      const validSignups = signups.filter((s) => s && s.id);

      const studentRows = validSignups.map((s) =>
        transformSignup(s, classUuid),
      );

      let studentMongoToUuid = new Map();
      if (studentRows.length > 0 && !DRY_RUN) {
        const upserted = await chunkedUpsert(
          supabase,
          "students",
          studentRows,
          { onConflict: "mongo_id", select: "id, mongo_id" },
        );
        for (const row of upserted) {
          studentMongoToUuid.set(row.mongo_id, row.id);
        }
        stats.studentsUpserted += upserted.length;
      } else if (DRY_RUN) {
        stats.studentsUpserted += studentRows.length;
      }

      // -----------------------------------------------------------------------
      // 3. Replace attendance for this class (delete-then-insert = idempotent)
      // -----------------------------------------------------------------------
      const attendanceRecords = Array.isArray(cls.attendance)
        ? cls.attendance
        : [];

      if (!DRY_RUN) {
        const { error: delError } = await supabase
          .from("attendance")
          .delete()
          .eq("class_id", classUuid);
        if (delError) {
          throw new Error(`delete attendance: ${delError.message}`);
        }
      }

      const attendanceRows = [];
      for (const record of attendanceRecords) {
        const row = transformAttendance(record, classUuid, studentMongoToUuid);
        if (!row) {
          stats.attendanceOrphaned++;
          continue;
        }
        attendanceRows.push(row);
      }

      if (attendanceRows.length > 0) {
        await chunkedInsert(supabase, "attendance", attendanceRows);
        stats.attendanceInserted += attendanceRows.length;
      }

      if (stats.classesProcessed % 25 === 0) {
        console.log(
          `  ... ${stats.classesProcessed}/${allClasses.length} ` +
            `(classes:${stats.classesUpserted} students:${stats.studentsUpserted} attendance:${stats.attendanceInserted})`,
        );
      }
    } catch (err) {
      stats.errors++;
      console.error(
        `  ✖ Error on class ${cls.id} ("${cls.title || "?"}"): ${err.message}`,
      );
    }
  }

  // ---------------------------------------------------------------------------
  // Summary
  // ---------------------------------------------------------------------------
  console.log("\n--- Migration summary ---");
  console.log(`  Classes processed:            ${stats.classesProcessed}`);
  console.log(
    `  Classes ${BACKFILL_ONLY ? "updated" : "upserted"}:             ${stats.classesUpserted}`,
  );
  console.log(`  Classes skipped (no id):      ${stats.classesSkippedNoId}`);
  console.log(
    `  Classes skipped (unknown community): ${stats.classesSkippedNoCommunity}`,
  );
  if (BACKFILL_ONLY) {
    console.log(
      `  Classes skipped (not yet in Supabase): ${stats.classesSkippedNotInSupabase}`,
    );
  }
  console.log(`  Categories linked:            ${stats.categoriesLinked}`);
  console.log(`  Categories unresolved:        ${stats.categoriesUnresolved}`);
  if (!BACKFILL_ONLY) {
    console.log(`  Students upserted:            ${stats.studentsUpserted}`);
    console.log(`  Attendance rows inserted:     ${stats.attendanceInserted}`);
    console.log(
      `  Attendance rows orphaned:     ${stats.attendanceOrphaned} (unknown studentId)`,
    );
  }
  console.log(`  Errors:                       ${stats.errors}`);

  if (unknownCommunities.size > 0) {
    console.log("\n  Unknown community ids (no Supabase match):");
    const sorted = Array.from(unknownCommunities.entries()).sort(
      (a, b) => b[1] - a[1],
    );
    for (const [id, count] of sorted) {
      console.log(`    ${id}  →  ${count} class(es)`);
    }
  }

  if (unknownCategories.size > 0) {
    console.log(
      "\n  Unknown category ids (class.categoryId not in Supabase categories):",
    );
    const sorted = Array.from(unknownCategories.entries()).sort(
      (a, b) => b[1] - a[1],
    );
    for (const [id, count] of sorted.slice(0, 20)) {
      console.log(`    ${id}  →  ${count} class(es)`);
    }
    if (sorted.length > 20) {
      console.log(`    ... and ${sorted.length - 20} more`);
    }
  }

  await mongo.close();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("\nFatal error:", err);
  process.exit(1);
});
