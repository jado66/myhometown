const ERROR_ENDPOINT = "https://platinumprogramming.com/api/errors";

export async function POST(request) {
  try {
    const body = await request.json();

    const headers = { "Content-Type": "application/json" };
    if (process.env.PLATINUM_BYPASS_SECRET) {
      headers["x-vercel-protection-bypass"] =
        process.env.PLATINUM_BYPASS_SECRET;
    }
    if (process.env.PLATINUM_ERROR_API_KEY) {
      headers["x-api-key"] = process.env.PLATINUM_ERROR_API_KEY;
    }
    console.log("[report-error] headers being sent:", JSON.stringify(headers));

    const response = await fetch(ERROR_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error(`[report-error] upstream ${response.status}:`, text);
      return new Response(text, { status: response.status });
    }

    return new Response(null, { status: 204 });
  } catch {
    return new Response(null, { status: 500 });
  }
}
