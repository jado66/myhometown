// MHT Dashboard\src\app\api\database\classes\[id]\transfer\route.ts
import { sendClassSignupText } from "@/util/communication/sendTexts";
import { connectToMongoDatabase } from "@/util/db/mongodb";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const { id: sourceClassId } = params;
  const {
    studentId,
    targetClassId,
    sendTextNotification = true,
  } = await req.json();

  if (!studentId || !targetClassId) {
    return new Response(
      JSON.stringify({ error: "Student ID and target class ID are required" }),
      { status: 400 }
    );
  }

  let db: any, classes: any;
  try {
    ({ db } = await connectToMongoDatabase());
    classes = db.collection("Classes");

    // Get both source and target classes
    const [sourceClass, targetClass] = await Promise.all([
      classes.findOne({ id: sourceClassId }),
      classes.findOne({ id: targetClassId }),
    ]);

    if (!sourceClass) {
      return new Response(JSON.stringify({ error: "Source class not found" }), {
        status: 404,
      });
    }

    if (!targetClass) {
      return new Response(JSON.stringify({ error: "Target class not found" }), {
        status: 404,
      });
    }

    // Find the student in the source class
    const studentIndex = sourceClass.signups.findIndex(
      (signup: any) => signup.id === studentId
    );

    if (studentIndex === -1) {
      return new Response(
        JSON.stringify({ error: "Student not found in source class" }),
        { status: 404 }
      );
    }

    const student = sourceClass.signups[studentIndex];

    // Check if target class has capacity
    const targetIsWaitlistEnabled = targetClass.isWaitlistEnabled === true;
    const targetWaitlistCapacity = parseInt(targetClass.waitlistCapacity || 0);
    const targetMainCapacity = parseInt(targetClass.capacity || 0);
    const targetTotalCapacity =
      targetMainCapacity +
      (targetIsWaitlistEnabled ? targetWaitlistCapacity : 0);

    const targetEnrolledCount = targetClass.signups.filter(
      (s: any) => !s.isWaitlisted
    ).length;
    const targetWaitlistedCount = targetClass.signups.filter(
      (s: any) => s.isWaitlisted
    ).length;

    // Check if target class is completely full
    if (targetClass.signups.length >= targetTotalCapacity) {
      return new Response(
        JSON.stringify({
          error: `Cannot transfer student: ${targetClass.title} is fully booked including waitlist`,
        }),
        { status: 409 }
      );
    }

    // Determine if student will be waitlisted in target class
    const willBeWaitlisted =
      targetIsWaitlistEnabled && targetEnrolledCount >= targetMainCapacity;

    // Prepare the student data for transfer
    const transferredStudent = {
      ...student,
      isWaitlisted: willBeWaitlisted,
      transferredFrom: sourceClass.title,
      transferredAt: new Date().toISOString(),
      createdAt: student.createdAt || new Date().toISOString(),
    };

    // Remove 'promotedAt' if it exists since this is a new enrollment
    delete transferredStudent.promotedAt;

    // Perform the transfer in a transaction-like manner
    const session = await db.client.startSession();

    try {
      await session.withTransaction(async () => {
        // Remove student from source class
        await classes.updateOne(
          { id: sourceClassId },
          { $pull: { signups: { id: studentId } } },
          { session }
        );

        // Add student to target class
        await classes.updateOne(
          { id: targetClassId },
          { $push: { signups: transferredStudent } },
          { session }
        );
      });
    } finally {
      await session.endSession();
    }

    // Send notification about the transfer (only if requested)
    let notificationResult = null;
    if (sendTextNotification) {
      try {
        notificationResult = await sendClassSignupText({
          firstName: transferredStudent.firstName,
          phone: transferredStudent.phone,
          classDoc: targetClass,
          isWaitlisted: willBeWaitlisted,
          wasTransferred: true,
        });
      } catch (notificationError) {
        console.error(
          "Error sending transfer notification:",
          notificationError
        );
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        student: transferredStudent,
        targetClass: {
          id: targetClass.id,
          title: targetClass.title,
          isWaitlisted: willBeWaitlisted,
        },
        notification: notificationResult,
        textNotificationSent:
          sendTextNotification && notificationResult?.success,
      }),
      { status: 200 }
    );
  } catch (e) {
    console.error("Error occurred while transferring student", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while transferring student" }),
      { status: 500 }
    );
  }
}
