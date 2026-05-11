const ERROR_ENDPOINT = "https://platinumprogramming.com/api/errors";

export async function POST(request) {
  try {
    const body = await request.json();

    const headers = { "Content-Type": "application/json" };
    if (process.env.PLATINUM_BYPASS_SECRET) {
      headers["x-vercel-protection-bypass"] =
        process.env.PLATINUM_BYPASS_SECRET;
    }

    const response = await fetch(ERROR_ENDPOINT, {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    return new Response(null, { status: response.ok ? 204 : response.status });
  } catch {
    return new Response(null, { status: 500 });
  }
}
