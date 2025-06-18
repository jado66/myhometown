import { supabase } from "@/util/supabase";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

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
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Fetch text logs
  const fetchTextLogs = useCallback(
    async (options = {}) => {
      if (!userId) {
        setLoading(false);
        return;
      }

      const {
        limit = 100,
        page = 1,
        startDate = null,
        endDate = null,
        status = null,
        searchTerm = null,
        recipientPhone = null,
        sortBy = "created_at",
        sortDirection = "desc",
      } = options;

      try {
        const result = await fetchAllTextLogs(
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
            recipientPhone,
            sortBy,
            sortDirection,
          }
        );

        setLogs(result);
        setError(null);
      } catch (err) {
        console.error("Error fetching text logs:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    },
    [userId, userCommunities, userCities, isAdmin]
  );

  // Initial fetch
  useEffect(() => {
    if (!userId) {
      return;
    }

    if (!hasInitialized) {
      setHasInitialized(true);
    } else {
      fetchTextLogs();
    }
  }, [hasInitialized, userId]);

  // Add a new text log
  const addTextLog = async (logData) => {
    try {
      const log = {
        ...logData,
        sender_id: userId,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const { data, error } = await supabase
        .from("text_logs")
        .insert([log])
        .select();

      if (error) throw error;

      // Update the appropriate logs list based on owner_type
      setLogs((prev) => {
        const updated = { ...prev };

        if (log.owner_type === "user") {
          updated.userLogs = [data[0], ...prev.userLogs];
        } else if (log.owner_type === "community") {
          const communityId = log.owner_id;
          if (!updated.communityLogs[communityId]) {
            updated.communityLogs[communityId] = [];
          }
          updated.communityLogs[communityId] = [
            data[0],
            ...updated.communityLogs[communityId],
          ];
        } else if (log.owner_type === "city") {
          const cityId = log.owner_id;
          if (!updated.cityLogs[cityId]) {
            updated.cityLogs[cityId] = [];
          }
          updated.cityLogs[cityId] = [data[0], ...updated.cityLogs[cityId]];
        }

        return updated;
      });

      return { data: data[0], error: null };
    } catch (error) {
      console.error("Error adding text log:", error);
      return { data: null, error: error.message };
    }
  };

  // Batch add multiple text logs
  const batchAddTextLogs = async (logsData, senderId) => {
    try {
      const logs = logsData.map((log) => ({
        ...log,
        sender_id: senderId,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      const { data, error } = await supabase
        .from("text_logs")
        .insert(logs)
        .select();

      if (error) throw error;

      // Refresh logs after batch insertion
      await fetchTextLogs();

      return { data, error: null };
    } catch (error) {
      console.error("Error batch adding text logs:", error);
      return { data: null, error: error.message };
    }
  };

  // Update text log status (e.g., for delivery confirmation)
  const updateTextLogStatus = async (
    id,
    status,
    deliveredAt = null,
    errorMessage = null
  ) => {
    try {
      const updateData = {
        status,
        updated_at: new Date(),
        ...(deliveredAt && { delivered_at: deliveredAt }),
        ...(errorMessage && { error_message: errorMessage }),
      };

      const { data, error } = await supabase
        .from("text_logs")
        .update(updateData)
        .eq("id", id)
        .select();

      if (error) throw error;

      // Update the logs with the new status
      setLogs((prev) => {
        const updated = { ...prev };

        // Update in userLogs if found
        updated.userLogs = prev.userLogs.map((log) =>
          log.id === id ? { ...log, ...updateData } : log
        );

        // Update in communityLogs if found
        Object.keys(prev.communityLogs).forEach((communityId) => {
          updated.communityLogs[communityId] = prev.communityLogs[
            communityId
          ].map((log) => (log.id === id ? { ...log, ...updateData } : log));
        });

        // Update in cityLogs if found
        Object.keys(prev.cityLogs).forEach((cityId) => {
          updated.cityLogs[cityId] = prev.cityLogs[cityId].map((log) =>
            log.id === id ? { ...log, ...updateData } : log
          );
        });

        return updated;
      });

      return { data: data[0], error: null };
    } catch (error) {
      console.error("Error updating text log status:", error);
      return { data: null, error: error.message };
    }
  };

  return {
    logs,
    loading,
    error,
    fetchTextLogs,
    addTextLog,
    batchAddTextLogs,
    updateTextLogStatus,
  };
}

async function fetchAllTextLogs(
  userId,
  userCommunities,
  userCities,
  isAdmin,
  options
) {
  const {
    limit = 100,
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
  };

  // Helper function to build queries with filters
  const buildQuery = (query) => {
    // Apply date filters if provided
    if (startDate) {
      query = query.gte("created_at", startDate);
    }

    if (endDate) {
      query = query.lte("created_at", endDate);
    }

    // Apply status filter if provided
    if (status) {
      query = query.eq("status", status);
    }

    // Apply recipient phone filter if provided
    if (recipientPhone) {
      query = query.eq("recipient_phone", recipientPhone);
    }

    // Apply search term if provided (searches in message_content)
    if (searchTerm) {
      query = query.ilike("message_content", `%${searchTerm}%`);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortDirection === "asc" });

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    return query;
  };

  // If admin, fetch ALL text logs regardless of ownership
  if (isAdmin) {
    // Fetch all user-owned logs
    const { data: allUserLogs, error: userLogError } = await buildQuery(
      supabase.from("text_logs").select("*").eq("owner_type", "user")
    );

    if (userLogError) {
      console.error("Error fetching all user text logs:", userLogError);
    } else {
      result.userLogs = allUserLogs || [];
    }

    // Fetch all community-owned logs and group them
    const { data: allCommunityLogs, error: communityLogError } =
      await buildQuery(
        supabase.from("text_logs").select("*").eq("owner_type", "community")
      );

    if (communityLogError) {
      console.error(
        "Error fetching all community text logs:",
        communityLogError
      );
    } else if (allCommunityLogs) {
      // Group community logs by owner_id
      allCommunityLogs.forEach((log) => {
        if (!result.communityLogs[log.owner_id]) {
          result.communityLogs[log.owner_id] = [];
        }
        result.communityLogs[log.owner_id].push(log);
      });
    }

    // Fetch all city-owned logs and group them
    const { data: allCityLogs, error: cityLogError } = await buildQuery(
      supabase.from("text_logs").select("*").eq("owner_type", "city")
    );

    if (cityLogError) {
      console.error("Error fetching all city text logs:", cityLogError);
    } else if (allCityLogs) {
      // Group city logs by owner_id
      allCityLogs.forEach((log) => {
        if (!result.cityLogs[log.owner_id]) {
          result.cityLogs[log.owner_id] = [];
        }
        result.cityLogs[log.owner_id].push(log);
      });
    }
  } else {
    // Non-admin: Use the original logic to fetch only associated logs

    // Fetch user's own text logs
    const { data: userLogData, error: userLogError } = await buildQuery(
      supabase
        .from("text_logs")
        .select("*")
        .eq("owner_id", userId)
        .eq("owner_type", "user")
    );

    if (userLogError) {
      console.error("Error fetching user text logs:", userLogError);
    } else {
      result.userLogs = userLogData || [];
    }

    // Fetch community text logs for associated communities only
    for (const communityId of userCommunities) {
      const { data, error } = await buildQuery(
        supabase
          .from("text_logs")
          .select("*")
          .eq("owner_id", communityId)
          .eq("owner_type", "community")
      );

      if (error) {
        console.error(
          `Error fetching text logs for community ${communityId}:`,
          error
        );
        result.communityLogs[communityId] = [];
      } else {
        result.communityLogs[communityId] = data || [];
      }
    }

    // Fetch city text logs for associated cities only
    for (const cityId of userCities) {
      const { data, error } = await buildQuery(
        supabase
          .from("text_logs")
          .select("*")
          .eq("owner_id", cityId)
          .eq("owner_type", "city")
      );

      if (error) {
        console.error(`Error fetching text logs for city ${cityId}:`, error);
        result.cityLogs[cityId] = [];
      } else {
        result.cityLogs[cityId] = data || [];
      }
    }
  }

  return result;
}
