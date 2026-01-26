import { sendSimpleText } from "@/util/communication/sendTexts";
import { supabaseServer } from "@/util/supabaseServer";

export const maxDuration = 10; // 10 seconds should be plenty for a single text
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Helper to get preview message and missionary info for an email
async function getPreviewForEmail(email) {
  // Get current month info
  const now = new Date();
  const monthName = now.toLocaleString("en-US", { month: "long" });
  const year = now.getFullYear();
  const month = now.getMonth() + 1; // 1-based month
  const periodStartDate = `${year}-${String(month).padStart(2, "0")}-01`;

  // Fetch missionary by email
  const { data: missionaries } = await supabaseServer
    .from("missionaries")
    .select("id, first_name, contact_number, email")
    .ilike("email", email);

  console.log(
    "[DEBUG] missionaries fetched by email:",
    JSON.stringify(missionaries, null, 2),
  );

  const missionary =
    Array.isArray(missionaries) && missionaries.length > 0
      ? missionaries[0]
      : null;

  let message;
  let hoursData = null;

  if (missionary) {
    // Fetch all hours for current month and sum them
    const { data: hoursDataArray, error: hoursError } = await supabaseServer
      .from("missionary_hours")
      .select("total_hours")
      .eq("missionary_id", missionary.id)
      .gte("period_start_date", periodStartDate);

    if (hoursError) {
      console.error(
        `[API] Error fetching hours for missionary ${missionary.id}:`,
        hoursError,
      );
    }

    // Sum all total_hours (convert to number in case it's string)
    const hours = Array.isArray(hoursDataArray)
      ? hoursDataArray.reduce(
          (sum, h) => sum + (parseFloat(h.total_hours) || 0),
          0,
        )
      : 0;
    const logsCount = Array.isArray(hoursDataArray) ? hoursDataArray.length : 0;

    if (logsCount > 0) {
      message = `Thank you for serving with myHometown Utah. You have reported ${hours} hours for ${monthName}. If this is incorrect, please update your hours at: https://www.myhometownut.com/admin-dashboard/hours-and-directory. Thank you!`;
    } else {
      message = `Please report your missionary hours for ${monthName}. If you didn't serve this month, log 0 hours. This lets us know you didn't work, rather than assume you forgot to log your hours. Submit your hours at: https://www.myhometownut.com/admin-dashboard/hours-and-directory and entering your email. Thank you!`;
    }
    hoursData = { total_hours: hours, logs_count: logsCount };
  } else {
    message = `Please report your missionary hours for ${monthName}. If you didn't serve this month, log 0 hours. This lets us know you didn't work, rather than assume you forgot to log your hours. Submit your hours at: https://www.myhometownut.com/admin-dashboard/hours-and-directory and entering your email. Thank you!`;
  }

  return {
    missionary,
    previewMessage: message,
    hours: hoursData?.total_hours || 0,
    missionaryFound: !!missionary,
  };
}

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get("email");
  if (!email) {
    return new Response(JSON.stringify({ error: "Missing email parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }
  try {
    const preview = await getPreviewForEmail(email);
    return new Response(JSON.stringify(preview), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

export async function POST(req) {
  try {
    const { email } = await req.json();
    if (!email) {
      return new Response(JSON.stringify({ error: "Missing email in body" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }
    const preview = await getPreviewForEmail(email);
    if (!preview.missionary || !preview.missionary.contact_number) {
      return new Response(
        JSON.stringify({
          error: "Missionary or contact number not found for this email.",
        }),
        { status: 404, headers: { "Content-Type": "application/json" } },
      );
    }
    // Actually send the text to the missionary's contact_number
    const result = await sendSimpleText({
      message: preview.previewMessage,
      phone: preview.missionary.contact_number,
      name: preview.missionary.first_name || "Test User",
    });
    return new Response(JSON.stringify({ success: true, result }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
