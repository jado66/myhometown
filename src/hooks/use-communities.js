"use client";
import { supabase } from "@/util/supabase";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export function useCommunities(userfilter, forDropDownCommunityMenu = false) {
  const [communities, setCommunities] = useState([]);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [communitySelectOptions, setCommunitySelectOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Update select options whenever communities change
  useEffect(() => {
    if (!communities || communities.length === 0) {
      return;
    }

    const selectOptions = communities
      .map((community) => ({
        value: community._id,
        label: community.city + " - " + community.name,
        data: community,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    setCommunitySelectOptions(selectOptions);
  }, [communities]);

  async function fetchNewCommunities({ query = null }) {
    try {
      let baseQuery = supabase.from("communities").select(`
        *,
        cities!communities_city_id_fkey (
          city_name:name
        )`);

      // Apply the query if provided
      if (query) {
        baseQuery = query(baseQuery);
      }

      const { data: citiesData, error } = await baseQuery;

      if (error) {
        throw error;
      }

      // Remove the nested cities object and flatten the city_name
      const flattenedData = citiesData?.map((community) => {
        const { cities, ...rest } = community;
        return {
          ...rest,
          city_name: cities?.city_name,
        };
      });

      return { data: flattenedData, error: null };
    } catch (error) {
      console.error("Error fetching communities:", error);
      return { data: null, error };
    }
  }

  async function fetchCommunitiesByCity(city) {
    const response = await fetch("/api/database/communities/by-city", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        city: city,
      }),
    });

    if (!response.ok) {
      throw new Error("Failed to fetch communities by city");
    }

    const data = await response.json();
    return data;
  }

  useEffect(() => {
    async function fetchAllCommunities() {
      try {
        const res = await fetch(`/api/database/communities`);
        const data = await res.json();
        setCommunities(data);
        setHasLoaded(true);
      } catch (e) {
        console.error("Error occurred while fetching communities", e);
        setHasLoaded(true);
      }
    }

    async function fetchCommunitiesByIds(ids) {
      try {
        const { data: citiesData, error } = await supabase
          .from("communities")
          .select(`
            *,
            cities!communities_city_id_fkey (
              city_name:name
            )
          `)
          .in('id', ids);

        if (error) {
          throw error;
        }

        // Remove the nested cities object and flatten the city_name
        const flattenedData = citiesData?.map((community) => {
          const { cities, ...rest } = community;
          return {
            ...rest,
            city_name: cities?.city_name,
          };
        });

        setCommunities(flattenedData || []);
        setHasLoaded(true);
      } catch (e) {
        console.error("Error occurred while fetching communities", e);
        setHasLoaded(true);
      }
    }

    if (!userfilter && !forDropDownCommunityMenu) {
      return;
    }

    const isAdministrator = userfilter?.permissions?.administrator;
    const communityIds = userfilter?.communities || [];

    if (isAdministrator || forDropDownCommunityMenu) {
      fetchAllCommunities();
    } else {
      // alert("Fetching communities by userfilter" + JSON.stringify(userfilter));

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
        body: JSON.stringify([id]),
      });

      if (!res.ok) {
        throw new Error("Failed to fetch community");
      }

      const data = await res.json();
      setLoading(false);

      if (!data || data.length === 0) {
        throw new Error("Community not found");
      }

      return data[0];
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

      if (
        JSON.stringify(previousCommunity.communityOwners) !==
        JSON.stringify(community.communityOwners)
      ) {
        const usersToAddCommunity = community.communityOwners.filter(
          (user) => !previousCommunity.communityOwners.includes(user)
        );

        handleAddCommunityToUsers(community, usersToAddCommunity);

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
    fetchCommunitiesByCity,
    handleAddCommunity,
    handleEditCommunity,
    handleDeleteCommunity,
    fetchNewCommunities,
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
    await fetch("/api/database/users/updateCommunityOwners", {
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
    await fetch("/api/database/users/updateCommunityOwners", {
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
