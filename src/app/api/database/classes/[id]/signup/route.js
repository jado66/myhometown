import { connectToMongoDatabase } from "@/util/db/mongodb";
import { v4 as uuidv4 } from "uuid";

// Signup for a class
export async function POST(req, { params }) {
  const { id } = params;
  const signupData = await req.json();

  let db, classes;
  try {
    ({ db } = await connectToMongoDatabase());
    classes = db.collection("Classes");

    const classDoc = await classes.findOne({ id });
    if (!classDoc) {
      return new Response(JSON.stringify({ error: "Class not found" }), {
        status: 404,
      });
    }

    // Check capacity if it's set
    if (
      classDoc.capacity &&
      classDoc.signups.length >= parseInt(classDoc.capacity)
    ) {
      return new Response(JSON.stringify({ error: "Class is full" }), {
        status: 400,
      });
    }

    // Generate a unique ID for the signup
    const signupId = uuidv4();

    const signupWithId = {
      ...signupData,
      id: signupId,
      createdAt: new Date().toISOString(),
    };

    const result = await classes.updateOne(
      { id },
      { $push: { signups: signupWithId } }
    );

    return new Response(
      JSON.stringify({
        success: true,
        signup: signupWithId,
      }),
      { status: 201 }
    );
  } catch (e) {
    console.error("Error occurred while processing signup", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while processing signup" }),
      { status: 500 }
    );
  }
}
import { connectToMongoDatabase } from "@/util/db/mongodb";
import { v4 as uuidv4 } from "uuid";

// Signup for a class
export async function POST(req, { params }) {
  const { id } = params;
  const signupData = await req.json();

  let db, classes;
  try {
    ({ db } = await connectToMongoDatabase());
    classes = db.collection("Classes");

    const classDoc = await classes.findOne({ id });
    if (!classDoc) {
      return new Response(JSON.stringify({ error: "Class not found" }), {
        status: 404,
      });
    }

    // Check capacity if it's set
    if (
      classDoc.capacity &&
      classDoc.signups.length >= parseInt(classDoc.capacity)
    ) {
      return new Response(JSON.stringify({ error: "Class is full" }), {
        status: 400,
      });
    }

    // Generate a unique ID for the signup
    const signupId = uuidv4();

    const signupWithId = {
      ...signupData,
      id: signupId,
      createdAt: new Date().toISOString(),
    };

    const result = await classes.updateOne(
      { id },
      { $push: { signups: signupWithId } }
    );

    return new Response(
      JSON.stringify({
        success: true,
        signup: signupWithId,
      }),
      { status: 201 }
    );
  } catch (e) {
    console.error("Error occurred while processing signup", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while processing signup" }),
      { status: 500 }
    );
  }
}
