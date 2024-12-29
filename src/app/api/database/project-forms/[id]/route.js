// app/api/database/project-forms/[id]/route.js
import { connectToMongoDatabase } from "@/util/db/mongodb";

export async function GET(request, { params }) {
  const { id } = params;

  let db, projectForms;
  try {
    ({ db } = await connectToMongoDatabase());
    projectForms = db.collection("ProjectForms");

    const result = await projectForms.findOne({ id });
    if (!result) {
      return new Response(JSON.stringify({ error: "Project form not found" }), {
        status: 404,
      });
    }
    return new Response(JSON.stringify(result), { status: 200 });
  } catch (e) {
    console.error("Error occurred while fetching project form", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while fetching project form" }),
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  const { id } = params;
  const updateData = await request.json();

  // Remove _id from updateData if it exists
  const { _id, ...dataToUpdate } = updateData;

  let db, projectForms;
  try {
    ({ db } = await connectToMongoDatabase());
    projectForms = db.collection("ProjectForms");

    const result = await projectForms.findOneAndUpdate(
      { id },
      {
        $set: {
          ...dataToUpdate, // Use filtered data
          updatedAt: new Date().toISOString(),
        },
      },
      { returnDocument: "after" }
    );

    if (!result) {
      return new Response(JSON.stringify({ error: "Project form not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (e) {
    console.error("Error occurred while updating project form", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while updating project form" }),
      { status: 500 }
    );
  }
}
