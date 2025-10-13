import { NextRequest, NextResponse } from "next/server";
import { supabaseServer } from "@/util/supabaseServer";

// Chunked existing email fetch helper (defined at module scope to satisfy ES5 strict mode)
async function fetchExistingEmailSet(emails: string[]): Promise<{
  set: Set<string>;
  error?: any;
}> {
  // Avoid Set spread to support ES5 target without downlevelIteration
  const dedupMap: { [k: string]: true } = {};
  for (let i = 0; i < emails.length; i++) {
    const e = emails[i];
    if (e) dedupMap[e] = true;
  }
  const unique: string[] = Object.keys(dedupMap);
  const CHUNK = 500;
  const result = new Set<string>();
  for (let i = 0; i < unique.length; i += CHUNK) {
    const chunk = unique.slice(i, i + CHUNK);
    if (chunk.length === 0) continue;
    const { data, error } = await supabaseServer
      .from("missionaries")
      .select("email")
      .in("email", chunk);
    if (error) {
      return { set: result, error };
    }
    if (data) {
      for (let j = 0; j < data.length; j++) {
        const email = data[j].email;
        if (email) result.add(email);
      }
    }
  }
  return { set: result };
}

// Reuse duration calculation logic
function calculateDuration(
  startDate: string | null,
  endDate: string | null
): number | null {
  if (!startDate || !endDate) return null;
  const start = new Date(startDate);
  const end = new Date(endDate);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return null;
  const yearsDiff = end.getFullYear() - start.getFullYear();
  const monthsDiff = end.getMonth() - start.getMonth();
  const daysDiff = end.getDate() - start.getDate();
  let totalMonths = yearsDiff * 12 + monthsDiff;
  if (daysDiff >= 15) totalMonths += 1;
  else if (daysDiff <= -15) totalMonths -= 1;
  return Math.max(0, totalMonths);
}

// Validate a single missionary payload; returns list of error messages (empty if valid)
function validateMissionary(m: any): string[] {
  const errors: string[] = [];
  const email = m.email?.trim();
  const first = m.first_name?.trim();
  const last = m.last_name?.trim();
  const level = m.assignment_level?.trim().toLowerCase();
  const status = m.assignment_status?.trim().toLowerCase();

  if (!email) errors.push("Email is required");
  if (!first) errors.push("First name is required");
  if (!last) errors.push("Last name is required");

  if (status && !["active", "inactive", "pending"].includes(status)) {
    errors.push("Invalid assignment_status (must be active|inactive|pending)");
  }
  if (level && !["state", "city", "community"].includes(level)) {
    errors.push("Invalid assignment_level (must be state|city|community)");
  }

  // Level-specific constraints
  if (level === "state" && (m.city_id || m.community_id)) {
    errors.push("State level cannot include city_id or community_id");
  }
  if (level === "city" && (!m.city_id || m.community_id)) {
    errors.push(
      "City level requires city_id and must not include community_id"
    );
  }
  if (level === "community" && !m.community_id) {
    errors.push("Community level requires community_id");
  }
  return errors;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const missionaries: any[] = body.missionaries;
    const verbose =
      request.nextUrl.searchParams.get("verbose") === "1" ||
      request.nextUrl.searchParams.get("verbose") === "true";

    if (!Array.isArray(missionaries) || missionaries.length === 0) {
      return NextResponse.json(
        { error: "'missionaries' must be a non-empty array" },
        { status: 400 }
      );
    }

    // Per-record status tracking
    interface RecordStatus {
      index: number;
      email?: string;
      status: string; // pending|invalid_validation|duplicate_payload|duplicate_existing|will_insert|inserted|insertion_failed|skipped
      errors?: string[];
    }
    const recordStatuses: RecordStatus[] = missionaries.map((m, i) => ({
      index: i,
      email: (m.email || "").trim(),
      status: "pending",
    }));

    // Normalize & collect emails + validation
    const prepared: any[] = [];
    const invalid: { index: number; email?: string; errors: string[] }[] = [];
    const duplicateInPayload = new Set<string>();
    const seenEmails = new Set<string>();

    missionaries.forEach((raw, index) => {
      const m = { ...raw };
      m.assignment_status = raw.assignment_status?.toLowerCase() || "active";
      m.assignment_level = raw.assignment_level?.toLowerCase() || null;
      const email = (m.email || "").trim();
      if (email && seenEmails.has(email)) {
        duplicateInPayload.add(email);
      }
      if (email) seenEmails.add(email);

      const errors = validateMissionary(m);
      if (errors.length) {
        invalid.push({ index, email, errors });
        recordStatuses[index].status = "invalid_validation";
        recordStatuses[index].errors = errors;
        return; // do not push to prepared
      }

      if (m.assignment_level === "state") {
        m.city_id = null;
        m.community_id = null;
      }

      if (!m.duration && m.start_date && m.end_date) {
        const months = calculateDuration(m.start_date, m.end_date);
        if (months !== null) m.duration = `${months} months`;
      }

      // track original index for later
      m._originalIndex = index;
      prepared.push(m);
      recordStatuses[index].status = "validated";
    });

    // Mark duplicates in payload
    if (duplicateInPayload.size) {
      for (let i = 0; i < missionaries.length; i++) {
        const email = recordStatuses[i].email;
        if (
          email &&
          duplicateInPayload.has(email) &&
          recordStatuses[i].status !== "invalid_validation"
        ) {
          recordStatuses[i].status = "duplicate_payload";
        }
      }
    }

    // Valid records are those prepared (invalid skipped earlier)
    const validRecords = prepared;

    const emailList = validRecords.map((r) => r.email).filter(Boolean);
    const { set: existingEmailSet, error: existingError } =
      await fetchExistingEmailSet(emailList);
    if (existingError) {
      console.error("Bulk existing email lookup error", existingError);
      return NextResponse.json(
        { error: "Failed to check existing missionaries" },
        { status: 500 }
      );
    }
    // Build duplicates array without relying on iterator protocol (for older TS targets)
    const dupCollector: string[] = [];
    duplicateInPayload.forEach((d) => dupCollector.push(d));
    existingEmailSet.forEach((d) => dupCollector.push(d));
    const duplicates = dupCollector.filter((v, i, arr) => arr.indexOf(v) === i);

    // Mark duplicates existing
    for (let i = 0; i < recordStatuses.length; i++) {
      const rs = recordStatuses[i];
      if (
        rs.status === "validated" &&
        rs.email &&
        existingEmailSet.has(rs.email)
      ) {
        rs.status = "duplicate_existing";
      }
    }

    // Filter out duplicates from insertion list (only those still validated)
    const recordsToInsert = validRecords.filter(
      (r) => recordStatuses[r._originalIndex]?.status === "validated"
    );

    // Mark will_insert
    for (let i = 0; i < recordsToInsert.length; i++) {
      const orig = recordsToInsert[i]._originalIndex;
      if (recordStatuses[orig]) recordStatuses[orig].status = "will_insert";
    }

    // Chunk insert to avoid row limits (Supabase recommends <= 1000 rows; use 200 for safety)
    const CHUNK_SIZE = 200;
    const inserted: any[] = [];
    for (let i = 0; i < recordsToInsert.length; i += CHUNK_SIZE) {
      const chunk = recordsToInsert.slice(i, i + CHUNK_SIZE);
      if (chunk.length === 0) continue;
      const { data, error } = await supabaseServer
        .from("missionaries")
        .insert(
          chunk.map((c) => ({
            email: c.email,
            first_name: c.first_name,
            last_name: c.last_name,
            city_id: c.city_id || null,
            community_id: c.community_id || null,
            assignment_status: c.assignment_status || "active",
            assignment_level: c.assignment_level || null,
            contact_number: c.contact_number || null,
            notes: c.notes || "",
            title: c.title || null,
            group: c.group || null,
            start_date: c.start_date || null,
            end_date: c.end_date || null,
            duration: c.duration || null,
            stake_name: c.stake_name || null,
            gender: c.gender || null,
            profile_picture_url: c.profile_picture_url || "",
            preferred_entry_method: c.preferred_entry_method || null,
            last_login: c.last_login || null,
            street_address: c.street_address || null,
            address_city: c.address_city || null,
            address_state: c.address_state || null,
            zip_code: c.zip_code || null,
            person_type: c.person_type || null,
            position_detail: c.position_detail || null,
          }))
        )
        .select();
      if (error) {
        console.error("Bulk insert chunk error", error);
        // Mark entire chunk as failed
        chunk.forEach((c) => {
          const origIndex = c._originalIndex;
          invalid.push({
            index: origIndex,
            email: c.email,
            errors: ["Insert failure"],
          });
          if (recordStatuses[origIndex]) {
            recordStatuses[origIndex].status = "insertion_failed";
            recordStatuses[origIndex].errors = ["Insert failure"];
          }
        });
        continue;
      }
      inserted.push(...(data || []));
      // Mark inserted
      (data || []).forEach((row: any) => {
        // Try to match by email and original index if stored
        for (let i = 0; i < recordsToInsert.length; i++) {
          const r = recordsToInsert[i];
          if (r.email === row.email) {
            const origIndex = r._originalIndex;
            if (recordStatuses[origIndex]) {
              recordStatuses[origIndex].status = "inserted";
            }
            break;
          }
        }
      });
    }

    // Add calculated_duration to response (not stored)
    const insertedWithDuration = inserted.map((m) => ({
      ...m,
      calculated_duration: calculateDuration(m.start_date, m.end_date),
    }));

    const summary = {
      requested: missionaries.length,
      valid: validRecords.length,
      inserted: inserted.length,
      duplicates,
      invalidCount: invalid.length,
    };

    return NextResponse.json({
      summary,
      inserted: insertedWithDuration,
      duplicates,
      invalid,
      ...(verbose ? { recordStatuses } : {}),
    });
  } catch (err) {
    console.error("Bulk missionaries API error", err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
