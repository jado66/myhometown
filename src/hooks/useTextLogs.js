import { supabase } from "@/util/supabase";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "./use-user";

export function useTextLogs(
  userCommunities = [],
  userCities = [],
  isAdmin = false
) {
  const { user } = useUser();

  const [logs, setLogs] = useState({
    userLogs: [],
    communityLogs: {},
    cityLogs: {},
    allUserLogs: [],
    totalCounts: {
      userLogs: 0,
      communityLogs: {},
      cityLogs: {},
      allUserLogs: 0,
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTextLogs = useCallback(
    async (options = {}) => {
      const userId = user?.id || "00000000-0000-0000-0000-000000000000";

      const {
        limit = 10,
        page = 1,
        startDate = null,
        endDate = null,
        status = null,
        searchTerm = null,
        sortBy = "created_at",
        sortDirection = "desc",
      } = options;

      try {
        setLoading(true);
        const result = await fetchAllTextBatches(
          userId,
          userCommunities,
          userCities,
          isAdmin,
          {
            limit,
            page,
            startDate,
            endDate,
            status,
            searchTerm,
            sortBy,
            sortDirection,
          }
        );
        setLogs(result);
        setError(null);
      } catch (err) {
        console.error("Error fetching text batches:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user?.id, userCommunities, userCities, isAdmin]
  );

  useEffect(() => {
    fetchTextLogs({ page: 1, limit: 10 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id, isAdmin]);

  // If needed, add function to fetch details for a batch (individual logs)
  const fetchBatchDetails = async (batchId) => {
    const { data, error } = await supabase
      .from("text_logs")
      .select("*")
      .eq("batch_id", batchId);
    if (error) throw error;
    return data;
  };

  return {
    logs,
    loading,
    error,
    fetchTextLogs,
    fetchBatchDetails, // Use this in UI for expanding a batch log
  };
}

async function fetchAllTextBatches(
  userId,
  userCommunities,
  userCities,
  isAdmin,
  options
) {
  const {
    limit = 10,
    page = 1,
    startDate = null,
    endDate = null,
    status = null,
    searchTerm = null,
    sortBy = "created_at",
    sortDirection = "desc",
  } = options;

  const offset = (page - 1) * limit;

  const result = {
    userLogs: [],
    communityLogs: {},
    cityLogs: {},
    allUserLogs: [],
    totalCounts: {
      userLogs: 0,
      communityLogs: {},
      cityLogs: {},
      allUserLogs: 0,
    },
  };

  const applyCommonFilters = (q) => {
    let query = q;
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (searchTerm) {
      query = query.ilike("message_content", `%${searchTerm}%`);
    }
    query = query.order(sortBy, { ascending: sortDirection === "asc" });
    query = query.range(offset, offset + limit - 1);
    return query;
  };

  if (isAdmin) {
    let query = supabase.from("text_batches").select("*", { count: "exact" });
    query = applyCommonFilters(query);
    const { data, count, error } = await query;
    if (error) throw error;
    result.allUserLogs = data || [];
    result.totalCounts.allUserLogs = count || 0;
    result.communityLogs = { all: data || [] };
    result.totalCounts.communityLogs = { all: count || 0 };
    result.cityLogs = {};
    result.totalCounts.cityLogs = {};
    result.userLogs = [];
    result.totalCounts.userLogs = 0;
  } else {
    // Fetch user batches
    let userQuery = supabase
      .from("text_batches")
      .select("*", { count: "exact" })
      .eq("owner_type", "user")
      .eq("owner_id", userId);
    userQuery = applyCommonFilters(userQuery);
    const {
      data: userData,
      count: userCount,
      error: userError,
    } = await userQuery;
    if (userError) {
      console.error("Error fetching user batches:", userError);
    } else {
      result.userLogs = userData || [];
      result.totalCounts.userLogs = userCount || 0;
    }

    // Fetch community batches
    for (const communityId of userCommunities) {
      let communityQuery = supabase
        .from("text_batches")
        .select("*", { count: "exact" })
        .eq("owner_type", "community")
        .eq("owner_id", communityId);
      communityQuery = applyCommonFilters(communityQuery);
      const { data, count, error } = await communityQuery;
      if (error) {
        console.error(
          `Error fetching batches for community ${communityId}:`,
          error
        );
        result.communityLogs[communityId] = [];
        result.totalCounts.communityLogs[communityId] = 0;
      } else {
        result.communityLogs[communityId] = data || [];
        result.totalCounts.communityLogs[communityId] = count || 0;
      }
    }

    // Fetch city batches
    for (const cityId of userCities) {
      let cityQuery = supabase
        .from("text_batches")
        .select("*", { count: "exact" })
        .eq("owner_type", "city")
        .eq("owner_id", cityId);
      cityQuery = applyCommonFilters(cityQuery);
      const { data, count, error } = await cityQuery;
      if (error) {
        console.error(`Error fetching batches for city ${cityId}:`, error);
        result.cityLogs[cityId] = [];
        result.totalCounts.cityLogs[cityId] = 0;
      } else {
        result.cityLogs[cityId] = data || [];
        result.totalCounts.cityLogs[cityId] = count || 0;
      }
    }

    result.allUserLogs = [];
    result.totalCounts.allUserLogs = 0;
  }

  return result;
}

// Helper function to parse metadata and extract groups
export const parseMetadata = (metadataString) => {
  try {
    return JSON.parse(metadataString);
  } catch (error) {
    console.error("Error parsing metadata:", error);
    return null;
  }
};

// Helper function to extract groups from metadata
export const getGroupsFromMetadata = (metadata) => {
  if (!metadata || !metadata.selectedGroups) return [];
  return metadata.selectedGroups;
};
