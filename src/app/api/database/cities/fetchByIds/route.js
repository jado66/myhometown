import { connectToMongoDatabase } from "@/util/db/mongodb";
import { ObjectId } from "mongodb";

export async function POST(req, res) {
  
  const ids = await req.json(); // ids should be an array received from the body

  // Prepare the query object for MongoDB:
  let query = {
    _id: {
      $in: ids.map(id => new ObjectId(id)) // This line ensures all elements in ids array gets mapped to ObjectId
    }
  };
   
  // Connect to mongodb and fetch cities
  let db, cities;
  try {
    ({ db } = await connectToMongoDatabase());
    cities = db.collection('Cities');
  } catch(e){
    console.error('Error occurred while connecting to MongoDB', e);
    return new Response(JSON.stringify({ error: 'Error occurred while connecting to MongoDB' }), { status: 500 });
  }

  let results;
  try {
    results = await cities.find(query).toArray();
  }
  catch(e){
    console.error('Error occurred while fetching cities', e);
    return new Response(JSON.stringify({ error: 'Error occurred while fetching cities' }), { status: 500 });
  }   
  return new Response(JSON.stringify(results),{status: 200});
}
