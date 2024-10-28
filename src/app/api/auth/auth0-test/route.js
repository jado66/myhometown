export async function GET() {
  try {
    console.log("Testing Auth0 configuration...");

    // Log environment variables (without exposing secrets)
    console.log("Environment check:", {
      hasClientId: !!process.env.AUTH0_MANAGEMENT_CLIENT_ID,
      hasClientSecret: !!process.env.AUTH0_MANAGEMENT_CLIENT_SECRET,
    });

    // Get token
    const tokenResponse = await fetch(
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

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error("Token Error:", tokenData);
      return new Response(
        JSON.stringify({
          error: "Failed to get token",
          details: tokenData,
        }),
        { status: tokenResponse.status }
      );
    }

    console.log("Got token successfully");

    // Test the token by making a simple API call
    const testResponse = await fetch(
      "https://myhometown.us.auth0.com/api/v2/users",
      {
        headers: {
          Authorization: `Bearer ${tokenData.access_token}`,
        },
      }
    );

    const testData = await testResponse.json();
    console.log("API test response status:", testResponse.status);

    return new Response(
      JSON.stringify({
        tokenWorks: testResponse.ok,
        tokenType: tokenData.token_type,
        expiresIn: tokenData.expires_in,
        testResponseStatus: testResponse.status,
        testData: testData.length ? `Found ${testData.length} users` : testData,
      }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({
        error: error.message,
        stack: error.stack,
      }),
      { status: 500 }
    );
  }
}
