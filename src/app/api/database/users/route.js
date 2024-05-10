import { createNewUser } from "@/constants/newDbObjects/createNewUserObject";
import { connectToMongoDatabase } from "@/util/db/mongodb";

export async function GET(req, res) {
  const query = req.query || {};
  
  const { db } = await connectToMongoDatabase();
  const users = db.collection('Users');

  let results;
  try {
    results = await users.find(query).toArray();
  }
  catch(e){
    console.error('Error occurred while fetching users', e);
    return new Response(JSON.stringify({ error: 'Error occurred while fetching users' }), { status: 500 });
  }    
  
  return new Response(JSON.stringify(results),{status: 200});
}


export async function POST(req, res) {
  const { sub, email } = await req.json();
  const { db } = await connectToMongoDatabase();
  const users = db.collection('Users');
  
  let user = await users.findOne({ _id: sub });
  if (!user) {
    const newUser = createNewUser(email, sub)

    console.log('newUser:', newUser);

    try{
      const createUser = await users.insertOne(newUser);
      console.log('createUser:', createUser);
      user = newUser
    }
    catch(e){
      console.error('User creation failed', e);
      return new Response(JSON.stringify({ error: 'User creation failed' }), { status: 500 });
    }    
  } 
  
  return new Response(JSON.stringify(user),{status: 200});
}

export async function PUT(req, res) {
  const { user } = await req.json();
  const { db } = await connectToMongoDatabase();
  const users = db.collection('Users');
  
  const updateUser = await users.updateOne({ _id: user._id }, { $set: user });
  
  return new Response(JSON.stringify(updateUser), { status: 200 });
}

export async function DEL(req, res) {
  const { sub } = req.body;
  const { db } = await connectToMongoDatabase();
  const users = db.collection('Users');
  
  const deleteUser = await users.deleteOne({ _id: sub });
  
  return new Response(JSON.stringify(deleteUser), { status: 200 });
}