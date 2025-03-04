import { connectToMongoDatabase } from "@/util/db/mongodb";
export async function PUT(req, { params }) {
  const { id, signupId } = params; // Class ID and Student ID
  const updatedStudentData = await req.json();

  if (!signupId) {
    return new Response(JSON.stringify({ error: "Student ID is required" }), {
      status: 400,
    });
  }

  // Remove any fields that shouldn't be updated
  const {
    id: _,
    createdAt,
    isWaitlisted,
    promotedAt,
    ...allowedUpdates
  } = updatedStudentData;

  let db, classes;
  try {
    ({ db } = await connectToMongoDatabase());
    classes = db.collection("Classes");

    // Find the class document
    const classDoc = await classes.findOne({ id });
    if (!classDoc) {
      return new Response(JSON.stringify({ error: "Class not found" }), {
        status: 404,
      });
    }

    // Find the student in the signups array
    const studentIndex = classDoc.signups.findIndex(
      (signup) => signup.id === signupId
    );

    if (studentIndex === -1) {
      return new Response(
        JSON.stringify({ error: "Student not found in class roster" }),
        {
          status: 404,
        }
      );
    }

    // Get the current student data
    const currentStudentData = classDoc.signups[studentIndex];

    // Merge the current data with allowed updates
    // This preserves important fields like isWaitlisted, createdAt, etc.
    const updatedStudent = {
      ...currentStudentData,
      ...allowedUpdates,
      // Keep the original ID
      id: signupId,
    };

    // Update the student in the database
    const result = await classes.updateOne(
      { id, "signups.id": signupId },
      { $set: { "signups.$": updatedStudent } }
    );

    if (result.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Failed to update student information" }),
        { status: 500 }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        student: updatedStudent,
      }),
      { status: 200 }
    );
  } catch (e) {
    console.error("Error occurred while updating student information", e);
    return new Response(
      JSON.stringify({
        error: "Error occurred while updating student information",
      }),
      { status: 500 }
    );
  }
}
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
