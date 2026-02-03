// hooks/use-missionary-hours.ts
import { useState, useEffect, useCallback, useRef } from "react";
import type {
  MissionaryHours,
  CreateHoursRequest,
  UpdateHoursRequest,
} from "@/types/missionary/types";

interface UseHoursFilters {
  startDate?: string;
  endDate?: string;
  missionaryId?: string;
  entryMethod?: "weekly" | "monthly";
}

interface UseHoursOptions {
  autoFetch?: boolean;
  filters?: UseHoursFilters;
}

export function useMissionaryHours(options: UseHoursOptions = {}) {
  const { autoFetch = true, filters = {} } = options;

  const [hours, setHours] = useState<MissionaryHours[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Track if component is mounted to avoid memory leaks
  const isMounted = useRef(true);

  function buildQueryParams(customFilters?: UseHoursFilters) {
    const params = new URLSearchParams();
    const activeFilters = { ...filters, ...customFilters };

    if (activeFilters.startDate) {
      params.append("start_date", activeFilters.startDate);
    }

    if (activeFilters.endDate) {
      params.append("end_date", activeFilters.endDate);
    }

    if (activeFilters.missionaryId) {
      params.append("missionary_id", activeFilters.missionaryId);
    }

    if (activeFilters.entryMethod) {
      params.append("entry_method", activeFilters.entryMethod);
    }

    return params;
  }

  async function fetchHours(customFilters?: UseHoursFilters) {
    try {
      if (isMounted.current) {
        setLoading(true);
        setError(null);
      }

      console.log("fetch hours");

      const params = buildQueryParams(customFilters);
      const response = await fetch(`/api/database/missionary-hours?${params}`);

      if (!response.ok) {
        throw new Error("Failed to fetch hours data");
      }

      const data = await response.json();

      if (isMounted.current) {
        setHours(data.hours || []);
      }
      return data.hours || [];
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An error occurred";
      if (isMounted.current) {
        setError(errorMessage);
      }
      console.error("Error fetching hours:", err);
      throw err;
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }

  async function createHours(data: CreateHoursRequest) {
    try {
      if (isMounted.current) setError(null);

      const response = await fetch("/api/database/missionary-hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create hours entry");
      }

      const result = await response.json();

      // Refresh the hours list
      await fetchHours();

      return result.hours;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to create hours";
      if (isMounted.current) setError(errorMessage);
      throw err;
    }
  }

  async function updateHours(id: string, data: UpdateHoursRequest) {
    try {
      if (isMounted.current) setError(null);

      const response = await fetch(`/api/database/missionary-hours?id=${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update hours entry");
      }

      const result = await response.json();

      // Refresh the hours list
      await fetchHours();

      return result.hours;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to update hours";
      if (isMounted.current) setError(errorMessage);
      throw err;
    }
  }

  async function deleteHours(id: string) {
    try {
      if (isMounted.current) setError(null);

      const response = await fetch(`/api/database/missionary-hours?id=${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete hours entry");
      }

      // Refresh the hours list
      await fetchHours();

      return true;
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "Failed to delete hours";
      if (isMounted.current) setError(errorMessage);
      throw err;
    }
  }

  // Get hours for a specific missionary
  function getHoursForMissionary(missionaryId: string) {
    return hours.filter((h) => h.missionary_id === missionaryId);
  }

  // Get hours by entry method
  function getHoursByMethod(method: "weekly" | "monthly") {
    return hours.filter((h) => h.entry_method === method);
  }

  // Calculate total hours for a missionary
  function getTotalHoursForMissionary(missionaryId: string) {
    return hours
      .filter((h) => h.missionary_id === missionaryId)
      .reduce((sum, h) => sum + h.total_hours, 0);
  }

  // Get hours within a date range
  function getHoursInRange(startDate: string, endDate: string) {
    return hours.filter((h) => {
      const periodDate = new Date(h.period_start_date);
      return (
        periodDate >= new Date(startDate) && periodDate <= new Date(endDate)
      );
    });
  }

  // Auto-fetch on mount if enabled

  useEffect(() => {
    isMounted.current = true;
    if (autoFetch) {
      fetchHours();
    }
    return () => {
      isMounted.current = false;
    };
  }, [autoFetch]);

  // Calculate summary statistics
  const stats = {
    totalHours: hours.reduce((sum, h) => sum + h.total_hours, 0),
    totalEntries: hours.length,
    uniqueMissionaries: new Set(hours.map((h) => h.missionary_id)).size,
    weeklyEntries: hours.filter((h) => h.entry_method === "weekly").length,
    monthlyEntries: hours.filter((h) => h.entry_method === "monthly").length,
    averageHours:
      hours.length > 0
        ? hours.reduce((sum, h) => sum + h.total_hours, 0) / hours.length
        : 0,
  };

  return {
    // Data
    hours,
    loading,
    error,
    stats,

    // Actions
    fetchHours,
    createHours,
    updateHours,
    deleteHours,

    // Utilities
    getHoursForMissionary,
    getHoursByMethod,
    getTotalHoursForMissionary,
    getHoursInRange,

    // Clear error
    clearError: () => setError(null),
  };
}

// Hook for getting period-based hours (commonly used filters)
export function usePeriodHours(
  period: "week" | "month" | "quarter" | "year",
  missionaryId?: string,
) {
  const now = new Date();
  const startDate = new Date();

  switch (period) {
    case "week":
      startDate.setDate(now.getDate() - 7);
      break;
    case "month":
      startDate.setMonth(now.getMonth() - 1);
      break;
    case "quarter":
      startDate.setMonth(now.getMonth() - 3);
      break;
    case "year":
      startDate.setFullYear(now.getFullYear() - 1);
      break;
  }

  return useMissionaryHours({
    filters: {
      startDate: startDate.toISOString().split("T")[0],
      endDate: now.toISOString().split("T")[0],
      missionaryId,
    },
  });
}
