// src/app/api/database/classes/[id]/attendance/[date]/route.js
export async function GET(req, { params }) {
  const { id, date } = params;

  let db, classes;
  try {
    ({ db } = await connectToMongoDatabase());
    classes = db.collection("Classes");

    const result = await classes.findOne(
      { id },
      { projection: { attendance: { $elemMatch: { date } } } }
    );

    if (!result) {
      return new Response(JSON.stringify({ error: "Class not found" }), {
        status: 404,
      });
    }

    return new Response(JSON.stringify(result.attendance || []), {
      status: 200,
    });
  } catch (e) {
    console.error("Error occurred while fetching attendance", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while fetching attendance" }),
      { status: 500 }
    );
  }
}
