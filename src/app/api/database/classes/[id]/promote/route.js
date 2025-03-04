import { sendClassSignupText } from "@/util/communication/sendTexts";
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
      (signup) => signup.id === studentId
    );

    if (studentIndex === -1) {
      return new Response(
        JSON.stringify({ error: "Student not found in class roster" }),
        {
          status: 404,
        }
      );
    }

    // Check if the student is actually waitlisted
    if (!classDoc.signups[studentIndex].isWaitlisted) {
      return new Response(
        JSON.stringify({
          error: "Student is already enrolled and not waitlisted",
        }),
        { status: 400 }
      );
    }

    // Create a copy of the student with isWaitlisted set to false
    const updatedStudent = {
      ...classDoc.signups[studentIndex],
      isWaitlisted: false,
      promotedAt: new Date().toISOString(), // Optional: track when they were promoted
    };

    // Update the student in the database
    const result = await classes.updateOne(
      { id, "signups.id": studentId },
      { $set: { "signups.$": updatedStudent } }
    );

    if (result.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ error: "Failed to update student status" }),
        { status: 500 }
      );
    }

    // Send a notification to the student that they've been promoted from the waitlist
    let notificationResult = null;
    try {
      notificationResult = await sendClassSignupText({
        firstName: updatedStudent.firstName,
        phone: updatedStudent.phone,
        classDoc,
        isWaitlisted: false, // They're now enrolled
        wasPromoted: true, // Indicates this was a promotion from waitlist
      });
    } catch (notificationError) {
      console.error("Error sending promotion notification:", notificationError);
      // Continue even if notification fails
    }

    return new Response(
      JSON.stringify({
        success: true,
        student: updatedStudent,
        notification: notificationResult,
      }),
      { status: 200 }
    );
  } catch (e) {
    console.error("Error occurred while promoting student", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while promoting student" }),
      { status: 500 }
    );
  }
}
