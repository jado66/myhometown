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

    const result = await classes.updateOne(
      { id },
      { $push: { signups: signupData } }
    );

    return new Response(JSON.stringify(result), { status: 201 });
  } catch (e) {
    console.error("Error occurred while processing signup", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while processing signup" }),
      { status: 500 }
    );
  }
}
