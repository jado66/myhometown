/**
 * MVMS Hours Report CSV Generator
 *
 * Generates a CSV with rows for each community, city subtotals, state subtotals, and a grand total.
 *
 * Headers:
 *   Location, Missionary & Volunteer Count, Missionary & Volunteer Hours,
 *   Missionary & Volunteers who logged hours, Missionary & Volunteers didn't log hours,
 *   % of Missionary & Volunteers who logged hours, AVG Monthly Hours, AVG Weekly Hours
 */

/**
 * Compute the number of months covered by the date range.
 * Falls back to 1 if no start date is provided.
 */
function getMonthsInRange(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const months = diffDays / 30.44; // average days per month
  return Math.max(1, months);
}

/**
 * Compute the number of weeks covered by the date range.
 * Falls back to 1 if no start date is provided.
 */
function getWeeksInRange(startDate, endDate) {
  if (!startDate || !endDate) return 1;
  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffMs = end - start;
  const diffDays = diffMs / (1000 * 60 * 60 * 24);
  const weeks = diffDays / 7;
  return Math.max(1, weeks);
}

/**
 * Compute a single row of stats given a list of missionaries and all hours entries.
 */
function computeRowStats(missionaries, hoursEntries, months, weeks) {
  const count = missionaries.length;
  const totalHours = hoursEntries.reduce(
    (sum, h) => sum + (parseFloat(h.total_hours) || 0),
    0,
  );

  // IDs of missionaries who have at least one hour entry
  const missionaryIdsWithHours = new Set(
    hoursEntries.map((h) => h.missionary_id),
  );

  const loggedCount = missionaries.filter((m) =>
    missionaryIdsWithHours.has(m.id),
  ).length;
  const notLoggedCount = count - loggedCount;
  const pctLogged = count > 0 ? ((loggedCount / count) * 100).toFixed(1) : "0.0";
  const avgMonthly = count > 0 ? (totalHours / count / months).toFixed(1) : "0.0";
  const avgWeekly = count > 0 ? (totalHours / count / weeks).toFixed(1) : "0.0";

  return {
    count,
    totalHours: totalHours.toFixed(1),
    loggedCount,
    notLoggedCount,
    pctLogged,
    avgMonthly,
    avgWeekly,
  };
}

function escapeCSV(value) {
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function statsToRow(location, stats) {
  return [
    escapeCSV(location),
    stats.count,
    stats.totalHours,
    stats.loggedCount,
    stats.notLoggedCount,
    stats.pctLogged + "%",
    stats.avgMonthly,
    stats.avgWeekly,
  ].join(",");
}

/**
 * Generate the MVMS Hours Report CSV content.
 *
 * @param {Object} params
 * @param {Array} params.communities - community objects with id, name, city_id, cities: { id, name, state }
 * @param {Array} params.missionaries - missionary objects with id, community_id
 * @param {Array} params.hours - missionary_hours objects with missionary_id, total_hours, period_start_date
 * @param {Object} params.dateRange - { startDate, endDate }
 * @returns {string} CSV content
 */
export function generateMVMSHoursReportCSV({
  communities,
  missionaries,
  hours,
  dateRange,
}) {
  const headers = [
    "Location",
    "Missionary & Volunteer Count",
    "Missionary & Volunteer Hours",
    "Missionary & Volunteers who logged hours",
    "Missionary & Volunteers didn't log hours",
    "% of Missionary & Volunteers who logged hours",
    "AVG Monthly Hours",
    "AVG Weekly Hours",
  ];

  const months = getMonthsInRange(dateRange.startDate, dateRange.endDate);
  const weeks = getWeeksInRange(dateRange.startDate, dateRange.endDate);

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

  // Group communities by city
  const citiesMap = {}; // cityId -> { name, state, communityIds: [] }
  communities.forEach((c) => {
    const cityId = c.city_id || "unknown";
    const cityName = c.cities?.name || "Unknown";
    const cityState = c.cities?.state || "Unknown";
    if (!citiesMap[cityId]) {
      citiesMap[cityId] = { name: cityName, state: cityState, communityIds: [] };
    }
    citiesMap[cityId].communityIds.push(c.id);
  });

  // Sort cities alphabetically
  const sortedCityEntries = Object.entries(citiesMap).sort((a, b) =>
    a[1].name.localeCompare(b[1].name),
  );

  const rows = [headers.join(",")];

  // Track city-level aggregates for later
  const cityRows = []; // { name, missionaries, hours }
  let utahMissionaries = [];
  let utahHours = [];
  let allMissionaries = [];
  let allHours = [];

  for (const [cityId, cityInfo] of sortedCityEntries) {
    let cityMissionaries = [];
    let cityHoursEntries = [];

    // Sort community IDs so we get consistent order
    const communitiesInCity = communities
      .filter((c) => cityInfo.communityIds.includes(c.id))
      .sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    for (const community of communitiesInCity) {
      const commMissionaries = missionaryByCommunity[community.id] || [];
      const commHours = commMissionaries.flatMap(
        (m) => hoursByMissionary[m.id] || [],
      );

      const stats = computeRowStats(commMissionaries, commHours, months, weeks);
      // Prepend city name unless the community name matches the city name
      const cityName = cityInfo.name || "";
      const commName = community.name || "";
      const displayName =
        commName.toLowerCase() === cityName.toLowerCase()
          ? commName
          : `${cityName} ${commName}`;
      rows.push(statsToRow(displayName, stats));

      cityMissionaries = cityMissionaries.concat(commMissionaries);
      cityHoursEntries = cityHoursEntries.concat(commHours);
    }

    // Save city aggregate for city section below
    cityRows.push({
      name: cityInfo.name,
      missionaries: cityMissionaries,
      hours: cityHoursEntries,
    });

    // Accumulate for state
    if (
      cityInfo.state &&
      cityInfo.state.toLowerCase().includes("utah")
    ) {
      utahMissionaries = utahMissionaries.concat(cityMissionaries);
      utahHours = utahHours.concat(cityHoursEntries);
    }

    allMissionaries = allMissionaries.concat(cityMissionaries);
    allHours = allHours.concat(cityHoursEntries);
  }

  // Empty row after communities
  rows.push("");

  // City rows
  for (const city of cityRows) {
    const cityStats = computeRowStats(city.missionaries, city.hours, months, weeks);
    rows.push(statsToRow(city.name, cityStats));
  }

  // Empty row after cities
  rows.push("");

  // Utah subtotal
  if (utahMissionaries.length > 0) {
    const utahStats = computeRowStats(utahMissionaries, utahHours, months, weeks);
    rows.push(statsToRow("Utah", utahStats));
    rows.push("");
  }

  // Grand total
  const totalStats = computeRowStats(allMissionaries, allHours, months, weeks);
  rows.push(statsToRow("Total", totalStats));

  return rows.join("\n");
}
