import { connectToMongoDatabase } from "@/util/db/mongodb";

//\src\app\api\database\classes\[id]\route.js
export async function GET(req, { params }) {
  const { id } = params;

  let db, classes;
  try {
    ({ db } = await connectToMongoDatabase());
    classes = db.collection("Classes");
    const result = await classes.findOne({ id });

    if (!result) {
      return new Response(JSON.stringify({ error: "Class not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (e) {
    console.error("Error occurred while fetching class", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while fetching class" }),
      { status: 500 }
    );
  }
}

// Update the class with the given ID
export async function PUT(req, { params }) {
  const { id } = params;
  const updateData = await req.json();

  // Remove attendance and signups from the update data if present
  const { attendance, signups, ...safeUpdateData } = updateData;

  let db, classes;
  try {
    ({ db } = await connectToMongoDatabase());
    classes = db.collection("Classes");

    const result = await classes.updateOne({ id }, { $set: safeUpdateData });

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: "Class not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (e) {
    console.error("Error occurred while updating class", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while updating class" }),
      { status: 500 }
    );
  }
}

// Delete the class with the given ID
export async function DELETE(req, { params }) {
  const { id } = params;

  let db, classes;
  try {
    ({ db } = await connectToMongoDatabase());
    classes = db.collection("Classes");
    const result = await classes.deleteOne({ id });

    if (result.deletedCount === 0) {
      return new Response(JSON.stringify({ error: "Class not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (e) {
    console.error("Error occurred while deleting class", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while deleting class" }),
      { status: 500 }
    );
  }
}
