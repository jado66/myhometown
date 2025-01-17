import { connectToMongoDatabase } from "@/util/db/mongodb";

// Remove a signup from a class
export async function DELETE(req, { params }) {
  const { id, signupId } = params;

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

    // Remove the signup from the signups array
    const result = await classes.updateOne(
      { id },
      { $pull: { signups: { id: signupId } } }
    );

    if (result.modifiedCount === 0) {
      return new Response(JSON.stringify({ error: "Signup not found" }), {
        status: 404,
      });
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Signup removed successfully",
      }),
      { status: 200 }
    );
  } catch (e) {
    console.error("Error occurred while removing signup", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while removing signup" }),
      { status: 500 }
    );
  }
}
