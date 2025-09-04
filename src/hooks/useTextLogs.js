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

      // Comment out all querying options for now - just show all texts
      // const {
      //   limit = 25,
      //   page = 1,
      //   startDate = null,
      //   endDate = null,
      //   status = null,
      //   searchTerm = null,
      //   sortBy = "created_at",
      //   sortDirection = "desc",
      // } = options;

      try {
        // Simplified to fetch all text batches without filtering
        const result = await fetchAllTextBatches(user.id, [], [], true, {});
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
      fetchTextLogs();
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
  // Comment out all the complex filtering options for now
  // const {
  //   limit = 25,
  //   page = 1,
  //   startDate = null,
  //   endDate = null,
  //   status = null,
  //   searchTerm = null,
  //   recipientPhone = null,
  //   sortBy = "created_at",
  //   sortDirection = "desc",
  // } = options;

  // const offset = (page - 1) * limit;

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

  // Simplified query builder - just fetch all text batches
  const buildSimpleQuery = () => {
    return supabase
      .from("text_batches")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false });
  };

  try {
    // For now, just fetch all text batches regardless of admin status
    const { data: allData, count: allCount } = await buildSimpleQuery();

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
