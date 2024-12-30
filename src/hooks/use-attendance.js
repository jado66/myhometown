// hooks/useAttendance.js
import { useState } from "react";

export const useAttendance = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const markBulkAttendance = async (classId, attendanceData) => {
    setLoading(true);
    setError(null);
    try {
      // Transform the nested attendance object into an array of records
      const attendanceRecords = [];

      // attendanceData format: { studentId: { date: boolean } }
      Object.entries(attendanceData).forEach(([studentId, dates]) => {
        Object.entries(dates).forEach(([date, present]) => {
          attendanceRecords.push({
            studentId,
            date,
            present,
            updatedAt: new Date().toISOString(),
          });
        });
      });

      const response = await fetch(
        `/api/database/classes/${classId}/attendance/bulk`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ records: attendanceRecords }),
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

  const getAttendanceForDateRange = async (classId, startDate, endDate) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/database/classes/${classId}/attendance/range?startDate=${startDate}&endDate=${endDate}`
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch attendance");
      }

      const data = await response.json();

      // Transform the array of records back into the nested object format
      const formattedData = {};
      data.forEach(({ studentId, date, present }) => {
        if (!formattedData[studentId]) {
          formattedData[studentId] = {};
        }
        formattedData[studentId][date] = present;
      });

      setLoading(false);
      return formattedData;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  return {
    loading,
    error,
    markBulkAttendance,
    getAttendanceForDateRange,
  };
};
