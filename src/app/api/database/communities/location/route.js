import { connectToMongoDatabase } from "@/util/db/mongodb";

export async function GET(req) {
  // Get the URL parameters
  const url = new URL(req.url);
  const state = url.searchParams.get("state");
  const city = url.searchParams.get("city");

  // Validate parameters
  if (!state || !city) {
    return new Response(
      JSON.stringify({ error: "Both state and city parameters are required" }),
      { status: 400 }
    );
  }

  // Connect to mongodb and fetch communities
  let db, communities;
  try {
    ({ db } = await connectToMongoDatabase());
    communities = db.collection("Communities");
  } catch (e) {
    console.error("Error occurred while connecting to MongoDB", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while connecting to MongoDB" }),
      { status: 500 }
    );
  }

  let results;
  try {
    // Query communities matching both state and city
    results = await communities
      .find({
        state: state,
        city: city,
      })
      .toArray();

    if (!results.length) {
      return new Response(
        JSON.stringify({ message: "No communities found for this location" }),
        { status: 404 }
      );
    }
  } catch (e) {
    console.error("Error occurred while fetching communities", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while fetching communities" }),
      { status: 500 }
    );
  }

  return new Response(JSON.stringify(results), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
    },
  });
}
