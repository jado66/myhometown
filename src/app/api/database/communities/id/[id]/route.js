import { connectToMongoDatabase } from "@/util/db/mongodb";
import { ObjectId } from "mongodb";

export async function PATCH(req, { params }) {
  const { id } = params;

  // Create query - handle both ObjectId and string formats (e.g., UUIDs)
  const query = {
    _id: ObjectId.isValid(id) ? new ObjectId(id) : id,
  };

  // Get partial update data from request body
  let partialUpdate;
  try {
    partialUpdate = await req.json();
  } catch (e) {
    console.error("Error parsing request body", e);
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
    });
  }

  // Remove _id if it exists in the update data
  const { _id, ...updateData } = partialUpdate;

  let db, communities;
  try {
    ({ db } = await connectToMongoDatabase());
    communities = db.collection("Communities");
  } catch (e) {
    console.error("Error occurred while connecting to MongoDB", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while connecting to MongoDB" }),
      { status: 500 },
    );
  }

  let result;
  try {
    result = await communities.updateOne(query, { $set: updateData });

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: "Community not found" }), {
        status: 404,
      });
    }
  } catch (e) {
    console.error("Error occurred while updating community", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while updating community" }),
      { status: 500 },
    );
  }

  return new Response(
    JSON.stringify({
      modifiedCount: result.modifiedCount,
      message: "Community updated successfully",
    }),
    { status: 200 },
  );
}
