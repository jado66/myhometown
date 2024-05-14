import { connectToMongoDatabase } from "@/util/db/mongodb";

export async function POST(req, res) {
  const { cityToAdd, cityOwners } = await req.json();
  const { db } = await connectToMongoDatabase();
  const users = db.collection('Users');

  // Structure of the new city object to be added
  const newCityObject = {
    _id: cityToAdd._id,
    name: cityToAdd.name,
    state: cityToAdd.state,
  };

  for(const cityOwner of cityOwners){
    let user = await users.findOne({ _id: cityOwner._id });

    if(user) {
      user.cities = user.cities || [];

      // Check if city already exists in user cities
      const existingCity = user.cities.find(city => city._id === newCityObject._id);

      // Only add the city if it doesn't exist yet
      if(!existingCity) {
        user.cities.push(newCityObject);

        try{
          const updateUser = await users.updateOne({_id: user._id}, { $set: user });
          console.log('Updated user:', updateUser);
        }
        catch(e){
          console.error('Error occurred while updating user', e);
          return new Response(JSON.stringify({ error: 'Error occurred while updating user' }), { status: 500 });
        }   
      }
    }
  }

  return new Response(JSON.stringify({message:`Successfully updated City Admins`}),{status: 200});
}
  
  export async function DELETE(req, res) {
    const {cityToRemove, cityOwners} = await req.json();
    const {db} = await connectToMongoDatabase();
    const users = db.collection('Users');

    const cityId = cityToRemove._id;
    
    for(const cityOwner of cityOwners){
      let user = await users.findOne({_id: cityOwner._id});
  
      if (user && user.cities) {
        user.cities = user.cities.filter(city => city._id !== cityId)
  
        try {
          const updateUser = await users.updateOne({_id: user._id}, {$set: user});
          console.log('Updated user:', updateUser);
        } catch(e){
          console.error('Error occurred while updating user', e);
          return new Response(JSON.stringify({error: 'Error occurred while updating user'}), {status: 500});
        }
      }
    }
  
    return new Response(JSON.stringify({message:`Successfully removed city from owners`}),{status: 200});
  }
  