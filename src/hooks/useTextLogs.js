import { supabase } from "@/util/supabase";
import { useState, useEffect, useCallback } from "react";
import { useUser } from "./use-user";

export function useTextLogs(
  // userId,
  // userCommunities = [],
  // userCities = [],
  isAdmin = true
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
      if (!user.id) {
        setLoading(false);
        return;
      }

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
        const result = await fetchAllTextBatches(user.id, [], [], true, {
          limit,
          page,
          startDate,
          endDate,
          status,
          searchTerm,
          sortBy,
          sortDirection,
        });
        setLogs(result);
        setError(null);
      } catch (err) {
        console.error("Error fetching text batches:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [user.id, isAdmin]
  );

  useEffect(() => {
    if (user.id) {
      fetchTextLogs({ page: 1, limit: 10 });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id, isAdmin]);

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
    recipientPhone = null,
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

  // Build query with pagination and filtering
  const buildQuery = () => {
    let query = supabase.from("text_batches").select("*", { count: "exact" });

    // Add filters if provided
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

    // Add pagination
    query = query.range(offset, offset + limit - 1);

    // Add sorting
    const ascending = sortDirection === "asc";
    query = query.order(sortBy, { ascending });

    return query;
  };

  try {
    const { data: allData, count: allCount } = await buildQuery();

    // Put all data in the allUserLogs for display
    result.allUserLogs = allData || [];
    result.totalCounts.allUserLogs = allCount || 0;

    // Also populate other fields for compatibility
    result.communityLogs = { all: allData || [] };
    result.totalCounts.communityLogs = { all: allCount || 0 };
    result.cityLogs = { all: allData || [] };
    result.totalCounts.cityLogs = { all: allCount || 0 };
  } catch (error) {
    throw error;
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
