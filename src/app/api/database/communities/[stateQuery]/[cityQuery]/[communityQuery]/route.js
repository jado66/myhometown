import { connectToMongoDatabase } from "@/util/db/mongodb";

export async function GET(req, { params }) {
  const { cityQuery, stateQuery, communityQuery } = params;
  const { searchParams } = new URL(req.url);
  const isEditMode = searchParams.get("isEditMode") === "true";

  let query = {
    name: communityQuery
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    city: cityQuery
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    state: stateQuery
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
  };

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
    results = await communities.find(query).toArray();
  } catch (e) {
    console.error("Error occurred while fetching communities", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while fetching communities" }),
      { status: 500 }
    );
  }

  if (results.length === 0) {
    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
    });
  } else if (!results[0].visibility && !isEditMode) {
    return new Response(
      JSON.stringify({ error: "The requested data is private" }),
      { status: 403 }
    );
  }

  return new Response(JSON.stringify(results), { status: 200 });
}

export async function PUT(req, { params }) {
  const { cityQuery, stateQuery, communityQuery } = params;

  let query = {
    name: communityQuery
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" "),
    // city: cityQuery
    //   .split("-")
    //   .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    //   .join(" "),
    // state: stateQuery
    //   .split("-")
    //   .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    //   .join(" "),
  };

  const { community } = await req.json();

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

  const { _id, ...communityWithoutId } = community;

  let modifiedCount;
  try {
    const result = await communities.updateOne(query, {
      $set: communityWithoutId,
    });
    modifiedCount = result.modifiedCount;
  } catch (e) {
    console.error("Error occurred while updating community", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while updating community" }),
      { status: 500 }
    );
  }

  return new Response(JSON.stringify({ modifiedCount }), { status: 200 });
}
