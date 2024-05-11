import { createNewCity } from "@/constants/newDbObjects/createNewCityObject";
import { connectToMongoDatabase } from "@/util/db/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req, res) {
      
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
    results = await cities.find().toArray();
  }
  catch(e){
    console.error('Error occurred while fetching cities', e);
    return new Response(JSON.stringify({ error: 'Error occurred while fetching cities' }), { status: 500 });
  }   
  return new Response(JSON.stringify(results),{status: 200});
}

export async function POST(req, res) {
  const { city } = await req.json();
  const { db } = await connectToMongoDatabase();
  const cities = db.collection('Cities');
  
  const newCity = createNewCity(city)

  console.log('newCity:', newCity);

  try{
    const createCity = await cities.insertOne(newCity);
    console.log('createCity:', createCity);
  }
  catch(e){
    console.error('City creation failed', e);
    return new Response(JSON.stringify({ error: 'City creation failed' }), { status: 500 });
  }    
  
  return new Response(JSON.stringify({city:newCity}),{status: 200});
}

export async function PUT(req, res) {
  const { city, previousCity } = await req.json();
  const { db } = await connectToMongoDatabase();
  const cities = db.collection('Cities');
  const communitiesCollection = db.collection('Communities');
  
  const { _id, ...cityWithoutId } = city;

  const updateCity = await cities.updateOne({ _id: new ObjectId(_id) }, { $set: cityWithoutId });
  
  // Check if communities have been added or removed
  const addedCommunities = city.communities.filter(c => !previousCity.communities.includes(c));
  const removedCommunities = previousCity.communities.filter(c => !city.communities.includes(c));

  // Process added communities
  for (let community of addedCommunities) {

    console.log('Adding city to community:', community);

    await communitiesCollection.findOneAndUpdate(
      { _id: new ObjectId(community._id) },
      { $set: { city: { _id: city._id, name: city.name, state: city.state } } }
    );
  }

  // Process removed communities
  for (let community of removedCommunities) {

    console.log('Removing city from community:', community);

    await communitiesCollection.findOneAndUpdate(
      { _id: new ObjectId(community._id) },
      { $set: { city: '' } }
    );
  }

  return new Response(JSON.stringify(updateCity), { status: 200 });
}


export async function DELETE(req, res) {
  const { cityId } = req.body;
  const { db } = await connectToMongoDatabase();
  const cities = db.collection('Cities');
  
  const deleteCity = await cities.deleteOne(cityId);
  
  return new Response(JSON.stringify(deleteCity), { status: 200 });
}