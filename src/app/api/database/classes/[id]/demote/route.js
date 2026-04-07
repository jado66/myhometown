import { connectToMongoDatabase } from "@/util/db/mongodb";

export async function POST(req, { params }) {
  const { id } = params; // Class ID
  const { studentId } = await req.json();

  if (!studentId) {
    return new Response(JSON.stringify({ error: "Student ID is required" }), {
      status: 400,
    });
  }

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
      (signup) => signup.id === studentId,
    );

    if (studentIndex === -1) {
      return new Response(
        JSON.stringify({ error: "Student not found in class roster" }),
        { status: 404 },
      );
    }

    // Check if the student is already waitlisted
    if (classDoc.signups[studentIndex].isWaitlisted) {
      return new Response(
        JSON.stringify({ error: "Student is already on the waitlist" }),
        { status: 400 },
      );
    }

    // Create an updated signup with isWaitlisted set to true, clearing promotedAt
    const { promotedAt, ...studentWithoutPromotedAt } =
      classDoc.signups[studentIndex];
    const updatedStudent = {
      ...studentWithoutPromotedAt,
      isWaitlisted: true,
    };

    // Update the student in the database
    const result = await classes.updateOne(
      { id, "signups.id": studentId },
      { $set: { "signups.$": updatedStudent } },
    );

    if (result.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Failed to update student status" }),
        { status: 500 },
      );
    }

    return new Response(
      JSON.stringify({ success: true, student: updatedStudent }),
      { status: 200 },
    );
  } catch (e) {
    console.error("Error occurred while demoting student to waitlist", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while demoting student" }),
      { status: 500 },
    );
  }
}
