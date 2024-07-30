import { connectToMongoDatabase } from "@/util/db/mongodb";

export async function POST(req, res) {
  const { communityToAdd, communityOwners } = await req.json();
  const { db } = await connectToMongoDatabase();
  const users = db.collection("Users");

  // Structure of the new community object to be added
  const newCommunityObject = {
    _id: communityToAdd._id,
    name: communityToAdd.name,
  };

  for (const communityOwner of communityOwners) {
    let user = await users.findOne({ _id: communityOwner._id });

    if (user) {
      user.communityOwner = user.communityOwner || [];

      // Check if community already exists in user cities
      const existingCommunity = user.cities.find(
        (community) => community._id === newCommunityObject._id
      );

      // Only add the community if it doesn't exist yet
      if (!existingCommunity) {
        user.communities.push(newCommunityObject);

        try {
          const updateUser = await users.updateOne(
            { _id: user._id },
            { $set: user }
          );
          console.log("Updated user:", updateUser);
        } catch (e) {
          console.error("Error occurred while updating user", e);
          return new Response(
            JSON.stringify({ error: "Error occurred while updating user" }),
            { status: 500 }
          );
        }
      }
    }
  }

  return new Response(
    JSON.stringify({ message: `Successfully updated Community Admins` }),
    { status: 200 }
  );
}

export async function DELETE(req, res) {
  const { communityToRemove, communityOwners } = await req.json();
  const { db } = await connectToMongoDatabase();
  const users = db.collection("Users");

  const communityId = communityToRemove._id;

  for (const communityOwner of communityOwners) {
    let user = await users.findOne({ _id: communityOwner._id });

    if (user && user.cities) {
      user.cities = user.cities.filter(
        (community) => community._id !== communityId
      );

      try {
        const updateUser = await users.updateOne(
          { _id: user._id },
          { $set: user }
        );
        console.log("Updated user:", updateUser);
      } catch (e) {
        console.error("Error occurred while updating user", e);
        return new Response(
          JSON.stringify({ error: "Error occurred while updating user" }),
          { status: 500 }
        );
      }
    }
  }

  return new Response(
    JSON.stringify({ message: `Successfully removed community from owners` }),
    { status: 200 }
  );
}
