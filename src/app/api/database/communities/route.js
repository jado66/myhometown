import { createNewCommunity } from "@/constants/newDbObjects/createNewCommunityObject";
import { connectToMongoDatabase } from "@/util/db/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req, res) {
      
  // Connect to mongodb and fetch communities
  let db, communities;
  try {
    ({ db } = await connectToMongoDatabase());
    communities = db.collection('Communities');
  } catch(e){
    console.error('Error occurred while connecting to MongoDB', e);
    return new Response(JSON.stringify({ error: 'Error occurred while connecting to MongoDB' }), { status: 500 });
  }

  let results;
  try {
    results = await communities.find().toArray();
  }
  catch(e){
    console.error('Error occurred while fetching communities', e);
    return new Response(JSON.stringify({ error: 'Error occurred while fetching communities' }), { status: 500 });
  }   
  return new Response(JSON.stringify(results),{status: 200});
}

export async function POST(req, res) {
  const { community } = await req.json();
  const { db } = await connectToMongoDatabase();
  const communities = db.collection('Communities');
  
  const newCommunity = createNewCommunity(community)

  console.log('newCommunity:', newCommunity);

  try{
    const createCommunity = await communities.insertOne(newCommunity);
    console.log('createCommunity:', createCommunity);
  }
  catch(e){
    console.error('Community creation failed', e);
    return new Response(JSON.stringify({ error: 'Community creation failed' }), { status: 500 });
  }    
  
  return new Response(JSON.stringify({community:newCommunity}),{status: 200});
}

export async function PUT(req, res) {
  const { community } = await req.json();
  const { db } = await connectToMongoDatabase();
  const communities = db.collection('Communities');
  
  const { _id, ...communityWithoutId } = community;

  const updateCommunity = await communities.updateOne({ _id: new ObjectId(_id) }, { $set: communityWithoutId });
  
  return new Response(JSON.stringify(updateCommunity), { status: 200 });
}


export async function DELETE(req, res) {
  const { communityId } = req.body;
  const { db } = await connectToMongoDatabase();
  const communities = db.collection('Communities');
  
  const deleteCommunity = await communities.deleteOne(communityId);
  
  return new Response(JSON.stringify(deleteCommunity), { status: 200 });
}