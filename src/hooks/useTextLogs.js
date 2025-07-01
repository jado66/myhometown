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
    allUserLogs: [], // Add this
    totalCounts: {
      userLogs: 0,
      communityLogs: {},
      cityLogs: {},
      allUserLogs: 0, // Add this
    },
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [hasInitialized, setHasInitialized] = useState(false);

  // Rest of the hook remains the same, but update setLogs calls to include totalCounts
  const fetchTextLogs = useCallback(
    async (options = {}) => {
      if (!userId) {
        setLoading(false);
        return;
      }

      const {
        limit = 25, // Reduced default since we're now getting grouped results
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
    allUserLogs: [], // Add this for admin's "All Messages" view
    totalCounts: {
      userLogs: 0,
      communityLogs: {},
      cityLogs: {},
      allUserLogs: 0, // Add this for counting all user logs
    },
  };

  // Helper function to build grouped query
  const buildGroupedQuery = async (baseConditions) => {
    let query = supabase.from("text_logs").select(`
        message_id,
        created_at,
        message_content,
        media_urls,
        metadata,
        status,
        delivered_at,
        error_message,
        owner_type,
        owner_id,
        sender_id
      `);

    // Apply base conditions (owner_type, owner_id, etc.)
    Object.entries(baseConditions).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        query = query.in(key, value);
      } else {
        query = query.eq(key, value);
      }
    });

    // Apply filters
    if (startDate) {
      query = query.gte("created_at", startDate);
    }
    if (endDate) {
      query = query.lte("created_at", endDate);
    }
    if (status) {
      query = query.eq("status", status);
    }
    if (recipientPhone) {
      query = query.eq("recipient_phone", recipientPhone);
    }
    if (searchTerm) {
      query = query.ilike("message_content", `%${searchTerm}%`);
    }

    // Execute query to get all matching records
    const { data: allRecords, error } = await query;

    if (error) {
      throw error;
    }

    // Group by message_id on the client side (but only for the filtered results)
    const groupedData = {};

    allRecords?.forEach((record) => {
      if (!record.message_id) return;

      if (!groupedData[record.message_id]) {
        // Parse metadata to get groups and recipient info
        let metadata = null;
        try {
          metadata = JSON.parse(record.metadata || "{}");
        } catch (e) {
          metadata = {};
        }

        groupedData[record.message_id] = {
          ...record,
          recipients: [record.recipient_phone],
          recipientCount: 1,
          statuses: [record.status],
          groups: metadata.selectedGroups || [],
          individualLogIds: [record.id],
        };
      } else {
        const group = groupedData[record.message_id];
        if (!group.recipients.includes(record.recipient_phone)) {
          group.recipients.push(record.recipient_phone);
          group.recipientCount += 1;
        }
        group.statuses.push(record.status);
        group.individualLogIds.push(record.id);
      }
    });

    // Convert to array and sort
    const groupedArray = Object.values(groupedData);

    // Sort the grouped results
    groupedArray.sort((a, b) => {
      let aValue = a[sortBy];
      let bValue = b[sortBy];

      if (sortBy === "created_at") {
        aValue = new Date(aValue);
        bValue = new Date(bValue);
      }

      if (sortDirection === "asc") {
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      } else {
        return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
      }
    });

    // Apply pagination to grouped results
    const paginatedResults = groupedArray.slice(offset, offset + limit);

    return {
      data: paginatedResults,
      totalCount: groupedArray.length,
    };
  };

  try {
    if (isAdmin) {
      // For admins, fetch ALL logs in the system

      // Fetch ALL user-type logs (sent by any user)
      const allUserLogsResult = await buildGroupedQuery({ owner_type: "user" });

      // Also fetch logs that don't have owner_type='user' but were sent by users
      // This catches personal messages that might not have owner_type set
      const personalLogsResult = await buildGroupedQuery({});

      // For "Personal Messages" tab, we still want to filter by sender_id
      const userOwnLogsResult = await buildGroupedQuery({ sender_id: userId });
      result.userLogs = userOwnLogsResult.data;
      result.totalCounts.userLogs = userOwnLogsResult.totalCount;

      // Fetch all community-owned logs (grouped)
      const communityLogsResult = await buildGroupedQuery({
        owner_type: "community",
      });
      // Group by owner_id
      communityLogsResult.data.forEach((log) => {
        if (!result.communityLogs[log.owner_id]) {
          result.communityLogs[log.owner_id] = [];
          result.totalCounts.communityLogs[log.owner_id] = 0;
        }
        result.communityLogs[log.owner_id].push(log);
        result.totalCounts.communityLogs[log.owner_id]++;
      });

      // Fetch all city-owned logs (grouped)
      const cityLogsResult = await buildGroupedQuery({ owner_type: "city" });
      // Group by owner_id
      cityLogsResult.data.forEach((log) => {
        if (!result.cityLogs[log.owner_id]) {
          result.cityLogs[log.owner_id] = [];
          result.totalCounts.cityLogs[log.owner_id] = 0;
        }
        result.cityLogs[log.owner_id].push(log);
        result.totalCounts.cityLogs[log.owner_id]++;
      });

      // For "All Messages" tab, we need to include all user logs from all users
      // Store them in a special property
      result.allUserLogs = personalLogsResult.data;
      result.totalCounts.allUserLogs = personalLogsResult.totalCount;
    } else {
      // Non-admin: fetch only associated logs

      // FIXED: User's own logs should be based on sender_id
      const userLogsResult = await buildGroupedQuery({
        sender_id: userId,
      });
      result.userLogs = userLogsResult.data;
      result.totalCounts.userLogs = userLogsResult.totalCount;

      // Community logs - only fetch if user has communities
      if (userCommunities && userCommunities.length > 0) {
        for (const communityId of userCommunities) {
          const communityLogsResult = await buildGroupedQuery({
            owner_id: communityId,
            owner_type: "community",
          });
          result.communityLogs[communityId] = communityLogsResult.data;
          result.totalCounts.communityLogs[communityId] =
            communityLogsResult.totalCount;
        }
      }

      // City logs - only fetch if user has cities
      if (userCities && userCities.length > 0) {
        for (const cityId of userCities) {
          const cityLogsResult = await buildGroupedQuery({
            owner_id: cityId,
            owner_type: "city",
          });
          result.cityLogs[cityId] = cityLogsResult.data;
          result.totalCounts.cityLogs[cityId] = cityLogsResult.totalCount;
        }
      }
    }
  } catch (error) {
    console.error("Error in fetchAllTextLogs:", error);
    throw error;
  }

  return result;
}
