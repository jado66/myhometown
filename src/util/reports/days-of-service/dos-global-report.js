/**
 * Days of Service Global Report CSV Generator
 *
 * Generates a CSV report of all Days of Service projects across selected communities.
 * Uses FE labels (not raw DB column names) per the field renaming:
 *
 *   partner_ward           → Partner Group
 *   partner_ward_liaison   → Partner Group Liaison
 *   project_development_couple → Resource Couple
 *   project_development_couple_ward → Encompassing Area
 *   partner_stake           → Partner Organization
 *   project_id              → Project Short Description
 *   phone_number            → Property Owner Phone
 *   email                   → Property Owner Email
 *   host_name               → Host Name
 *
 * Layout per Day of Service event:
 *   Header row with event name + date
 *   Column headers
 *   One row per project grouped by Partner Organization
 *   Blank rows between events
 *
 * After all events, a summary section shows per-community totals.
 */

function escapeCSV(value) {
  if (value == null) return "";
  const str = String(value);
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function formatBoolean(value) {
  if (value === true) return "Yes";
  if (value === false) return "No";
  return "";
}

function formatAddress(project) {
  return [
    project.address_street1,
    project.address_street2,
    project.address_city,
    project.address_state,
    project.address_zip_code,
  ]
    .filter(Boolean)
    .join(", ");
}

function formatDate(dateStr) {
  if (!dateStr) return "N/A";
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString("en-US", {
      weekday: "short",
      month: "2-digit",
      day: "2-digit",
      year: "2-digit",
    });
  } catch {
    return dateStr;
  }
}

/**
 * Generate global Days of Service report CSV content.
 *
 * @param {Object} params
 * @param {Array} params.communities - community objects with id, name, city_id, cities: { name, state }
 * @param {Array} params.daysOfService - days_of_service event objects with partner_stakes JSONB, end_date, etc.
 * @param {Array} params.projects - days_of_service_project_forms objects
 * @param {Object} params.dateRange - { startDate, endDate }
 * @returns {string} CSV content
 */
export function generateDOSReportCSV({
  communities,
  daysOfService,
  projects,
  dateRange,
}) {
  const rows = [];

  // Build community lookup
  const communityMap = {};
  communities.forEach((c) => {
    communityMap[c.id] = {
      name: c.name,
      cityName: c.cities?.name || "Unknown",
      state: c.cities?.state || "",
    };
  });

  // Build DOS lookup: days_of_service_id → day of service event
  const dosMap = {};
  daysOfService.forEach((dos) => {
    dosMap[dos.id] = dos;
  });

  // Build project lookup by days_of_service_id
  const projectsByDos = {};
  const unassignedProjects = [];
  projects.forEach((p) => {
    if (p.days_of_service_id) {
      if (!projectsByDos[p.days_of_service_id]) {
        projectsByDos[p.days_of_service_id] = [];
      }
      projectsByDos[p.days_of_service_id].push(p);
    } else {
      unassignedProjects.push(p);
    }
  });

  // Column headers for the detailed project rows
  const projectHeaders = [
    "City",
    "Community",
    "Day of Service",
    "Service Date",
    "Partner Organization",
    "Partner Group",
    "Project Name",
    "Project Short Description",
    "Status",
    "Property Owner",
    "Property Owner Phone",
    "Property Owner Email",
    "Address",
    "Resource Couple",
    "Resource Couple Phone",
    "Resource Couple Email",
    "Encompassing Area",
    "Host Name",
    "Host Phone",
    "Host Email",
    "Partner Group Liaison",
    "Partner Group Liaison Phone",
    "Partner Group Liaison Email",
    "Needed # of Volunteers",
    "Actual # of Volunteers",
    "Actual # of Hours",
    "Dumpster Needed",
    "Second Dumpster Needed",
    "Blue Stakes Needed",
    "Prep Day",
    "Waiver Signed",
  ];

  // Title row
  const dateRangeStr = [
    dateRange?.startDate || "All time",
    dateRange?.endDate || "Present",
  ].join(" to ");
  rows.push(escapeCSV(`Days of Service Report — ${dateRangeStr}`));
  rows.push("");

  // Header row
  rows.push(projectHeaders.map(escapeCSV).join(","));

  // Sort days of service by community name then end_date
  const sortedDos = [...daysOfService].sort((a, b) => {
    const commA = communityMap[a.community_id]?.name || "";
    const commB = communityMap[b.community_id]?.name || "";
    if (commA !== commB) return commA.localeCompare(commB);
    return (a.end_date || "").localeCompare(b.end_date || "");
  });

  // Track summary stats per community
  const communityStats = {};

  for (const dos of sortedDos) {
    const community = communityMap[dos.community_id] || {};
    const cityName = community.cityName || "Unknown";
    const communityName = community.name || "Unknown";
    const dosName = dos.name || "Day of Service";
    const serviceDate = formatDate(dos.end_date);
    const dosProjects = projectsByDos[dos.id] || [];

    // Build partner stake lookup for this DOS
    const stakeMap = {};
    if (dos.partner_stakes && Array.isArray(dos.partner_stakes)) {
      dos.partner_stakes.forEach((s) => {
        stakeMap[s.id] = s;
      });
    }

    // Initialize community stats if needed
    if (!communityStats[dos.community_id]) {
      communityStats[dos.community_id] = {
        cityName,
        communityName,
        totalEvents: 0,
        totalProjects: 0,
        totalVolunteersNeeded: 0,
        totalActualVolunteers: 0,
        totalActualHours: 0,
      };
    }
    communityStats[dos.community_id].totalEvents += 1;

    if (dosProjects.length === 0) {
      // Still add a row showing the event exists but has no projects
      rows.push(
        [
          escapeCSV(cityName),
          escapeCSV(communityName),
          escapeCSV(dosName),
          escapeCSV(serviceDate),
          "", // Partner Organization
          "", // Partner Group
          escapeCSV("(No projects)"),
          ...Array(projectHeaders.length - 7).fill(""),
        ].join(","),
      );
      continue;
    }

    // Group projects by partner_stake_id for organization
    for (const project of dosProjects) {
      const stake = project.partner_stake_id
        ? stakeMap[project.partner_stake_id]
        : null;
      const stakeName = stake?.name || "";

      communityStats[dos.community_id].totalProjects += 1;
      communityStats[dos.community_id].totalVolunteersNeeded +=
        parseFloat(project.volunteers_needed) || 0;
      communityStats[dos.community_id].totalActualVolunteers +=
        parseFloat(project.actual_volunteers) || 0;
      communityStats[dos.community_id].totalActualHours +=
        (parseFloat(project.actual_volunteers) || 0) *
        (parseFloat(project.actual_project_duration) || 0);

      const row = [
        escapeCSV(cityName),
        escapeCSV(communityName),
        escapeCSV(dosName),
        escapeCSV(serviceDate),
        escapeCSV(stakeName),
        escapeCSV(project.partner_ward || ""),
        escapeCSV(project.project_name || ""),
        escapeCSV(project.project_id || ""),
        escapeCSV(
          project.status
            ? project.status.charAt(0).toUpperCase() + project.status.slice(1)
            : "",
        ),
        escapeCSV(project.property_owner || ""),
        escapeCSV(project.phone_number || ""),
        escapeCSV(project.email || ""),
        escapeCSV(formatAddress(project)),
        escapeCSV(project.project_development_couple || ""),
        escapeCSV(project.project_development_couple_phone1 || ""),
        escapeCSV(project.project_development_couple_email1 || ""),
        escapeCSV(project.project_development_couple_ward || ""),
        escapeCSV(project.host_name || ""),
        escapeCSV(project.host_phone || ""),
        escapeCSV(project.host_email || ""),
        escapeCSV(project.partner_ward_liaison || ""),
        escapeCSV(project.partner_ward_liaison_phone1 || ""),
        escapeCSV(project.partner_ward_liaison_email1 || ""),
        project.volunteers_needed != null ? project.volunteers_needed : "",
        project.actual_volunteers != null ? project.actual_volunteers : "",
        project.actual_project_duration != null
          ? project.actual_project_duration
          : "",
        escapeCSV(formatBoolean(project.is_dumpster_needed)),
        escapeCSV(formatBoolean(project.is_second_dumpster_needed)),
        escapeCSV(formatBoolean(project.are_blue_stakes_needed)),
        escapeCSV(formatBoolean(project.has_prep_day)),
        escapeCSV(formatBoolean(project.is_waiver_signed)),
      ];

      rows.push(row.join(","));
    }
  }

  // Unassigned projects (no days_of_service_id)
  if (unassignedProjects.length > 0) {
    rows.push("");
    rows.push(
      escapeCSV(
        "--- Unassigned Projects (not linked to a Day of Service event) ---",
      ),
    );
    rows.push(projectHeaders.map(escapeCSV).join(","));

    for (const project of unassignedProjects) {
      const community = communityMap[project.community_id] || {};
      const cityName = community.cityName || "Unknown";
      const communityName = community.name || "Unknown";

      const row = [
        escapeCSV(cityName),
        escapeCSV(communityName),
        "",
        "",
        "",
        escapeCSV(project.partner_ward || ""),
        escapeCSV(project.project_name || ""),
        escapeCSV(project.project_id || ""),
        escapeCSV(
          project.status
            ? project.status.charAt(0).toUpperCase() + project.status.slice(1)
            : "",
        ),
        escapeCSV(project.property_owner || ""),
        escapeCSV(project.phone_number || ""),
        escapeCSV(project.email || ""),
        escapeCSV(formatAddress(project)),
        escapeCSV(project.project_development_couple || ""),
        escapeCSV(project.project_development_couple_phone1 || ""),
        escapeCSV(project.project_development_couple_email1 || ""),
        escapeCSV(project.project_development_couple_ward || ""),
        escapeCSV(project.host_name || ""),
        escapeCSV(project.host_phone || ""),
        escapeCSV(project.host_email || ""),
        escapeCSV(project.partner_ward_liaison || ""),
        escapeCSV(project.partner_ward_liaison_phone1 || ""),
        escapeCSV(project.partner_ward_liaison_email1 || ""),
        project.volunteers_needed != null ? project.volunteers_needed : "",
        project.actual_volunteers != null ? project.actual_volunteers : "",
        project.actual_project_duration != null
          ? project.actual_project_duration
          : "",
        escapeCSV(formatBoolean(project.is_dumpster_needed)),
        escapeCSV(formatBoolean(project.is_second_dumpster_needed)),
        escapeCSV(formatBoolean(project.are_blue_stakes_needed)),
        escapeCSV(formatBoolean(project.has_prep_day)),
        escapeCSV(formatBoolean(project.is_waiver_signed)),
      ];

      rows.push(row.join(","));
    }
  }

  // Summary section
  rows.push("");
  rows.push("");
  rows.push(escapeCSV("=== SUMMARY BY COMMUNITY ==="));
  rows.push(
    [
      "City",
      "Community",
      "Total Events",
      "Total Projects",
      "Total Volunteers Needed",
      "Total Actual Volunteers",
      "Total Volunteer Hours",
    ]
      .map(escapeCSV)
      .join(","),
  );

  // Sort by city then community
  const statEntries = Object.values(communityStats).sort((a, b) => {
    if (a.cityName !== b.cityName) return a.cityName.localeCompare(b.cityName);
    return a.communityName.localeCompare(b.communityName);
  });

  let grandTotalEvents = 0;
  let grandTotalProjects = 0;
  let grandTotalNeeded = 0;
  let grandTotalActual = 0;
  let grandTotalHours = 0;

  for (const stat of statEntries) {
    rows.push(
      [
        escapeCSV(stat.cityName),
        escapeCSV(stat.communityName),
        stat.totalEvents,
        stat.totalProjects,
        stat.totalVolunteersNeeded,
        stat.totalActualVolunteers,
        stat.totalActualHours.toFixed(1),
      ].join(","),
    );

    grandTotalEvents += stat.totalEvents;
    grandTotalProjects += stat.totalProjects;
    grandTotalNeeded += stat.totalVolunteersNeeded;
    grandTotalActual += stat.totalActualVolunteers;
    grandTotalHours += stat.totalActualHours;
  }

  // Grand total row
  rows.push("");
  rows.push(
    [
      escapeCSV("TOTAL"),
      "",
      grandTotalEvents,
      grandTotalProjects,
      grandTotalNeeded,
      grandTotalActual,
      grandTotalHours.toFixed(1),
    ].join(","),
  );

  return rows.join("\n");
}
