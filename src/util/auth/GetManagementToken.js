// utils/auth0TokenManager.js
let cachedToken = null;
let tokenExpiryTime = null;

export async function getManagementToken() {
  // If we have a cached token that's still valid (with 1 minute buffer), return it
  if (cachedToken && tokenExpiryTime && Date.now() < tokenExpiryTime - 60000) {
    return cachedToken;
  }

  try {
    const response = await fetch(
      `https://myhometown.us.auth0.com/oauth/token`,
      {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          client_id: process.env.AUTH0_MANAGEMENT_CLIENT_ID,
          client_secret: process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
          audience: "https://myhometown.us.auth0.com/api/v2/",
          grant_type: "client_credentials",
        }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error_description || "Failed to get management token"
      );
    }

    // Cache the token and set expiry time
    cachedToken = data.access_token;
    // Set expiry time to now + expires_in - 1 minute buffer
    tokenExpiryTime = Date.now() + data.expires_in * 1000 - 60000;

    return cachedToken;
  } catch (error) {
    console.error("Error getting management token:", error);
    throw error;
  }
}
