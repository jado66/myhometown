import { supabase } from "@/util/supabase";
import { useState, useEffect, useCallback } from "react";

export function useTextLogs(
  userId,
  userCommunities = [],
  userCities = [],
  isAdmin = false
) {
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
      if (!userId) {
        setLoading(false);
        return;
      }

      const {
        limit = 25,
        page = 1,
        startDate = null,
        endDate = null,
        status = null,
        searchTerm = null,
        sortBy = "created_at",
        sortDirection = "desc",
      } = options;

      try {
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
    [userId, userCommunities, userCities, isAdmin]
  );

  useEffect(() => {
    if (userId) {
      fetchTextLogs();
    }
  }, [userId, fetchTextLogs]);

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
    limit = 25,
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

  const buildQuery = (baseConditions) => {
    let query = supabase
      .from("text_batches")
      .select("*", { count: "exact" })
      .range(offset, offset + limit - 1)
      .order(sortBy, { ascending: sortDirection === "asc" });

    Object.entries(baseConditions).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        query = query.in(key, value);
      } else {
        query = query.eq(key, value);
      }
    });

    if (startDate) query.gte("created_at", startDate);
    if (endDate) query.lte("created_at", endDate);
    if (status) query.eq("status", status);
    if (searchTerm) query.ilike("message_content", `%${searchTerm}%`);

    return query;
  };

  try {
    if (isAdmin) {
      // All user batches
      const { data: allUserData, count: allUserCount } = await buildQuery({
        owner_type: "user",
      });
      result.allUserLogs = allUserData;
      result.totalCounts.allUserLogs = allUserCount;

      // User's own batches (for personal tab)
      const { data: userData, count: userCount } = await buildQuery({
        sender_id: userId,
      });
      result.userLogs = userData;
      result.totalCounts.userLogs = userCount;

      // All community batches
      const { data: commData, count: commCount } = await buildQuery({
        owner_type: "community",
      });
      commData.forEach((log) => {
        if (!result.communityLogs[log.owner_id])
          result.communityLogs[log.owner_id] = [];
        result.communityLogs[log.owner_id].push(log);
      });
      // Counts per community would need separate queries if needed; for simplicity, total per owner_id

      // All city batches
      const { data: cityData, count: cityCount } = await buildQuery({
        owner_type: "city",
      });
      cityData.forEach((log) => {
        if (!result.cityLogs[log.owner_id]) result.cityLogs[log.owner_id] = [];
        result.cityLogs[log.owner_id].push(log);
      });
    } else {
      // Non-admin
      const { data: userData, count: userCount } = await buildQuery({
        sender_id: userId,
      });
      result.userLogs = userData;
      result.totalCounts.userLogs = userCount;

      if (userCommunities.length > 0) {
        for (const commId of userCommunities) {
          const { data, count } = await buildQuery({
            owner_type: "community",
            owner_id: commId,
          });
          result.communityLogs[commId] = data;
          result.totalCounts.communityLogs[commId] = count;
        }
      }

      if (userCities.length > 0) {
        for (const cityId of userCities) {
          const { data, count } = await buildQuery({
            owner_type: "city",
            owner_id: cityId,
          });
          result.cityLogs[cityId] = data;
          result.totalCounts.cityLogs[cityId] = count;
        }
      }
    }
  } catch (error) {
    throw error;
  }

  return result;
}
