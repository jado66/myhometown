// app/api/database/project-forms/route.js
import { connectToMongoDatabase } from "@/util/db/mongodb";

export async function GET() {
  let db, projectForms;
  try {
    ({ db } = await connectToMongoDatabase());
    projectForms = db.collection("ProjectForms");

    const results = await projectForms.find({}).toArray();
    return new Response(JSON.stringify(results), { status: 200 });
  } catch (e) {
    console.error("Error occurred while fetching project forms", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while fetching project forms" }),
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const projectData = await request.json();

  if (!projectData.id) {
    return new Response(
      JSON.stringify({ error: "Project data must include an id" }),
      { status: 400 }
    );
  }

  let db, projectForms;
  try {
    ({ db } = await connectToMongoDatabase());
    projectForms = db.collection("ProjectForms");

    const existing = await projectForms.findOne({ id: projectData.id });
    if (existing) {
      return new Response(
        JSON.stringify({ error: "Project form with this ID already exists" }),
        { status: 409 }
      );
    }

    const result = await projectForms.insertOne({
      ...projectData,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    return new Response(
      JSON.stringify({ ...projectData, _id: result.insertedId }),
      { status: 201 }
    );
  } catch (e) {
    console.error("Error occurred while creating project form", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while creating project form" }),
      { status: 500 }
    );
  }
}
