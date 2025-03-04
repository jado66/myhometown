import { sendClassSignupText } from "@/util/communication/sendTexts";
import { connectToMongoDatabase } from "@/util/db/mongodb";
import { v4 as uuidv4 } from "uuid";

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

    // Check if waitlist is enabled and set initial waitlisted status
    const isWaitlistEnabled = classDoc.isWaitlistEnabled === true;
    const waitlistCapacity = parseInt(classDoc.waitlistCapacity || 0);
    const totalCapacity =
      parseInt(classDoc.capacity) + (isWaitlistEnabled ? waitlistCapacity : 0);

    // Check if class is completely full (including waitlist)
    if (classDoc.signups.length >= totalCapacity) {
      return new Response(
        JSON.stringify({ error: "Class is fully booked including waitlist" }),
        {
          status: 409,
        }
      );
    }

    // Determine if this signup should be waitlisted
    const isWaitlisted =
      isWaitlistEnabled &&
      classDoc.signups.length >= parseInt(classDoc.capacity);

    // Generate a unique ID for the signup
    const signupId = uuidv4();
    const signupWithId = {
      ...signupData,
      id: signupId,
      isWaitlisted: isWaitlisted,
      createdAt: new Date().toISOString(),
    };

    const result = await classes.updateOne(
      { id },
      { $push: { signups: signupWithId } }
    );

    // Send notification after successful signup
    let notificationResult = null;
    if (result.modifiedCount > 0) {
      notificationResult = await sendClassSignupText({
        firstName: signupData.firstName,
        phone: signupData.phone,
        classDoc, // Pass the entire class document
        isWaitlisted, // Pass waitlist status
      });
    }

    // Use 201 for successful signup, 202 for waitlist
    const statusCode = isWaitlisted ? 202 : 201;

    return new Response(
      JSON.stringify({
        success: true,
        isWaitlisted: isWaitlisted,
        signup: signupWithId,
        notification: notificationResult,
      }),
      { status: statusCode }
    );
  } catch (e) {
    console.error("Error occurred while processing signup", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while processing signup" }),
      { status: 500 }
    );
  }
}
