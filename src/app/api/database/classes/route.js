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

// POST request to create a new class
export async function POST(req) {
  const classData = await req.json();

  let db, classes;
  try {
    ({ db } = await connectToMongoDatabase());
    classes = db.collection("Classes");
    const result = await classes.insertOne({
      ...classData,
      createdAt: new Date().toISOString(),
      signups: [],
    });
    return new Response(JSON.stringify(result), { status: 201 });
  } catch (e) {
    console.error("Error occurred while creating class", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while creating class" }),
      { status: 500 }
    );
  }
}
