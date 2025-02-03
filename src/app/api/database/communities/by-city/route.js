import { connectToMongoDatabase } from "@/util/db/mongodb";

export async function POST(req, { params }) {
  const { city } = await req.json();
  let db, communities;
  try {
    ({ db } = await connectToMongoDatabase());
    communities = db.collection("Communities");
  } catch (e) {
    console.error("Error occurred while connecting to MongoDB", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while connecting to MongoDB" }),
      { status: 500 }
    );
  }

  // capitalize and remove hyphens from city
  const formattedCity = city
    .split("-")
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(" ");

  console.log("formattedCity:", formattedCity);

  let results;
  try {
    results = await communities.find({ city: formattedCity }).toArray();
  } catch (e) {
    console.error("Error occurred while fetching communities", e);
    return new Response(
      JSON.stringify({ error: "Error occurred while fetching communities" }),
      { status: 500 }
    );
  }

  if (results.length === 0) {
    return new Response(JSON.stringify({ error: "Not Found" }), {
      status: 404,
    });
  }

  return new Response(JSON.stringify(results), { status: 200 });
}
