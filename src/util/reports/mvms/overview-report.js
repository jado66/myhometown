/**
 * MyHometown Overview Report CSV Generator
 *
 * Two-section layout:
 *   Section 1 — Missionary and Volunteer Statistics
 *     Location, # Service Missionaries and Volunteers,
 *     Service Missionaries/Volunteers Total Hours, Average Monthly Hours,
 *     % Logging Hours, Admin Service Hours, CRC Service Hours,
 *     DOS Service Hours, In-school Service Hours, Events Hours
 *
 *   Section 2 — CRC and Days of Service Statistics
 *     Location, CRC Classes Taught, CRC Students Attended,
 *     CRC Total Attendance, DOS Community Hours, DOS Community Volunteers,
 *     DOS # Projects,
 *     (blank), Total Volunteers, Total Service Hours, (blank)
 *
 * Per section: communities → blank → cities → blank → Utah → blank → Total
 */

const COL_COUNT = 11;
const EMPTY_ROW = new Array(COL_COUNT).join(",");

function escapeCSV(value) {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function fmtNum(num) {
  const rounded = Math.round(num);
  if (rounded === 0) return "-";
  return escapeCSV(rounded.toLocaleString("en-US"));
}

function labelRow(text) {
  return text + EMPTY_ROW;
}

function formatDateLong(date) {
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
}

function sumActivityHours(hoursEntries, categoryKey) {
  let total = 0;
  for (const entry of hoursEntries) {
    const activities = entry.activities;
    if (!Array.isArray(activities)) continue;
    for (const act of activities) {
      if (act.category === categoryKey) {
        total += parseFloat(act.hours) || 0;
      }
    }
  }
  return total;
}

function computeOverviewStats(
  missionaries,
  hoursEntries,
  dosProjects,
  crcData,
  elapsedMonths,
) {
  const mvCount = missionaries.length;

  const adminHours = sumActivityHours(hoursEntries, "administrative");
  const crcHours = sumActivityHours(hoursEntries, "crc");
  const dosServiceHours = sumActivityHours(hoursEntries, "dos");
  const inSchoolHours = sumActivityHours(hoursEntries, "in-school-services");
  const eventsHours = sumActivityHours(hoursEntries, "community-events");

  let communityHoursNum = 0;
  let communityVolunteersNum = 0;
  let projectNum = 0;

  for (const proj of dosProjects) {
    const volunteers = parseFloat(proj.actual_volunteers) || 0;
    const duration = parseFloat(proj.actual_project_duration) || 0;
    communityHoursNum += volunteers * duration;
    communityVolunteersNum += volunteers;
    projectNum += 1;
  }

  const smvTotalHours =
    adminHours + crcHours + dosServiceHours + inSchoolHours + eventsHours;

  const totalServiceHours = smvTotalHours + communityHoursNum;

  const avgMonthlyHours =
    mvCount > 0 && elapsedMonths > 0
      ? smvTotalHours / mvCount / elapsedMonths
      : 0;

  const missionaryIdsWithHours = new Set(
    hoursEntries.map((h) => h.missionary_id),
  );
  const loggedCount = missionaries.filter((m) =>
    missionaryIdsWithHours.has(m.id),
  ).length;
  const pctLogged =
    mvCount > 0 ? Math.round((loggedCount / mvCount) * 100) : 0;

  const dosVolNum = dosProjects.reduce(
    (sum, p) => sum + (parseFloat(p.actual_volunteers) || 0),
    0,
  );

  return {
    mvCount,
    smvTotalHours,
    avgMonthlyHours,
    pctLogged,
    adminHours,
    crcHours,
    classCount: crcData.classCount || 0,
    studentsAttended: crcData.uniqueStudents || 0,
    totalAttendance: crcData.totalAttendance || 0,
    dosServiceHours,
    dosCommunityHours: communityHoursNum,
    dosCommunityVolunteers: communityVolunteersNum,
    dosProjectCount: projectNum,
    inSchoolHours,
    eventsHours,
    totalVolunteers: mvCount + dosVolNum,
    totalServiceHours,
  };
}

function section1Row(location, stats) {
  return [
    escapeCSV(location),
    fmtNum(stats.mvCount),
    fmtNum(stats.smvTotalHours),
    fmtNum(stats.avgMonthlyHours),
    stats.pctLogged > 0 ? stats.pctLogged + "%" : "-",
    fmtNum(stats.adminHours),
    fmtNum(stats.crcHours),
    fmtNum(stats.dosServiceHours),
    fmtNum(stats.inSchoolHours),
    fmtNum(stats.eventsHours),
  ].join(",");
}

function section2Row(location, stats) {
  return [
    escapeCSV(location),
    fmtNum(stats.classCount),
    fmtNum(stats.studentsAttended),
    fmtNum(stats.totalAttendance),
    fmtNum(stats.dosCommunityHours),
    fmtNum(stats.dosCommunityVolunteers),
    fmtNum(stats.dosProjectCount),
    "",
    fmtNum(stats.totalVolunteers),
    fmtNum(stats.totalServiceHours),
    "",
  ].join(",");
}

/**
 * Generate the MyHometown Overview Report CSV content.
 *
 * @param {Object} params
 * @param {Array} params.communities - community objects with id, name, city_id, cities: { id, name, state }
 * @param {Array} params.missionaries - missionary objects with id, community_id
 * @param {Array} params.hours - missionary_hours objects with missionary_id, total_hours, activities JSONB
 * @param {Array} params.dosProjects - DOS project form objects with community_id, actual_volunteers, actual_project_duration
 * @param {Object} params.crcStats - { [communityId]: { classCount, uniqueStudents, totalAttendance } }
 * @param {Object} params.dateRange - { startDate, endDate }
 * @returns {string} CSV content
 */
export function generateOverviewReportCSV({
  communities,
  missionaries,
  hours,
  dosProjects,
  crcStats,
  dateRange,
}) {
  const end = dateRange.endDate ? new Date(dateRange.endDate) : new Date();
  const start = dateRange.startDate
    ? new Date(dateRange.startDate)
    : new Date(end.getFullYear(), 0, 1);
  const daysElapsed = Math.max(
    1,
    Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1,
  );
  const elapsedMonths = daysElapsed / 30.5;

  const section1Headers = [
    "Location",
    "# Service Missionaries and Volunteers",
    "Service Missionaries/Volunteers Total Hours",
    "Average Monthly Hours",
    "% Logging Hours",
    "Admin Service Hours",
    "CRC Service Hours",
    "DOS Service Hours",
    "In-school Service Hours",
    "Events Hours",
  ];

  const section2Headers = [
    "Location",
    "CRC Classes Taught",
    "CRC Students Attended",
    "CRC Total Attendance",
    "DOS Community Hours",
    "DOS Community Volunteers",
    "DOS # Projects",
    "",
    "Total Volunteers",
    "Total Service Hours",
    "",
  ];

  // Build lookups
  const missionaryByCommunity = {};
  missionaries.forEach((m) => {
    if (!missionaryByCommunity[m.community_id]) {
      missionaryByCommunity[m.community_id] = [];
    }
    missionaryByCommunity[m.community_id].push(m);
  });

  const hoursByMissionary = {};
  hours.forEach((h) => {
    if (!hoursByMissionary[h.missionary_id]) {
      hoursByMissionary[h.missionary_id] = [];
    }
    hoursByMissionary[h.missionary_id].push(h);
  });

  const dosByCommunity = {};
  dosProjects.forEach((p) => {
    if (!dosByCommunity[p.community_id]) {
      dosByCommunity[p.community_id] = [];
    }
    dosByCommunity[p.community_id].push(p);
  });

  // Group communities by city
  const citiesMap = {};
  communities.forEach((c) => {
    const cityId = c.city_id || "unknown";
    const cityName = c.cities?.name || "Unknown";
    const cityState = c.cities?.state || "Unknown";
    if (!citiesMap[cityId]) {
      citiesMap[cityId] = {
        name: cityName,
        state: cityState,
        communityIds: [],
      };
    }
    citiesMap[cityId].communityIds.push(c.id);
  });

  const sortedCityEntries = Object.entries(citiesMap).sort((a, b) =>
    a[1].name.localeCompare(b[1].name),
  );

  const emptyCrc = { classCount: 0, uniqueStudents: 0, totalAttendance: 0 };

  const addCrc = (a, b) => ({
    classCount: (a.classCount || 0) + (b.classCount || 0),
    uniqueStudents: (a.uniqueStudents || 0) + (b.uniqueStudents || 0),
    totalAttendance: (a.totalAttendance || 0) + (b.totalAttendance || 0),
  });

  // Collect computed stats per community/city for reuse across both sections
  const communityEntries = [];
  const cityRows = [];
  let utahMissionaries = [];
  let utahHoursEntries = [];
  let utahDosProjects = [];
  let utahCrc = { ...emptyCrc };
  let allMissionaries = [];
  let allHoursEntries = [];
  let allDosProjects = [];
  let allCrc = { ...emptyCrc };

  for (const [cityId, cityInfo] of sortedCityEntries) {
    let cityMissionaries = [];
    let cityHoursEntries = [];
    let cityDosProjects = [];
    let cityCrc = { ...emptyCrc };

    const communitiesInCity = communities
      .filter((c) => cityInfo.communityIds.includes(c.id))
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    for (const community of communitiesInCity) {
      const commMissionaries = missionaryByCommunity[community.id] || [];
      const commHours = commMissionaries.flatMap(
        (m) => hoursByMissionary[m.id] || [],
      );
      const commDos = dosByCommunity[community.id] || [];
      const commCrc = crcStats[community.id] || { ...emptyCrc };

      const stats = computeOverviewStats(
        commMissionaries,
        commHours,
        commDos,
        commCrc,
        elapsedMonths,
      );

      const cityName = cityInfo.name || "";
      const commName = community.name || "";
      const displayName =
        commName.toLowerCase() === cityName.toLowerCase()
          ? commName
          : `${cityName} ${commName}`;

      communityEntries.push({ name: displayName, stats });

      cityMissionaries = cityMissionaries.concat(commMissionaries);
      cityHoursEntries = cityHoursEntries.concat(commHours);
      cityDosProjects = cityDosProjects.concat(commDos);
      cityCrc = addCrc(cityCrc, commCrc);
    }

    cityRows.push({
      name: cityInfo.name,
      missionaries: cityMissionaries,
      hours: cityHoursEntries,
      dosProjects: cityDosProjects,
      crc: cityCrc,
    });

    if (cityInfo.state && cityInfo.state.toLowerCase().includes("utah")) {
      utahMissionaries = utahMissionaries.concat(cityMissionaries);
      utahHoursEntries = utahHoursEntries.concat(cityHoursEntries);
      utahDosProjects = utahDosProjects.concat(cityDosProjects);
      utahCrc = addCrc(utahCrc, cityCrc);
    }

    allMissionaries = allMissionaries.concat(cityMissionaries);
    allHoursEntries = allHoursEntries.concat(cityHoursEntries);
    allDosProjects = allDosProjects.concat(cityDosProjects);
    allCrc = addCrc(allCrc, cityCrc);
  }

  // Pre-compute aggregate stats
  const cityStatsMap = cityRows.map((city) => ({
    name: city.name,
    stats: computeOverviewStats(
      city.missionaries,
      city.hours,
      city.dosProjects,
      city.crc,
      elapsedMonths,
    ),
  }));

  const utahStats =
    utahMissionaries.length > 0
      ? computeOverviewStats(utahMissionaries, utahHoursEntries, utahDosProjects, utahCrc, elapsedMonths)
      : null;

  const totalStats = computeOverviewStats(
    allMissionaries,
    allHoursEntries,
    allDosProjects,
    allCrc,
    elapsedMonths,
  );

  // --- Build CSV rows ---
  const rows = [];

  // Title & date range
  const dateLabel = escapeCSV(`from  ${formatDateLong(start)} to ${formatDateLong(end)}`);
  rows.push(labelRow("myHometown Overview Report"));
  rows.push(labelRow(dateLabel));
  rows.push(EMPTY_ROW);

  // ---- Section 1: Missionary and Volunteer Statistics ----
  rows.push(labelRow("Missionary and Volunteer Statistics"));
  rows.push(section1Headers.join(","));

  for (const entry of communityEntries) {
    rows.push(section1Row(entry.name, entry.stats));
  }
  rows.push(EMPTY_ROW);

  for (const city of cityStatsMap) {
    rows.push(section1Row(city.name, city.stats));
  }
  rows.push(EMPTY_ROW);

  if (utahStats) {
    rows.push(section1Row("Utah", utahStats));
    rows.push(EMPTY_ROW);
  }

  rows.push(section1Row("Total", totalStats));

  // Gap between sections
  rows.push(EMPTY_ROW);
  rows.push(EMPTY_ROW);

  // ---- Section 2: CRC and Days of Service Statistics ----
  rows.push(labelRow("CRC and Days of Service Statistics"));
  rows.push(section2Headers.join(","));

  for (const entry of communityEntries) {
    rows.push(section2Row(entry.name, entry.stats));
  }
  rows.push(EMPTY_ROW);

  for (const city of cityStatsMap) {
    rows.push(section2Row(city.name, city.stats));
  }
  rows.push(EMPTY_ROW);

  if (utahStats) {
    rows.push(section2Row("Utah", utahStats));
    rows.push(EMPTY_ROW);
  }

  rows.push(section2Row("Total", totalStats));

  return rows.join("\n");
}
