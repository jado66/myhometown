import { connectToMongoDatabase } from "@/util/db/mongodb";

export async function GET(req, { params }) {
  const { id } = params;

  let db, classes;
  try {
    ({ db } = await connectToMongoDatabase());
    classes = db.collection("Classes");

    // Find all classes that belong to the specified community
    const results = await classes
      .find({ communityId: id })
      .sort({ createdAt: -1 }) // Optional: sort by creation date, newest first
      .toArray();

    if (!results || results.length === 0) {
      return new Response(
        JSON.stringify({
          error: "No classes found for this community",
          results: [],
        }),
        { status: 404 }
      );
    }

    return new Response(JSON.stringify({ results }), { status: 200 });
  } catch (e) {
    console.error("Error occurred while fetching classes by community", e);
    return new Response(
      JSON.stringify({
        error: "Error occurred while fetching classes by community",
        details: e.message,
      }),
      { status: 500 }
    );
  }
}
