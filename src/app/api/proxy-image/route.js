// Server-side proxy for fetching images from our S3 bucket. The bucket
// does not return CORS headers, so client-side `fetch()` calls (e.g. from
// the report generators) get blocked. Routing through this endpoint
// avoids the browser-level CORS check entirely.

const ALLOWED_HOST_SUFFIX = ".s3.us-west-1.amazonaws.com";
const ALLOWED_BUCKET_HOST = "myhometown-bucket.s3.us-west-1.amazonaws.com";

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const url = searchParams.get("url");

  if (!url) {
    return new Response(JSON.stringify({ error: "Missing url parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return new Response(JSON.stringify({ error: "Invalid url parameter" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  // Only allow our S3 bucket to prevent the proxy being abused as an
  // open relay.
  if (
    parsed.hostname !== ALLOWED_BUCKET_HOST &&
    !parsed.hostname.endsWith(ALLOWED_HOST_SUFFIX)
  ) {
    return new Response(JSON.stringify({ error: "Host not allowed" }), {
      status: 403,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const upstream = await fetch(parsed.toString());
    if (!upstream.ok) {
      return new Response(
        JSON.stringify({
          error: `Upstream fetch failed: ${upstream.status} ${upstream.statusText}`,
        }),
        {
          status: upstream.status,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    const contentType =
      upstream.headers.get("content-type") || "application/octet-stream";
    const body = await upstream.arrayBuffer();

    return new Response(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=3600",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message || "Proxy request failed" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    );
  }
}
