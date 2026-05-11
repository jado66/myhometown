const ERROR_ENDPOINT = "https://platinumprogramming.com/api/errors";
const PROJECT_ID = "myhome";

/**
 * Reports an error to the Platinum Programming dashboard.
 * Fire-and-forget — does not throw.
 *
 * @param {Error|string} error
 * @param {object} [extra]  Extra metadata (userId, context, etc.)
 */
export async function reportError(error, extra = {}) {
  try {
    const message = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : undefined;

    await fetch(ERROR_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message,
        stack,
        page_url: typeof window !== "undefined" ? window.location.href : undefined,
        reporter: "myhometown",
        project_id: PROJECT_ID,
        metadata: {
          ...extra,
          userAgent: typeof navigator !== "undefined" ? navigator.userAgent : undefined,
        },
      }),
    });
  } catch {
    // Silently swallow — error reporting must never crash the app
  }
}
