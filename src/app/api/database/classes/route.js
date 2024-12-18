//\src\app\api\database\classes\route.js
import { connectToMongoDatabase } from "@/util/db/mongodb";

// GET request to fetch all classes
export async function GET() {
  let db, classes;
  try {
    ({ db } = await connectToMongoDatabase());
    classes = db.collection("Classes");
    const results = await classes.find({}).toArray();
    return new Response(JSON.stringify(results), { status: 200 });
  } catch (e) {
    console.error("Error occurred while fetching classes", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while fetching classes" }),
      { status: 500 }
    );
  }
}

export async function POST(req) {
  const classData = await req.json();

  // Ensure the incoming data has an id
  if (!classData.id) {
    return new Response(
      JSON.stringify({ error: "Class data must include an id" }),
      { status: 400 }
    );
  }

  let db, classes;
  try {
    ({ db } = await connectToMongoDatabase());
    classes = db.collection("Classes");

    // Check if a class with this ID already exists
    const existing = await classes.findOne({ id: classData.id });
    if (existing) {
      return new Response(
        JSON.stringify({ error: "Class with this ID already exists" }),
        { status: 409 }
      );
    }

    const result = await classes.insertOne({
      ...classData,
      createdAt: classData.createdAt || new Date().toISOString(),
      signups: classData.signups || [],
      attendance: classData.attendance || [],
    });

    return new Response(
      JSON.stringify({ ...classData, _id: result.insertedId }),
      { status: 201 }
    );
  } catch (e) {
    console.error("Error occurred while creating class", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while creating class" }),
      { status: 500 }
    );
  }
}
