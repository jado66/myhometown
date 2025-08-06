// hooks/use-missionary-hours.ts
import { useState, useEffect, useCallback } from "react";
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

  const buildQueryParams = useCallback(
    (customFilters?: UseHoursFilters) => {
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
    },
    [filters]
  );

  const fetchHours = useCallback(
    async (customFilters?: UseHoursFilters) => {
      try {
        setLoading(true);
        setError(null);

        const params = buildQueryParams(customFilters);
        const response = await fetch(
          `/api/database/missionary-hours?${params}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch hours data");
        }

        const data = await response.json();
        setHours(data.hours || []);
        return data.hours || [];
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "An error occurred";
        setError(errorMessage);
        console.error("Error fetching hours:", err);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [buildQueryParams]
  );

  const createHours = useCallback(
    async (data: CreateHoursRequest) => {
      try {
        setError(null);

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
        setError(errorMessage);
        throw err;
      }
    },
    [fetchHours]
  );

  const updateHours = useCallback(
    async (id: string, data: UpdateHoursRequest) => {
      try {
        setError(null);

        const response = await fetch(
          `/api/database/missionary-hours?id=${id}`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(data),
          }
        );

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
        setError(errorMessage);
        throw err;
      }
    },
    [fetchHours]
  );

  const deleteHours = useCallback(
    async (id: string) => {
      try {
        setError(null);

        const response = await fetch(
          `/api/database/missionary-hours?id=${id}`,
          {
            method: "DELETE",
          }
        );

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
        setError(errorMessage);
        throw err;
      }
    },
    [fetchHours]
  );

  // Get hours for a specific missionary
  const getHoursForMissionary = useCallback(
    (missionaryId: string) => {
      return hours.filter((h) => h.missionary_id === missionaryId);
    },
    [hours]
  );

  // Get hours by entry method
  const getHoursByMethod = useCallback(
    (method: "weekly" | "monthly") => {
      return hours.filter((h) => h.entry_method === method);
    },
    [hours]
  );

  // Calculate total hours for a missionary
  const getTotalHoursForMissionary = useCallback(
    (missionaryId: string) => {
      return hours
        .filter((h) => h.missionary_id === missionaryId)
        .reduce((sum, h) => sum + h.total_hours, 0);
    },
    [hours]
  );

  // Get hours within a date range
  const getHoursInRange = useCallback(
    (startDate: string, endDate: string) => {
      return hours.filter((h) => {
        const periodDate = new Date(h.period_start_date);
        return (
          periodDate >= new Date(startDate) && periodDate <= new Date(endDate)
        );
      });
    },
    [hours]
  );

  // Auto-fetch on mount if enabled
  useEffect(() => {
    if (autoFetch) {
      fetchHours();
    }
  }, [autoFetch, fetchHours]);

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
  missionaryId?: string
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
