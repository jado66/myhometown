// Import the FileDownload icon at the top of your file
import { FileDownload } from "@mui/icons-material";

/**
 * Generates a CSV string from semester data with detailed attendance statistics
 * @param {Object} semester - The semester object containing sections and classes
 * @returns {string} CSV formatted string
 */
export const generateDetailedCSV = (semester) => {
  // Define the CSV headers
  const headers = [
    "Class Title",
    "Category",
    "Start Date",
    "End Date",
    "Location",
    "Students Enrolled",
    "Students Attended",
    "Total Class Days",
    "Total Attended",
    "Average Attendance",
  ];

  // Create the CSV content starting with headers
  let csvContent = headers.join(",") + "\n";

  // Process each section and class
  semester.sections.forEach((section) => {
    // Skip hidden sections
    if (section.visibility === false) return;

    section.classes.forEach((classItem) => {
      // Skip hidden classes
      if (classItem.visibility === false) return;

      // Calculate attendance statistics
      const stats = calculateAttendanceStats(classItem);

      // Format date strings (mm/dd/yy format)
      const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return `${date.getMonth() + 1}/${date.getDate()}/${date
          .getFullYear()
          .toString()
          .substr(-2)}`;
      };

      // Format basic class info
      const classInfo = [
        // Escape any commas in the title to prevent CSV format issues
        `"${classItem.title?.replace(/"/g, '""') || ""}"`,
        `"${section.title?.replace(/"/g, '""') || ""}"`,
        formatDate(classItem.startDate),
        formatDate(classItem.endDate),
        `"${classItem.location?.replace(/"/g, '""') || ""}"`,
        stats.studentsEnrolled,
        stats.studentsAttended,
        stats.totalClassDays,
        stats.totalAttended,
        `"${stats.averageAttendance}"`,
      ];

      // Add row for class with stats
      csvContent += classInfo.join(",") + "\n";
    });
  });

  return csvContent;
};

/**
 * Downloads a string as a CSV file
 * @param {string} csvContent - The CSV content to download
 * @param {string} fileName - The name of the file to download
 */
export const downloadCSV = (csvContent, fileName) => {
  // Create a blob from the CSV content
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Create a downloadable URL for the blob
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element to trigger the download
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);

  // Append the link to the body (required in Firefox)
  document.body.appendChild(link);

  // Trigger the download
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Calculates attendance statistics for a given class based on actual class dates
 * @param {Object} classItem - The class object containing attendance data
 * @returns {Object} Statistics including enrollment and attendance metrics
 */
const calculateAttendanceStats = (classItem) => {
  // Get total enrolled students (excluding waitlisted students)
  const studentsEnrolled =
    classItem.signups?.filter((signup) => !signup.isWaitlisted)?.length || 0;

  // Get total class days by using the same logic as the attendance table
  const classDates = generateClassDates(classItem);
  const totalClassDays = classDates.length;

  // Gather attendance info (if attendance data exists)
  if (classItem.attendance && Array.isArray(classItem.attendance)) {
    // Count present attendances only
    const uniqueAttendees = new Set();
    let totalAttended = 0;

    classItem.attendance.forEach((record) => {
      if (record.present === true) {
        uniqueAttendees.add(record.studentId);
        totalAttended++;
      }
    });

    const studentsAttended = uniqueAttendees.size;

    // Calculate maximum possible attendance (students × class days)
    const maxPossibleAttendance = studentsEnrolled * totalClassDays;

    // Format in Excel-safe format
    let averageAttendance;
    if (maxPossibleAttendance > 0) {
      const percentage = Math.round(
        (totalAttended / maxPossibleAttendance) * 100
      );
      averageAttendance = `${totalAttended} of ${maxPossibleAttendance} (${percentage}%)`;
    } else {
      averageAttendance = "0 of 0 (0%)";
    }

    return {
      studentsEnrolled,
      studentsAttended,
      totalClassDays,
      totalAttended,
      averageAttendance,
    };
  }

  // If no attendance data, return default values
  return {
    studentsEnrolled,
    studentsAttended: 0,
    totalClassDays,
    totalAttended: 0,
    averageAttendance: "0 of 0 (0%)",
  };
};

/**
 * Generates a CSV string for Community Resource Center capacity report
 * This shows daily attendance numbers across all classes with dates in columns and classes in rows
 * @param {Object} semester - The semester object containing sections and classes
 * @returns {string} CSV formatted string
 */
export const generateCapacityReportCSV = (semester) => {
  // Import moment if needed for date handling
  // Since we can't import it directly here, we'll use native Date methods

  // Find all class dates from earliest to latest across all classes
  const allDates = new Set();
  const classesInfo = [];

  // First pass: collect all unique dates and build class info array
  semester.sections.forEach((section) => {
    // Skip hidden sections
    if (section.visibility === false) return;

    section.classes.forEach((classItem) => {
      // Skip hidden classes
      if (classItem.visibility === false) return;

      // Store class info for later reference
      const classInfo = {
        id: classItem.id,
        title: classItem.title || "",
        section: section.title || "",
        location: classItem.location || "",
        attendanceDates: new Set(),
      };

      // Collect dates with attendance
      if (classItem.attendance && Array.isArray(classItem.attendance)) {
        classItem.attendance.forEach((record) => {
          if (record.present === true && record.date) {
            allDates.add(record.date);
            classInfo.attendanceDates.add(record.date);
          }
        });
      }

      // Also add scheduled dates
      const classDates = generateClassDates(classItem);
      classDates.forEach((date) => allDates.add(date));

      classesInfo.push(classInfo);
    });
  });

  // Sort dates chronologically
  const sortedDates = Array.from(allDates).sort();

  // Create a mapping of dates to their attendance counts for each class
  const dateAttendanceCounts = {};

  semester.sections.forEach((section) => {
    if (section.visibility === false) return;

    section.classes.forEach((classItem) => {
      if (classItem.visibility === false) return;

      // Skip if no attendance data
      if (!classItem.attendance || !Array.isArray(classItem.attendance)) return;

      // Group attendance by date for this class
      classItem.attendance.forEach((record) => {
        // Only count present students
        if (record.present !== true) return;

        const date = record.date;

        if (!dateAttendanceCounts[date]) {
          dateAttendanceCounts[date] = {};
        }

        if (!dateAttendanceCounts[date][classItem.id]) {
          dateAttendanceCounts[date][classItem.id] = 0;
        }

        dateAttendanceCounts[date][classItem.id]++;
      });
    });
  });

  // Format date for display (mm/dd/yy)
  const formatDisplayDate = (dateString) => {
    const [year, month, day] = dateString.split("-");
    return `${month}/${day}/${year.substr(2)}`;
  };

  // Get day of week
  const getDayOfWeek = (dateString) => {
    const [year, month, day] = dateString.split("-");
    // Months are 0-indexed in JavaScript Date
    const date = new Date(year, parseInt(month) - 1, day);
    const days = [
      "Sunday",
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ];
    return days[date.getDay()];
  };

  // Create CSV headers (Class, Section, followed by dates)
  const headers = ["Class", "Section"];

  // Add dates as column headers
  sortedDates.forEach((date) => {
    headers.push(`${formatDisplayDate(date)} (${getDayOfWeek(date)})`);
  });

  // Add total column
  headers.push("Total");

  // Create CSV content starting with headers
  let csvContent = headers.join(",") + "\n";

  // Add rows for each class
  classesInfo.forEach((classInfo) => {
    const row = [
      `"${classInfo.title.replace(/"/g, '""')}"`,
      `"${classInfo.section.replace(/"/g, '""')}"`,
    ];

    // Class total attendance across all dates
    let classTotal = 0;

    // Add attendance count for each date
    sortedDates.forEach((date) => {
      // Check if this class is scheduled for this date
      const isClassDay = generateClassDates(
        semester.sections
          .flatMap((s) => s.classes)
          .find((c) => c.id === classInfo.id) || {}
      ).includes(date);

      // If class is scheduled that day, show the count (even if 0)
      // If class is not scheduled that day, show "-"
      const count = dateAttendanceCounts[date]?.[classInfo.id] || 0;

      if (isClassDay || count > 0) {
        row.push(count);
        classTotal += count;
      } else {
        row.push("-");
      }
    });

    // Add class total
    row.push(classTotal);

    csvContent += row.join(",") + "\n";
  });

  // Add a summary row with totals by date
  const totalRow = ["TOTAL", ""];
  let grandTotal = 0;

  // Calculate total for each date
  sortedDates.forEach((date) => {
    let dateTotal = 0;

    if (dateAttendanceCounts[date]) {
      Object.values(dateAttendanceCounts[date]).forEach((count) => {
        dateTotal += count;
      });
    }

    // Always show numeric total at the bottom, even if it's 0
    totalRow.push(dateTotal);
    grandTotal += dateTotal;
  });

  // Add grand total
  totalRow.push(grandTotal);
  csvContent += totalRow.join(",") + "\n";

  return csvContent;
};

/**
 * Downloads a string as a CSV file
 * @param {string} csvContent - The CSV content to download
 * @param {string} fileName - The name of the file to download
 */
export const downloadCapacityReport = (csvContent, fileName) => {
  // Create a blob from the CSV content
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });

  // Create a downloadable URL for the blob
  const url = URL.createObjectURL(blob);

  // Create a temporary anchor element to trigger the download
  const link = document.createElement("a");
  link.href = url;
  link.setAttribute("download", fileName);

  // Append the link to the body (required in Firefox)
  document.body.appendChild(link);

  // Trigger the download
  link.click();

  // Clean up
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Generates class dates matching the attendance table logic
 * @param {Object} classItem - The class object containing schedule information
 * @returns {Array} Array of dates in YYYY-MM-DD format
 */
const generateClassDates = (classItem) => {
  if (!classItem?.startDate || !classItem?.endDate) {
    return [];
  }

  // For a single day class, we just need to return that one date
  if (classItem.startDate === classItem.endDate) {
    return [classItem.startDate];
  }

  const dates = [];

  // Parse dates
  const startDate = new Date(classItem.startDate + "T00:00:00Z");
  const endDate = new Date(classItem.endDate + "T23:59:59Z");

  // Day name mapping
  const dayNames = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];

  // Iterate through each day
  let currentDate = new Date(startDate);
  while (currentDate <= endDate) {
    const dayOfWeek = dayNames[currentDate.getUTCDay()];

    // Check if this day of week has a meeting
    const matchingMeetings =
      classItem.meetings?.filter((meeting) => meeting.day === dayOfWeek) || [];

    if (matchingMeetings.length > 0) {
      // Format date as YYYY-MM-DD
      const year = currentDate.getUTCFullYear();
      const month = String(currentDate.getUTCMonth() + 1).padStart(2, "0");
      const day = String(currentDate.getUTCDate()).padStart(2, "0");
      dates.push(`${year}-${month}-${day}`);
    }

    // Move to next day
    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
  }

  return dates;
};

/**
 * Component that displays a download button for the capacity report
 * @param {Object} semester - The semester data
 * @returns {JSX.Element} Button component
 */
export const CapacityReportButton = ({ semester }) => {
  const handleDownload = () => {
    const csvContent = generateCapacityReportCSV(semester);
    const today = new Date();
    const dateStr = `${today.getFullYear()}-${String(
      today.getMonth() + 1
    ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    downloadCapacityReport(csvContent, `capacity-report-${dateStr}.csv`);
  };

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
    >
      <FileDownload /> Download Capacity Report
    </button>
  );
};
