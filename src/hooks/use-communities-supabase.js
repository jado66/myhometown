"use client";
import { supabase } from "@/util/supabase";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

// This hook previously used internal API route fetches (e.g. /api/database/communities).
// It is now refactored to use Supabase directly for all CRUD operations.
// Assumptions:
//  - Table: communities (id uuid PK, name, state, country, visibility, city_id FK -> cities.id)
//  - Table: cities (id uuid PK, name, state, country, ...)
//  - You may have used Mongo previously (hence `_id`). Adjusted to use `id` consistently.
//  - If you had communityOwners logic stored inside a community document before, consider a junction table
//    (e.g. community_owners: community_id uuid, user_id uuid) instead of an array column.
export function useCommunitiesSupabase(
  userfilter,
  forDropDownCommunityMenu = false
) {
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
        value: community.id,
        label: `${community.city || community.city_name || ""} - ${
          community.name
        }`,
        data: community,
      }))
      .sort((a, b) => a.label.localeCompare(b.label));

    setCommunitySelectOptions(selectOptions);
  }, [communities]);

  const fetchNewCommunities = useCallback(async ({ query = null } = {}) => {
    try {
      let baseQuery = supabase.from("communities").select(
        `*, cities:communities_city_id_fkey ( name )` // alias relation name -> cities
      );

      if (query) baseQuery = query(baseQuery);

      const { data, error } = await baseQuery;
      if (error) throw error;

      let flattened = (data || []).map((c) => ({
        ...c,
        city_name: c.cities?.name || null,
        city: c.cities?.name || null, // backward compatibility field used in legacy components
        _id: c.id, // legacy id naming
      }));

      // Fallback enrichment if join returned null city names (likely RLS issue)
      if (flattened.some((c) => !c.city)) {
        flattened = await enrichMissingCities(flattened);
      }
      return { data: flattened, error: null };
    } catch (err) {
      console.error("Error fetching communities:", err);
      return { data: null, error: err };
    }
  }, []);

  const fetchCommunitiesByCity = useCallback(async (cityName) => {
    try {
      // First attempt: inner join filter by city name
      const { data, error } = await supabase
        .from("communities")
        .select(`*, cities:communities_city_id_fkey!inner ( name )`)
        .eq("cities.name", cityName);
      if (error) throw error;
      let flattened = (data || []).map((c) => ({
        ...c,
        city_name: c.cities?.name || null,
        city: c.cities?.name || null,
        _id: c.id,
      }));
      if (flattened.length === 0) {
        // Fallback path: resolve city id then fetch by city_id (in case RLS blocks join)
        const { data: cityRow, error: cityErr } = await supabase
          .from("cities")
          .select("id, name")
          .eq("name", cityName)
          .maybeSingle();
        if (!cityErr && cityRow) {
          const { data: comms, error: commErr } = await supabase
            .from("communities")
            .select("*")
            .eq("city_id", cityRow.id);
          if (!commErr) {
            flattened = (comms || []).map((c) => ({
              ...c,
              city_name: cityRow.name,
              city: cityRow.name,
              _id: c.id,
            }));
          }
        }
      }
      if (flattened.some((c) => !c.city)) {
        flattened = await enrichMissingCities(flattened);
      }
      return flattened;
    } catch (err) {
      console.error("Failed to fetch communities by city", err);
      throw err;
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    async function fetchAllCommunities() {
      setLoading(true);
      const { data, error } = await supabase
        .from("communities")
        .select(`*, cities:communities_city_id_fkey ( name )`);
      if (!isMounted) return;
      if (error) {
        console.error("Error fetching communities", error);
        setError(error.message);
      }
      let flattened = (data || []).map((c) => ({
        ...c,
        city_name: c.cities?.name || null,
        city: c.cities?.name || null,
        _id: c.id,
      }));
      if (flattened.some((c) => !c.city)) {
        flattened = await enrichMissingCities(flattened);
      }
      setCommunities(flattened);
      setHasLoaded(true);
      setLoading(false);
    }

    async function fetchCommunitiesByIds(ids) {
      if (!ids || ids.length === 0) {
        setCommunities([]);
        setHasLoaded(true);
        return;
      }
      setLoading(true);
      const { data, error } = await supabase
        .from("communities")
        .select(`*, cities:communities_city_id_fkey ( name )`)
        .in("id", ids);
      if (!isMounted) return;
      if (error) {
        console.error("Error fetching communities by ids", error);
        setError(error.message);
      }
      let flattened = (data || []).map((c) => ({
        ...c,
        city_name: c.cities?.name || null,
        city: c.cities?.name || null,
        _id: c.id,
      }));
      if (flattened.some((c) => !c.city)) {
        flattened = await enrichMissingCities(flattened);
      }
      setCommunities(flattened);
      setHasLoaded(true);
      setLoading(false);
    }

    if (!userfilter && !forDropDownCommunityMenu) return;

    const isAdministrator = userfilter?.permissions?.administrator;
    const communityIds = userfilter?.communities || [];

    if (isAdministrator || forDropDownCommunityMenu) {
      fetchAllCommunities();
    } else {
      fetchCommunitiesByIds(communityIds);
    }

    return () => {
      isMounted = false;
    };
  }, [userfilter, forDropDownCommunityMenu]);

  const getCommunity = useCallback(async (id) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from("communities")
        .select(`*, cities:communities_city_id_fkey ( name )`)
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      setLoading(false);
      if (!data) throw new Error("Community not found");
      if (!data.cities?.name) {
        const enriched = await enrichMissingCities([
          { ...data, city: null, city_name: null, _id: data.id },
        ]);
        return enriched[0];
      }
      return {
        ...data,
        city_name: data.cities?.name,
        city: data.cities?.name,
        _id: data.id,
      };
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  }, []);

  const handleAddCommunity = useCallback(async (community) => {
    try {
      const { data, error } = await supabase
        .from("communities")
        .insert(community)
        .select("*, cities:communities_city_id_fkey ( name )")
        .single();
      if (error) throw error;
      const newCommunity = {
        ...data,
        city_name: data.cities?.name,
        city: data.cities?.name,
        _id: data.id,
      };
      if (!newCommunity.city) {
        const enriched = await enrichMissingCities([newCommunity]);
        setCommunities((prev) => [...prev, enriched[0]]);
      } else {
        setCommunities((prev) => [...prev, newCommunity]);
      }
      toast.success("Community added");
      return newCommunity;
    } catch (e) {
      console.error("Error occurred while adding a community", e);
      toast.error("Failed to add community");
      return null;
    }
  }, []);

  const handleEditCommunity = useCallback(
    async (previousCommunity, community) => {
      try {
        const { data, error } = await supabase
          .from("communities")
          .update({
            name: community.name,
            state: community.state,
            country: community.country,
            visibility: community.visibility,
            city_id: community.city_id,
          })
          .eq("id", community.id)
          .select("*, cities:communities_city_id_fkey ( name )")
          .single();
        if (error) throw error;

        // If you migrate owner logic to a junction table, perform adds/removes there.
        if (
          previousCommunity?.communityOwners &&
          community?.communityOwners &&
          JSON.stringify(previousCommunity.communityOwners) !==
            JSON.stringify(community.communityOwners)
        ) {
          const usersToAddCommunity = community.communityOwners.filter(
            (user) => !previousCommunity.communityOwners.includes(user)
          );
          handleAddCommunityToUsers(community, usersToAddCommunity);
          const usersToRemoveCommunity =
            previousCommunity.communityOwners.filter(
              (user) => !community.communityOwners.includes(user)
            );
          handleDeleteCommunityFromUsers(community, usersToRemoveCommunity);
        }

        let updated = {
          ...data,
          city_name: data.cities?.name || null,
          city: data.cities?.name || null,
          _id: data.id,
          communityOwners: community.communityOwners,
        };
        if (!updated.city) {
          const enriched = await enrichMissingCities([updated]);
          updated = enriched[0];
        }
        setCommunities((prev) =>
          prev.map((c) => (c.id === updated.id ? updated : c))
        );
        toast.success("Community updated");
      } catch (e) {
        console.error("Error occurred while editing a community", e);
        toast.error("Failed to update community");
      }
    },
    []
  );

  const handleDeleteCommunity = useCallback(async (community) => {
    if (community.communityOwners?.length > 0) {
      toast.error("Remove all users with this community before deleting it");
      return;
    }
    try {
      const { error } = await supabase
        .from("communities")
        .delete()
        .eq("id", community.id);
      if (error) throw error;
      setCommunities((prev) => prev.filter((c) => c.id !== community.id));
      toast.success("Community removed");
    } catch (e) {
      console.error("Error occurred while deleting a community", e);
      toast.error("Failed to delete community");
    }
  }, []);

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

// Fallback: fetch missing city names directly and merge.
async function enrichMissingCities(rows) {
  try {
    const missingIds = Array.from(
      new Set(rows.filter((r) => !r.city).map((r) => r.city_id))
    );
    if (missingIds.length === 0) return rows;
    const { data: citiesData, error } = await supabase
      .from("cities")
      .select("id, name")
      .in("id", missingIds);
    if (error) {
      console.warn("Could not enrich cities", error.message);
      return rows;
    }
    const map = Object.fromEntries(
      (citiesData || []).map((c) => [c.id, c.name])
    );
    return rows.map((r) => {
      if (r.city) return r;
      const cityName = map[r.city_id] || null;
      return { ...r, city: cityName, city_name: cityName };
    });
  } catch (e) {
    console.warn("enrichMissingCities failed", e);
    return rows;
  }
}

// Util functions not passed down
const handleAddCommunityToUsers = async (community, users) => {
  if (users.length === 0) {
    return;
  }

  try {
    // TODO: Replace with Supabase logic (e.g. inserting into junction table community_owners)
  } catch (e) {
    console.error("Error occurred while adding a community to users", e);
  }
};

const handleDeleteCommunityFromUsers = async (community, users) => {
  if (users.length === 0) {
    return;
  }

  try {
    // TODO: Replace with Supabase logic (e.g. deleting rows from junction table community_owners)
  } catch (e) {
    console.error("Error occurred while deleting a community from users", e);
  }
};
