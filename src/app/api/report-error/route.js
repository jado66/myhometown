const ERROR_ENDPOINT = "https://platinumprogramming.com/api/errors";

export async function POST(request) {
  try {
    const body = await request.json();

    const response = await fetch(ERROR_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    return new Response(null, { status: response.ok ? 204 : response.status });
  } catch {
    return new Response(null, { status: 500 });
  }
}
