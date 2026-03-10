/**
 * MyHometown Overview Report CSV Generator
 *
 * Headers:
 *   Location, # Service Missionaries and Volunteers,
 *   Service Missionaries/Volunteers Total Hours, Average Hours,
 *   Admin Service Hours, CRC Service Hours, CRC Classes Taught,
 *   CRC Students Enrolled, CRC Unique Students, CRC Total Attendance,
 *   DOS Service Hours, DOS Community Hours, DOS Community Volunteers,
 *   DOS # Projects, In-school Service Hours, Events Hours,
 *   Total Volunteers, Total Service Hours
 *
 * Layout: communities → blank → cities → blank → Utah → blank → Total
 *
 * DOS Community Hours, DOS Community Volunteers, and DOS # Projects are left
 * empty for city / Utah / Total rows (DOS projects are per-community only).
 */

function escapeCSV(value) {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

/**
 * Sum hours from the activities JSONB for a given category key.
 * Activities is an array like: [{ category: "crc", hours: "5", ... }, ...]
 */
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

/**
 * Compute overview stats for a set of missionaries, hours entries, and DOS projects.
 * @param {boolean} includeDos - whether to fill DOS community columns (false for cities/utah/total)
 * @param {Object} crcData - { classCount, studentsEnrolled, uniqueStudents, totalAttendance }
 */
function computeOverviewStats(
  missionaries,
  hoursEntries,
  dosProjects,
  crcData,
  includeDos,
  elapsedMonths,
) {
  const mvCount = missionaries.length;

  const adminHours = sumActivityHours(hoursEntries, "administrative");
  const crcHours = sumActivityHours(hoursEntries, "crc");
  const dosServiceHours = sumActivityHours(hoursEntries, "dos");
  const inSchoolHours = sumActivityHours(hoursEntries, "in-school-services");
  const eventsHours = sumActivityHours(hoursEntries, "community-events");

  let dosCommunityHours = "";
  let dosCommunityVolunteers = "";
  let dosProjectCount = "";

  if (includeDos) {
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

    dosCommunityHours = communityHoursNum.toFixed(1);
    dosCommunityVolunteers = String(communityVolunteersNum);
    dosProjectCount = String(projectNum);
  }

  const totalServiceHours =
    adminHours + crcHours + dosServiceHours + inSchoolHours + eventsHours;

  const smvTotalHours = totalServiceHours;

  const avgHours =
    mvCount > 0 && elapsedMonths > 0
      ? totalServiceHours / mvCount / elapsedMonths
      : 0;

  const dosVolNum = includeDos
    ? dosProjects.reduce(
        (sum, p) => sum + (parseFloat(p.actual_volunteers) || 0),
        0,
      )
    : 0;
  const totalVolunteers = mvCount + dosVolNum;

  return {
    mvCount,
    smvTotalHours: smvTotalHours.toFixed(1),
    avgHours: avgHours.toFixed(1),
    adminHours: adminHours.toFixed(1),
    crcHours: crcHours.toFixed(1),
    classCount: crcData.classCount ?? "",
    studentsEnrolled: crcData.studentsEnrolled ?? "",
    uniqueStudents: crcData.uniqueStudents ?? "",
    totalAttendance: crcData.totalAttendance ?? "",
    dosServiceHours: dosServiceHours.toFixed(1),
    dosCommunityHours,
    dosCommunityVolunteers,
    dosProjectCount,
    inSchoolHours: inSchoolHours.toFixed(1),
    eventsHours: eventsHours.toFixed(1),
    totalVolunteers,
    totalServiceHours: totalServiceHours.toFixed(1),
  };
}

function statsToRow(location, stats) {
  return [
    escapeCSV(location),
    stats.mvCount,
    stats.smvTotalHours,
    stats.avgHours,
    stats.adminHours,
    stats.crcHours,
    stats.classCount,
    stats.studentsEnrolled,
    stats.uniqueStudents,
    stats.totalAttendance,
    stats.dosServiceHours,
    stats.dosCommunityHours,
    stats.dosCommunityVolunteers,
    stats.dosProjectCount,
    stats.inSchoolHours,
    stats.eventsHours,
    stats.totalVolunteers,
    stats.totalServiceHours,
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
 * @param {Object} params.crcStats - { [communityId]: { classCount, studentsEnrolled, uniqueStudents, totalAttendance } }
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
  // Calculate elapsed months from date range
  const start = new Date(dateRange.startDate);
  const end = dateRange.endDate ? new Date(dateRange.endDate) : new Date();
  const daysElapsed = Math.max(
    1,
    Math.round((end - start) / (1000 * 60 * 60 * 24)) + 1,
  );
  const elapsedMonths = daysElapsed / 30.5;

  const headers = [
    "Location",
    "# Service Missionaries and Volunteers",
    "Service Missionaries/Volunteers Total Hours",
    "Average Hours",
    "Admin Service Hours",
    "CRC Service Hours",
    "CRC Classes Taught",
    "CRC Students Enrolled",
    "CRC Unique Students",
    "CRC Total Attendance",
    "DOS Service Hours",
    "DOS Community Hours",
    "DOS Community Volunteers",
    "DOS # Projects",
    "In-school Service Hours",
    "Events Hours",
    "Total Volunteers",
    "Total Service Hours",
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

  const rows = [headers.join(",")];

  const emptyCrc = {
    classCount: 0,
    studentsEnrolled: 0,
    uniqueStudents: 0,
    totalAttendance: 0,
  };

  const addCrc = (a, b) => ({
    classCount: (a.classCount || 0) + (b.classCount || 0),
    studentsEnrolled: (a.studentsEnrolled || 0) + (b.studentsEnrolled || 0),
    uniqueStudents: (a.uniqueStudents || 0) + (b.uniqueStudents || 0),
    totalAttendance: (a.totalAttendance || 0) + (b.totalAttendance || 0),
  });

  const cityRows = [];
  let utahMissionaries = [];
  let utahHoursEntries = [];
  let utahCrc = { ...emptyCrc };
  let allMissionaries = [];
  let allHoursEntries = [];
  let allCrc = { ...emptyCrc };

  for (const [cityId, cityInfo] of sortedCityEntries) {
    let cityMissionaries = [];
    let cityHoursEntries = [];
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
        true,
        elapsedMonths,
      );

      const cityName = cityInfo.name || "";
      const commName = community.name || "";
      const displayName =
        commName.toLowerCase() === cityName.toLowerCase()
          ? commName
          : `${cityName} ${commName}`;
      rows.push(statsToRow(displayName, stats));

      cityMissionaries = cityMissionaries.concat(commMissionaries);
      cityHoursEntries = cityHoursEntries.concat(commHours);
      cityCrc = addCrc(cityCrc, commCrc);
    }

    cityRows.push({
      name: cityInfo.name,
      missionaries: cityMissionaries,
      hours: cityHoursEntries,
      crc: cityCrc,
    });

    if (cityInfo.state && cityInfo.state.toLowerCase().includes("utah")) {
      utahMissionaries = utahMissionaries.concat(cityMissionaries);
      utahHoursEntries = utahHoursEntries.concat(cityHoursEntries);
      utahCrc = addCrc(utahCrc, cityCrc);
    }

    allMissionaries = allMissionaries.concat(cityMissionaries);
    allHoursEntries = allHoursEntries.concat(cityHoursEntries);
    allCrc = addCrc(allCrc, cityCrc);
  }

  // Empty row after communities
  rows.push("");

  // City rows (no DOS community columns)
  for (const city of cityRows) {
    const cityStats = computeOverviewStats(
      city.missionaries,
      city.hours,
      [],
      city.crc,
      false,
      elapsedMonths,
    );
    rows.push(statsToRow(city.name, cityStats));
  }

  // Empty row after cities
  rows.push("");

  // Utah
  if (utahMissionaries.length > 0) {
    const utahStats = computeOverviewStats(
      utahMissionaries,
      utahHoursEntries,
      [],
      utahCrc,
      false,
      elapsedMonths,
    );
    rows.push(statsToRow("Utah", utahStats));
    rows.push("");
  }

  // Total
  const totalStats = computeOverviewStats(
    allMissionaries,
    allHoursEntries,
    [],
    allCrc,
    false,
    elapsedMonths,
  );
  rows.push(statsToRow("Total", totalStats));

  return rows.join("\n");
}
