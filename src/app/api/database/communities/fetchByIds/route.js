import { connectToMongoDatabase } from "@/util/db/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req, res) {
  const ids = await req.json(); // ids should be an array received from the body

  // Prepare the query object for MongoDB:
  let query = {
    _id: {
      $in: ids.map((id) => {
        // Check if the ID is in MongoDB ObjectId format
        if (/^[0-9a-fA-F]{24}$/.test(id)) {
          return new ObjectId(id);
        } else {
          // If not in ObjectId format, use the string ID directly
          return id;
        }
      }),
    },
  };

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
    results = await communities.find(query).toArray();
  } catch (e) {
    console.error("Error occurred while fetching communities", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while fetching communities" }),
      { status: 500 }
    );
  }
  return new Response(JSON.stringify(results), { status: 200 });
}
