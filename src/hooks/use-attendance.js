// hooks/useAttendance.js
import { useState } from "react";

export const useAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const markAttendance = async (classId, attendanceData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/database/classes/${classId}/attendance`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(attendanceData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to mark attendance");
      }

      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  const getAttendanceForDate = async (classId, date) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/database/classes/${classId}/attendance/${date}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch attendance");
      }
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  return {
    loading,
    error,
    markAttendance,
    getAttendanceForDate,
  };
};
