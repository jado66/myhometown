import { connectToMongoDatabase } from "@/util/db/mongodb";

export async function POST(req, { params }) {
  const { id } = params;
  const attendanceData = await req.json();

  let db, classes;
  try {
    ({ db } = await connectToMongoDatabase());
    classes = db.collection("Classes");

    // Remove any existing attendance record for this student and date
    await classes.updateOne(
      { id },
      {
        $pull: {
          attendance: {
            studentId: attendanceData.studentId,
            date: attendanceData.date,
          },
        },
      }
    );

    // Add the new attendance record
    const result = await classes.updateOne(
      { id },
      { $push: { attendance: attendanceData } }
    );

    if (result.matchedCount === 0) {
      return new Response(JSON.stringify({ error: "Class not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(result), { status: 200 });
  } catch (e) {
    console.error("Error occurred while marking attendance", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while marking attendance" }),
      { status: 500 }
    );
  }
}
