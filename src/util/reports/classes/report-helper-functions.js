// reportUtils.js - Complete implementation file for all report functionality

/**
 * Generates class dates matching the attendance table logic
 * @param {Object} classItem - The class object containing schedule information
 * @returns {Array} Array of dates in YYYY-MM-DD format
 */
export const generateClassDates = (classItem) => {
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
 * Calculates attendance statistics for a given class based on actual class dates
 * @param {Object} classItem - The class object containing attendance data
 * @returns {Object} Statistics including enrollment and attendance metrics
 */
export const calculateAttendanceStats = (classItem) => {
  const studentsEnrolled =
    classItem.signups?.filter((signup) => !signup.isWaitlisted)?.length || 0;

  const classDates = generateClassDates(classItem);
  const totalClassDays = classDates.length;
  const maxPossibleAttendance = studentsEnrolled * totalClassDays;

  if (classItem.attendance && Array.isArray(classItem.attendance)) {
    const uniqueAttendees = new Set();
    let totalAttended = 0;

    classItem.attendance.forEach((record) => {
      if (record.present === true) {
        uniqueAttendees.add(record.studentId);
        totalAttended++;
      }
    });

    const studentsAttended = uniqueAttendees.size;
    const percentage =
      maxPossibleAttendance > 0
        ? Math.round((totalAttended / maxPossibleAttendance) * 100)
        : 0;

    console.log("classItem", JSON.stringify(classItem, null, 2));
    console.log(
      "response",
      JSON.stringify(
        {
          studentsEnrolled,
          studentsAttended,
          totalClassDays,
          totalAttendance: `${totalAttended} of ${maxPossibleAttendance}`,
          attendancePercentage: `${percentage}%`,
          totalAttended, // For summary calculation
          maxPossibleAttendance, // For summary calculation
        },
        null,
        2
      )
    );

    return {
      studentsEnrolled,
      studentsAttended,
      totalClassDays,
      totalAttendance: `${totalAttended} of ${maxPossibleAttendance}`,
      attendancePercentage: `${percentage}%`,
      totalAttended, // For summary calculation
      maxPossibleAttendance, // For summary calculation
    };
  }

  return {
    studentsEnrolled,
    studentsAttended: 0,
    totalClassDays,
    totalAttendance: `0 of ${maxPossibleAttendance}`,
    attendancePercentage: "0%",
    totalAttended: 0,
    maxPossibleAttendance,
  };
};

/**
 * Format date for display (mm/dd/yy)
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Formatted date
 */
export const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  return `${date.getMonth() + 1}/${date.getDate()}/${date
    .getFullYear()
    .toString()
    .substr(-2)}`;
};

/**
 * Get day of week from date string
 * @param {string} dateString - Date string in YYYY-MM-DD format
 * @returns {string} Day of week
 */
export const getDayOfWeek = (dateString) => {
  if (!dateString) return "";
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
    "Total Attendance",
    "Attendance %",
  ];

  // Create the CSV content starting with headers
  let csvContent = headers.join(",") + "\n";

  // Track totals for summary
  let totalClassesTaught = 0;
  let totalStudentsEnrolled = 0;
  let totalStudentsAttended = 0;
  let sumTotalAttended = 0; // Sum of all x's
  let sumMaxPossible = 0; // Sum of all y's

  // Process each section and class
  semester.sections.forEach((section) => {
    if (section.visibility === false) return;

    section.classes.forEach((classItem) => {
      if (classItem.visibility === false) return;

      const stats = calculateAttendanceStats(classItem);

      // Format basic class info
      const classInfo = [
        `"${classItem.title?.replace(/"/g, '""') || ""}"`,
        `"${section.title?.replace(/"/g, '""') || ""}"`,
        formatDate(classItem.startDate),
        formatDate(classItem.endDate),
        `"${classItem.location?.replace(/"/g, '""') || ""}"`,
        stats.studentsEnrolled,
        stats.studentsAttended,
        stats.totalClassDays,
        `"${stats.totalAttendance}"`, // Keep quotes for x of y format
        stats.attendancePercentage,
      ];

      csvContent += classInfo.join(",") + "\n";

      // Update totals
      totalClassesTaught++;
      totalStudentsEnrolled += stats.studentsEnrolled;
      totalStudentsAttended += stats.studentsAttended;
      sumTotalAttended += stats.totalAttended;
      sumMaxPossible += stats.maxPossibleAttendance;
    });
  });

  // Add summary section
  csvContent += "\n"; // Empty row
  const studentsNotAttended = totalStudentsEnrolled - totalStudentsAttended;
  const enrolledAttendedPercent =
    totalStudentsEnrolled > 0
      ? Math.round((totalStudentsAttended / totalStudentsEnrolled) * 100)
      : 0;
  const avgAttendance =
    sumMaxPossible > 0
      ? Math.round((sumTotalAttended / sumMaxPossible) * 100)
      : 0;

  const summary = [
    "Summary",
    `Total Classes Taught,${totalClassesTaught}`,
    `Total Students Enrolled,${totalStudentsEnrolled}`,
    `Total Students Attended,${totalStudentsAttended}`,
    `Students That Didn't Attend,${studentsNotAttended}`,
    `Enrolled Students Attended %,${enrolledAttendedPercent}%`,
    `Average Attendance,${sumTotalAttended} of ${sumMaxPossible} (${avgAttendance}%)`,
  ];

  csvContent += summary.join("\n");

  return csvContent;
};

/**
 * Generates a CSV string for a detailed student attendance report
 * Shows each student and their attendance for every class session
 * @param {Object} semester - The semester object containing sections and classes
 * @returns {string} CSV formatted string
 */
export const generateStudentAttendanceReportCSV = (semester) => {
  // First collect all student data and attendance records
  const studentsData = [];

  // Process each section and class to gather student attendance
  semester.sections.forEach((section) => {
    // Skip hidden sections
    if (section.visibility === false) return;

    section.classes.forEach((classItem) => {
      // Skip hidden classes
      if (classItem.visibility === false) return;

      // Get all dates for this class
      const classDates = generateClassDates(classItem);

      // Process each student in the class
      if (classItem.signups && classItem.signups.length > 0) {
        classItem.signups.forEach((signup) => {
          // Create a student entry
          const studentEntry = {
            classTitle: classItem.title || "",
            classCategory: section.title || "",
            classStartDate: classItem.startDate || "",
            classEndDate: classItem.endDate || "",
            classLocation: classItem.location || "",
            studentId: signup.id,
            firstName: signup.firstName || "",
            lastName: signup.lastName || "",
            fullName: `${signup.firstName || ""} ${
              signup.lastName || ""
            }`.trim(),
            email: signup.email || "",
            phone: signup.phone || "",
            status: signup.isWaitlisted ? "Waitlisted" : "Enrolled",
            registrationDate: signup.createdAt || "",
            // Create an attendance map for this student
            attendance: {},
          };

          // Initialize attendance for all class dates (default to absent)
          classDates.forEach((date) => {
            studentEntry.attendance[date] = {
              present: false,
              date: date,
            };
          });

          // Fill in actual attendance data if available
          if (classItem.attendance && Array.isArray(classItem.attendance)) {
            classItem.attendance.forEach((record) => {
              if (record.studentId === signup.id && record.date) {
                // If we have a record for this date, update it
                if (studentEntry.attendance[record.date]) {
                  studentEntry.attendance[record.date].present =
                    record.present === true;
                }
              }
            });
          }

          // Add to our collection
          studentsData.push(studentEntry);
        });
      }
    });
  });

  // Collect all unique class dates across all classes
  const allDates = new Set();
  studentsData.forEach((student) => {
    Object.keys(student.attendance).forEach((date) => {
      allDates.add(date);
    });
  });

  // Sort dates chronologically
  const sortedDates = Array.from(allDates).sort();

  // Create CSV headers
  const headers = [
    "Class",
    "Category",
    "Student Name",
    "Email",
    "Phone",
    "Status",
    "Registration Date",
  ];

  // Add attendance dates to headers
  sortedDates.forEach((date) => {
    headers.push(`${formatDate(date)} (${getDayOfWeek(date)})`);
  });

  // Add attendance summary
  headers.push("Classes Attended");
  headers.push("Attendance Rate");

  // Create CSV content starting with headers
  let csvContent = headers.join(",") + "\n";

  // Add rows for each student
  studentsData.forEach((student) => {
    const row = [
      `"${student.classTitle.replace(/"/g, '""')}"`,
      `"${student.classCategory.replace(/"/g, '""')}"`,
      `"${student.fullName.replace(/"/g, '""')}"`,
      `"${student.email.replace(/"/g, '""')}"`,
      `"${student.phone.replace(/"/g, '""')}"`,
      student.status,
      formatDate(student.registrationDate),
    ];

    // Calculate attendance statistics for this student
    let attendedCount = 0;
    let totalClassDays = 0;

    // Add attendance for each date
    sortedDates.forEach((date) => {
      // Check if this date is relevant for this student's class
      if (student.attendance[date]) {
        totalClassDays++;
        // Add X for present, leave blank for absent
        if (student.attendance[date].present) {
          row.push('"✓"');
          attendedCount++;
        } else {
          row.push("x");
        }
      } else {
        // Date not relevant for this class
        row.push("- -");
      }
    });

    // Add attendance summary
    row.push(attendedCount);

    // Add attendance rate
    if (totalClassDays > 0) {
      const attendanceRate = Math.round((attendedCount / totalClassDays) * 100);
      row.push(`${attendanceRate}%`);
    } else {
      row.push("0%");
    }

    csvContent += row.join(",") + "\n";
  });

  // '- - signifies no class held this day
  csvContent += "\nNote: '- -' indicates no class held on this day.\n";

  return csvContent;
};

/**
 * Generates a CSV string for a student roster report
 * @param {Object} semester - The semester object containing sections and classes
 * @returns {string} CSV formatted string
 */
export const generateStudentReportCSV = (semester) => {
  // Define the CSV headers
  const headers = [
    "Class Title",
    "Category",
    "Student Name",
    "Email",
    "Phone",
    "Registration Date",
    "Status",
    "Special Needs/Accommodations",
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

      // Process each student
      if (classItem.signups && classItem.signups.length > 0) {
        classItem.signups.forEach((signup) => {
          const studentInfo = [
            `"${classItem.title?.replace(/"/g, '""') || ""}"`,
            `"${section.title?.replace(/"/g, '""') || ""}"`,
            `"${(signup.firstName + " " + signup.lastName)
              .trim()
              .replace(/"/g, '""')}"`,
            `"${signup.email?.replace(/"/g, '""') || ""}"`,
            `"${signup.phone?.replace(/"/g, '""') || ""}"`,
            formatDate(signup.createdAt),
            signup.isWaitlisted ? "Waitlisted" : "Enrolled",
            `"${signup.specialNeeds?.replace(/"/g, '""') || ""}"`,
          ];

          // Add row for student
          csvContent += studentInfo.join(",") + "\n";
        });
      } else {
        // Add a row for the class with no students
        const emptyRow = [
          `"${classItem.title?.replace(/"/g, '""') || ""}"`,
          `"${section.title?.replace(/"/g, '""') || ""}"`,
          "No students enrolled",
          "",
          "",
          "",
          "",
          "",
        ];
        csvContent += emptyRow.join(",") + "\n";
      }
    });
  });

  return csvContent;
};

/**
 * Generates a CSV string for a class schedule report
 * @param {Object} semester - The semester object containing sections and classes
 * @returns {string} CSV formatted string
 */
export const generateClassScheduleReportCSV = (semester) => {
  // Define the CSV headers
  const headers = [
    "Class Title",
    "Category",
    "Start Date",
    "End Date",
    "Meeting Days",
    "Meeting Times",
    "Location",
    "Capacity",
    "Current Enrollment",
    "Waitlist",
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

      // Format meeting days and times
      const meetingDays = classItem.meetings
        ? classItem.meetings.map((m) => m.day).join(", ")
        : "";

      const meetingTimes = classItem.meetings
        ? classItem.meetings
            .map((m) => `${m.startTime} - ${m.endTime}`)
            .join(", ")
        : "";

      // Count enrollments
      const enrolledCount = classItem.signups
        ? classItem.signups.filter((s) => !s.isWaitlisted).length
        : 0;

      const waitlistCount = classItem.signups
        ? classItem.signups.filter((s) => s.isWaitlisted).length
        : 0;

      // Format class info
      const classInfo = [
        `"${classItem.title?.replace(/"/g, '""') || ""}"`,
        `"${section.title?.replace(/"/g, '""') || ""}"`,
        formatDate(classItem.startDate),
        formatDate(classItem.endDate),
        `"${meetingDays}"`,
        `"${meetingTimes}"`,
        `"${classItem.location?.replace(/"/g, '""') || ""}"`,
        classItem.capacity || "Unlimited",
        enrolledCount,
        waitlistCount,
      ];

      // Add row for class
      csvContent += classInfo.join(",") + "\n";
    });
  });

  return csvContent;
};

/**
 * Generates a CSV string for Community Resource Center capacity report
 * This shows daily attendance numbers across all classes with dates in columns and classes in rows
 * @param {Object} semester - The semester object containing sections and classes
 * @returns {string} CSV formatted string
 */
export const generateCapacityReportCSV = (semester) => {
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

  // Create CSV headers (Class, Section, followed by dates)
  const headers = ["Class", "Section"];

  // Add dates as column headers
  sortedDates.forEach((date) => {
    headers.push(`${formatDate(date)} (${getDayOfWeek(date)})`);
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
        row.push("- -");
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

  // '- - signifies no class held this day
  csvContent += "\nNote: '- -' indicates no class held on this day.\n";

  return csvContent;
};

/**
 * Downloads a string as a CSV file
 * @param {string} csvContent - The CSV content to download
 * @param {string} fileName - The name of the file to download
 */
export const downloadCSV = (csvContent, fileName) => {
  // Create a blob from the CSV content
  const bom = "\uFEFF";
  const csvWithBom = bom + csvContent;
  const blob = new Blob([csvWithBom], { type: "text/csv;charset=utf-8;" });

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
 * Generate and download reports for various types
 */
export const Reports = {
  /**
   * Generates the attendance report and downloads it
   * @param {Object} semester - The semester data
   */
  generateAttendanceReport: (semester) => {
    // Generate CSV content
    const csvContent = generateDetailedCSV(semester);

    // Generate safe filename from semester title
    const safeTitle = semester.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const fileName = `${safeTitle}_attendance_stats_${
      new Date().toISOString().split("T")[0]
    }.csv`;

    // Download the CSV
    downloadCSV(csvContent, fileName);
  },

  /**
   * Generates the student attendance report and downloads it
   * @param {Object} semester - The semester data
   */
  generateStudentAttendanceReport: (semester) => {
    // Generate CSV content
    const csvContent = generateStudentAttendanceReportCSV(semester);

    // Generate safe filename from semester title
    const safeTitle = semester.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const fileName = `${safeTitle}_student_attendance_${
      new Date().toISOString().split("T")[0]
    }.csv`;

    // Download the CSV
    downloadCSV(csvContent, fileName);
  },

  /**
   * Generates the student roster report and downloads it
   * @param {Object} semester - The semester data
   */
  generateStudentReport: (semester) => {
    // Generate CSV content
    const csvContent = generateStudentReportCSV(semester);

    // Generate safe filename from semester title
    const safeTitle = semester.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const fileName = `${safeTitle}_student_roster_${
      new Date().toISOString().split("T")[0]
    }.csv`;

    // Download the CSV
    downloadCSV(csvContent, fileName);
  },

  /**
   * Generates the class schedule report and downloads it
   * @param {Object} semester - The semester data
   */
  generateClassScheduleReport: (semester) => {
    // Generate CSV content
    const csvContent = generateClassScheduleReportCSV(semester);

    // Generate safe filename from semester title
    const safeTitle = semester.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const fileName = `${safeTitle}_class_schedule_${
      new Date().toISOString().split("T")[0]
    }.csv`;

    // Download the CSV
    downloadCSV(csvContent, fileName);
  },

  /**
   * Generates the capacity report and downloads it
   * @param {Object} semester - The semester data
   */
  generateCapacityReport: (semester) => {
    // Generate CSV content
    const csvContent = generateCapacityReportCSV(semester);

    // Generate safe filename from semester title
    const safeTitle = semester.title.replace(/[^a-z0-9]/gi, "_").toLowerCase();
    const fileName = `${safeTitle}_capacity_report_${
      new Date().toISOString().split("T")[0]
    }.csv`;

    // Download the CSV
    downloadCSV(csvContent, fileName);
  },
};

// Export all functionalities
export default Reports;
