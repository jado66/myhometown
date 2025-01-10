import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function useCommunities(
  userfilter,
  forDropDownCommunityMenu = false
) {
  const [communities, setCommunities] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [communitySelectOptions, setCommunitySelectOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchCommunitiesByCityId(cityId) {
    const response = await fetch("/api/communities/by-city", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        cityId: cityId,
      }),
    });

    return response.json();
  }

  useEffect(() => {
    async function fetchAllCommunities() {
      try {
        const res = await fetch(`/api/database/communities`);
        const data = await res.json();
        setCommunities(data);

        const selectOptions = data
          .filter((community) => !Boolean(community.city)) // Filter here
          .map((community) => ({
            value: community._id,
            label: community.name,
            data: community,
          }));
        setCommunitySelectOptions(selectOptions);
      } catch (e) {
        console.error("Error occurred while fetching communities", e);
      }

      setHasLoaded(true);
    }

    async function fetchCommunitiesByIds(ids) {
      try {
        const res = await fetch(`/api/database/communities/fetchByIds`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(ids),
        });
        const data = await res.json();
        setCommunities(data);
      } catch (e) {
        console.error("Error occurred while fetching communities", e);
      }

      setHasLoaded(true);
    }

    if (!userfilter && !forDropDownCommunityMenu) {
      return;
    }

    if (userfilter?.role === "Admin" || forDropDownCommunityMenu) {
      fetchAllCommunities();
    } else {
      const communityIds = userfilter.communities.map(
        (community) => community._id
      );

      fetchCommunitiesByIds(communityIds);
    }
  }, [userfilter]);

  const getCommunity = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/database/communities/fetchByIds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify([id]), // Send as array with single ID
      });

      if (!res.ok) {
        throw new Error("Failed to fetch community");
      }

      const data = await res.json();
      setLoading(false);

      if (!data || data.length === 0) {
        throw new Error("Community not found");
      }

      return data[0]; // Return first (and only) community
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  const handleAddCommunity = async (community) => {
    try {
      const res = await fetch("/api/database/communities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ community }),
      });

      const result = await res.json();
      const { community: newCommunity } = result;
      setCommunities([...communities, newCommunity]);
    } catch (e) {
      console.error("Error occurred while adding a community", e);
    }
  };

  const handleEditCommunity = async (previousCommunity, community) => {
    try {
      const res = await fetch(`/api/database/communities`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          community,
        }),
      });

      // Check to see is users has changed
      if (
        JSON.stringify(previousCommunity.communityOwners) !==
        JSON.stringify(community.communityOwners)
      ) {
        // Make a list of users that need the community added
        const usersToAddCommunity = community.communityOwners.filter(
          (user) => !previousCommunity.communityOwners.includes(user)
        );

        handleAddCommunityToUsers(community, usersToAddCommunity);

        // Make a list of users that need the community removed
        const usersToRemoveCommunity = previousCommunity.communityOwners.filter(
          (user) => !community.communityOwners.includes(user)
        );

        handleDeleteCommunityFromUsers(community, usersToRemoveCommunity);
      }

      setCommunities((prevCommunities) =>
        prevCommunities.map((u) => (u._id === community._id ? community : u))
      );
      toast.success("Community updated successfully");
    } catch (e) {
      console.error("Error occurred while editing a community", e);
    }
  };

  const handleDeleteCommunity = async (community) => {
    // Ensure there are no users with this community
    if (community.communityOwners.length > 0) {
      toast.error("Remove all users with this community before deleting it");
      return;
    }

    const communityId = community._id;

    try {
      await fetch(`/api/database/communities`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          communityId,
        }),
      });

      setCommunities(communities.filter((u) => u._id !== communityId));
      toast.success("Community removed successfully");
    } catch (e) {
      console.error("Error occurred while deleting a community", e);
    }
  };

  return {
    communities,
    communitySelectOptions,
    hasLoaded,
    fetchCommunitiesByCityId,
    handleAddCommunity,
    handleEditCommunity,
    handleDeleteCommunity,
    getCommunity,
    loading,
    error,
  };
}

// Util functions not passed down

const handleAddCommunityToUsers = async (community, users) => {
  if (users.length === 0) {
    return;
  }

  try {
    const res = await fetch("/api/database/users/updateCommunityOwners", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        communityToAdd: community,
        communityOwners: users,
      }),
    });
  } catch (e) {
    console.error("Error occurred while adding a community to users", e);
  }
};

const handleDeleteCommunityFromUsers = async (community, users) => {
  if (users.length === 0) {
    return;
  }

  try {
    const res = await fetch("/api/database/users/updateCommunityOwners", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        communityToRemove: community,
        communityOwners: users,
      }),
    });
  } catch (e) {
    console.error("Error occurred while deleting a community from users", e);
  }
};
