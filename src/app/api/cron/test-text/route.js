import { sendSimpleText } from "@/util/communication/sendTexts";
import { supabaseServer } from "@/util/supabaseServer";

export const maxDuration = 10; // 10 seconds should be plenty for a single text
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(req) {
  const requestId = crypto.randomUUID();
  const headers = Object.fromEntries(req.headers.entries());
  
  console.log(`[${requestId}] === CRON EXECUTION START ===`);
  console.log(`[${requestId}] Timestamp: ${new Date().toISOString()}`);
  console.log(`[${requestId}] SITE_KEYWORD: ${process.env.SITE_KEYWORD}`);
  console.log(`[${requestId}] User-Agent: ${headers['user-agent']}`);
  console.log(`[${requestId}] X-Vercel-ID: ${headers['x-vercel-id']}`);
  console.log(`[${requestId}] X-Vercel-Deployment-URL: ${headers['x-vercel-deployment-url']}`);
  console.log(`[${requestId}] All Headers:`, JSON.stringify(headers, null, 2));

  // Only run on MHT environment
  if (process.env.SITE_KEYWORD !== 'mht') {
    console.log(`[${requestId}] Skipping - not MHT environment (SITE_KEYWORD: ${process.env.SITE_KEYWORD})`);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Cron only runs on MHT environment',
        siteKeyword: process.env.SITE_KEYWORD,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  }

  try {
    // Get current month info
    const now = new Date();
    const monthName = now.toLocaleString("en-US", { month: "long" });
    const year = now.getFullYear();
    const month = now.getMonth() + 1; // 1-based month

    // Get first day of current month
    const periodStartDate = `${year}-${String(month).padStart(2, "0")}-01`;

    const phoneNumbers = ["18012548871", "18014407878", "18014554526"]; // Test phone numbers
    const results = [];

    for (const phone of phoneNumbers) {
      // Normalize phone number for comparison (remove all non-digits)
      const normalizedPhone = phone.replace(/\D/g, "");
      const searchPhone =
        normalizedPhone.length === 11 && normalizedPhone.startsWith("1")
          ? normalizedPhone.substring(1)
          : normalizedPhone;

      // Fetch all missionaries and find match by normalizing their contact numbers
      const { data: allMissionaries } = await supabaseServer
        .from("missionaries")
        .select("id, first_name, contact_number")
        .not("contact_number", "is", null);

      // Find missionary by normalizing and comparing contact numbers
      const missionary = allMissionaries?.find((m) => {
        const normalizedDbPhone = m.contact_number?.replace(/\D/g, "") || "";
        return (
          normalizedDbPhone === searchPhone ||
          normalizedDbPhone === normalizedPhone ||
          normalizedDbPhone === `1${searchPhone}`
        );
      });

      let message;

      if (missionary) {
        // Fetch hours for current month
        const { data: hoursData } = await supabaseServer
          .from("missionary_hours")
          .select("total_hours")
          .eq("missionary_id", missionary.id)
          .gte("period_start_date", periodStartDate)
          .single();

        const hours = hoursData?.total_hours || 0;

        if (hours > 0) {
          message = `Thank you for serving with myHometown Utah. You have reported ${hours} hours for the month of ${monthName}. If this is not accurate please update your hours here: https://www.myhometownut.com/admin-dashboard/hours-and-directory. Thank you!`;
        } else {
          message = `Please submit your missionary hours for the month of ${monthName}. If you did not serve this month, please log 0 hours. You can do this by going to https://www.myhometownut.com/admin-dashboard/hours-and-directory and entering your email. Thank you!`;
        }
      } else {
        // Fallback message if missionary not found
        message = `Please submit your missionary hours for the month of ${monthName}. If you did not serve this month, please log 0 hours. You can do this by going to https://www.myhometownut.com/admin-dashboard/hours-and-directory and entering your email. Thank you!`;
      }

      const result = await sendSimpleText({
        message,
        phone,
        name: missionary?.first_name || "Test User",
      });

      results.push({
        phone,
        result,
        hours: missionary ? hoursData?.total_hours || 0 : null,
        missionaryFound: !!missionary,
      });
    }

    console.log(`[${requestId}] === CRON EXECUTION END ===`);
    console.log(`[${requestId}] Total results: ${results.length}`);

    return new Response(
      JSON.stringify({
        success: true,
        results,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (error) {
    console.error("Error in test-text cron job:", error);

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
        timestamp: new Date().toISOString(),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
