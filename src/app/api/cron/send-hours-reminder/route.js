import { sendSimpleText } from "@/util/communication/sendTexts";
import { supabaseServer } from "@/util/supabaseServer";

export const maxDuration = 300; // 5 minutes for bulk sends
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const BATCH_SIZE = 1000; // Supabase default row limit per request

/**
 * Fetch ALL missionaries with contact numbers, paginating past Supabase's 1k row limit.
 * Skips anyone whose last_reminder_text is today.
 */
async function fetchAllMissionaries() {
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const allMissionaries = [];
  let from = 0;

  while (true) {
    const { data, error } = await supabaseServer
      .from("missionaries")
      .select(
        "id, first_name, contact_number, email, last_reminder_text, assignment_status",
      )
      .not("contact_number", "is", null)
      .neq("contact_number", "")
      .neq("assignment_status", "released")
      .or(`last_reminder_text.is.null,last_reminder_text.neq.${today}`)
      .range(from, from + BATCH_SIZE - 1);

    if (error) {
      console.error("[BULK] Error fetching missionaries page:", error);
      throw error;
    }

    if (!data || data.length === 0) break;

    allMissionaries.push(...data);

    // If we got fewer than BATCH_SIZE rows, there's no next page
    if (data.length < BATCH_SIZE) break;
    from += BATCH_SIZE;
  }

  return allMissionaries;
}

/**
 * Get previous-month date boundaries used for hours queries.
 */
function getMonthBoundaries() {
  const now = new Date();
  const prev = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const monthName = prev.toLocaleString("en-US", { month: "long" });
  const year = prev.getFullYear();
  const month = prev.getMonth() + 1;
  const periodStartDate = `${year}-${String(month).padStart(2, "0")}-01`;
  const currentMonthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;
  return { monthName, periodStartDate, currentMonthStart };
}

/**
 * Fetch hours data for a single missionary for the previous month.
 * Returns { hours, logsCount }.
 */
async function getHoursForMissionary(missionaryId) {
  const { periodStartDate, currentMonthStart } = getMonthBoundaries();

  const { data: hoursDataArray, error: hoursError } = await supabaseServer
    .from("missionary_hours")
    .select("total_hours")
    .eq("missionary_id", missionaryId)
    .gte("period_start_date", periodStartDate)
    .lt("period_start_date", currentMonthStart);

  if (hoursError) {
    console.error(
      `[BULK] Error fetching hours for missionary ${missionaryId}:`,
      hoursError,
    );
  }

  const hours = Array.isArray(hoursDataArray)
    ? hoursDataArray.reduce(
        (sum, h) => sum + (parseFloat(h.total_hours) || 0),
        0,
      )
    : 0;
  const logsCount = Array.isArray(hoursDataArray) ? hoursDataArray.length : 0;

  return { hours, logsCount };
}

/**
 * Fetch hours for ALL given missionary IDs in a single paginated query.
 * Returns a Map<missionaryId, { hours, logsCount }>.
 */
async function getHoursForAllMissionaries(missionaryIds) {
  const { periodStartDate, currentMonthStart } = getMonthBoundaries();
  const hoursMap = new Map();

  // Initialize all to zero
  for (const id of missionaryIds) {
    hoursMap.set(id, { hours: 0, logsCount: 0 });
  }

  // Chunk IDs to avoid "Request Header Fields Too Large" from Supabase
  // ~100 UUIDs per chunk keeps the query string well within limits
  const ID_CHUNK_SIZE = 100;
  for (let i = 0; i < missionaryIds.length; i += ID_CHUNK_SIZE) {
    const idChunk = missionaryIds.slice(i, i + ID_CHUNK_SIZE);

    // Paginate within each chunk
    let from = 0;
    while (true) {
      const { data, error } = await supabaseServer
        .from("missionary_hours")
        .select("missionary_id, total_hours")
        .in("missionary_id", idChunk)
        .gte("period_start_date", periodStartDate)
        .lt("period_start_date", currentMonthStart)
        .range(from, from + BATCH_SIZE - 1);

      if (error) {
        console.error("[BULK] Error fetching bulk hours:", error);
        break;
      }
      if (!data || data.length === 0) break;

      for (const row of data) {
        const entry = hoursMap.get(row.missionary_id);
        if (entry) {
          entry.hours += parseFloat(row.total_hours) || 0;
          entry.logsCount += 1;
        }
      }

      if (data.length < BATCH_SIZE) break;
      from += BATCH_SIZE;
    }
  }

  return hoursMap;
}

/**
 * Build the reminder text message for a single missionary.
 */
async function buildMessageForMissionary(missionary) {
  const { monthName } = getMonthBoundaries();
  const { hours, logsCount } = await getHoursForMissionary(missionary.id);

  if (logsCount > 0) {
    return `Thank you for serving with myHometown Utah. You have reported ${hours} hours for ${monthName}. If this is incorrect, please update your hours at: https://www.myhometownut.com/admin-dashboard/hours-and-directory. Thank you!`;
  }

  return `Please report your missionary hours for ${monthName}. If you didn't serve this month, log 0 hours. This lets us know you didn't work, rather than assume you forgot to log your hours. Submit your hours at: https://www.myhometownut.com/admin-dashboard/hours-and-directory and entering your email. Thank you!`;
}

/**
 * POST /api/cron/send-hours-reminder
 *
 * Sends the monthly hours-reminder text to ALL missionaries with a phone number.
 * - Paginates through Supabase to handle >1000 missionaries
 * - Skips missionaries already texted today (last_reminder_text = today)
 * - Updates last_reminder_text on each successful send
 * - Adds a small delay between sends to avoid Twilio rate limits
 */
export async function POST(req) {
  const startTime = Date.now();

  try {
    // Check if this is a test-batch request
    let body = {};
    try {
      body = await req.json();
    } catch {
      // No body = full send
    }

    const testEmails = body?.testEmails; // e.g. ["jado66@gmail.com", ...]

    let missionaries;
    if (Array.isArray(testEmails) && testEmails.length > 0) {
      // Fetch only the specified missionaries by email
      const { data, error } = await supabaseServer
        .from("missionaries")
        .select(
          "id, first_name, contact_number, email, last_reminder_text, assignment_status",
        )
        .in("email", testEmails)
        .not("contact_number", "is", null)
        .neq("contact_number", "");

      if (error) throw error;
      missionaries = data || [];
    } else {
      missionaries = await fetchAllMissionaries();
    }
    console.log(
      `[BULK] Found ${missionaries.length} missionaries to text today.`,
    );

    const results = {
      total: missionaries.length,
      sent: 0,
      failed: 0,
      skipped: 0,
      errors: [],
    };

    const today = new Date().toISOString().split("T")[0];

    for (const missionary of missionaries) {
      try {
        const message = await buildMessageForMissionary(missionary);

        const sendResult = await sendSimpleText({
          message,
          phone: missionary.contact_number,
          name: missionary.first_name || "Missionary",
        });

        if (sendResult.success) {
          // Mark this missionary as texted today
          const { error: updateError } = await supabaseServer
            .from("missionaries")
            .update({ last_reminder_text: today })
            .eq("id", missionary.id);

          if (updateError) {
            console.error(
              `[BULK] Failed to update last_reminder_text for ${missionary.id}:`,
              updateError,
            );
          }

          results.sent++;
        } else {
          results.failed++;
          results.errors.push({
            id: missionary.id,
            email: missionary.email,
            error: sendResult.error,
          });
        }

        // Small delay to avoid Twilio rate limits (roughly 100 msgs/sec allowed,
        // but being conservative with 50ms between sends)
        await new Promise((resolve) => setTimeout(resolve, 50));
      } catch (err) {
        results.failed++;
        results.errors.push({
          id: missionary.id,
          email: missionary.email,
          error: err.message,
        });
      }
    }

    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    console.log(
      `[BULK] Done in ${elapsed}s — sent: ${results.sent}, failed: ${results.failed}, skipped: ${results.skipped}`,
    );

    return new Response(
      JSON.stringify({ ...results, elapsedSeconds: parseFloat(elapsed) }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    console.error("[BULK] Fatal error:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

/**
 * GET /api/cron/send-hours-reminder
 *
 * Dry-run: returns how many missionaries would be texted, without sending anything.
 */
export async function GET() {
  try {
    const missionaries = await fetchAllMissionaries();

    // Single bulk query for all hours instead of N+1
    const ids = missionaries.map((m) => m.id);
    const hoursMap = await getHoursForAllMissionaries(ids);

    const loggedHours = [];
    const notLogged = [];

    for (const m of missionaries) {
      const h = hoursMap.get(m.id) || { hours: 0, logsCount: 0 };
      const entry = {
        id: m.id,
        email: m.email,
        first_name: m.first_name,
        contact_number: m.contact_number,
        last_reminder_text: m.last_reminder_text,
        hours: h.hours,
        logsCount: h.logsCount,
      };
      if (h.logsCount > 0) {
        loggedHours.push(entry);
      } else {
        notLogged.push(entry);
      }
    }

    return new Response(
      JSON.stringify({
        wouldSend: missionaries.length,
        loggedHoursCount: loggedHours.length,
        notLoggedCount: notLogged.length,
        loggedHours,
        notLogged,
      }),
      { status: 200, headers: { "Content-Type": "application/json" } },
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
