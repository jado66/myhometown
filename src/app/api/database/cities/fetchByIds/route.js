import { connectToMongoDatabase } from "@/util/db/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req, res) {
  const ids = await req.json(); // ids should be an array received from the body

  // Filter out invalid ObjectIds and convert valid ones
  const validObjectIds = ids
    .filter((id) => id && ObjectId.isValid(id))
    .map((id) => new ObjectId(id));

  if (validObjectIds.length === 0) {
    return new Response(JSON.stringify({ error: "No valid IDs provided" }), {
      status: 400,
    });
  }

  // Prepare the query object for MongoDB:
  let query = {
    _id: {
      $in: validObjectIds,
    },
  };

  // Connect to mongodb and fetch cities
  let db, cities;
  try {
    ({ db } = await connectToMongoDatabase());
    cities = db.collection("Cities");
  } catch (e) {
    console.error("Error occurred while connecting to MongoDB", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while connecting to MongoDB" }),
      { status: 500 }
    );
  }

  let results;
  try {
    results = await cities.find(query).toArray();
  } catch (e) {
    console.error("Error occurred while fetching cities", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while fetching cities" }),
      { status: 500 }
    );
  }
  return new Response(JSON.stringify(results), { status: 200 });
}
