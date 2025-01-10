export const generateCityTable = (cityData) => {
  const cityTable = {
    name: cityData.name,
    state: cityData.state,
    country: cityData.country,
    visibility: cityData.visibility ? "Public" : "Hidden",
    numberOfCommunities: cityData.communities?.length || 0,
    numberOfCityOwners: cityData.cityOwners?.length || 0,
    cityAdmins: cityData.cityOwners
      ?.filter((owner) => owner.role === "City Admin")
      .map((admin) => `${admin.firstName} ${admin.lastName}`)
      .join("; "),
    communityNames: cityData.communities?.map((c) => c.name).join("; "), // Changed from title to name
    totalEvents: cityData.upcomingEvents?.length || 0,
    hasCoordinates:
      Object.keys(cityData.coordinates || {}).length > 0 ? "Yes" : "No",
    hasBoundingShape: (cityData.boundingShape || []).length > 0 ? "Yes" : "No",
  };

  return [
    ["City Information"],
    Object.keys(cityTable),
    Object.values(cityTable).map((v) => `"${v}"`),
  ];
};

export const generateCommunityTable = (communityData) => {
  if (!communityData) return [];

  const statsTable = {
    name: communityData.name || "",
    visibility: communityData.visibility ? "Public" : "Hidden",
    totalClasses: communityData.classes?.length || 0,
    activeClasses: communityData.classes?.filter((c) => c.isActive).length || 0,
    uniqueTeachers:
      new Set(communityData.classes?.map((c) => c.teacher)).size || 0,
    volunteerHours: communityData.stats?.volunteerHours || 0,
    teachersAndVolunteers: communityData.stats?.numTeachersVolunteers || 0,
    activeVolunteers:
      communityData.volunteers?.filter((v) => v.isActive).length || 0,
    totalStudents: communityData.stats?.numStudents || 0,
    averageAttendance: communityData.attendance?.average || 0,
    serviceDays: communityData.stats?.serviceDays || 0,
    serviceHours: communityData.stats?.serviceHours || 0,
    serviceVolunteers: communityData.stats?.serviceVolunteers || 0,
    completedProjects:
      communityData.projects?.filter((p) => p.status === "completed").length ||
      0,
    totalEvents: communityData.events?.length || 0,
    upcomingEvents:
      communityData.events?.filter(
        (e) => new Date(e.start) > new Date() // Changed from e.date to e.start
      ).length || 0,
    location: communityData.resourceCenter?.location || "Not specified",
    operatingHours: communityData.resourceCenter?.hours || "Not specified",
    newsletterSubscribers: communityData.subscribers?.length || 0,
    lastUpdated: communityData.lastUpdated || "N/A",
  };

  return [
    [`\n\nCommunity: ${communityData.name} Statistics`],
    Object.keys(statsTable),
    Object.values(statsTable).map((v) => `"${v}"`),
  ];
};

const fetchCommunitiesByLocation = async (state, city) => {
  try {
    const response = await fetch(
      `/api/database/communities/location?state=${state}&city=${city}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch communities: ${response.statusText}`);
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching communities:", error);
    return [];
  }
};

export const generateFullReport = async (
  cityData,
  includedCommunities = []
) => {
  try {
    // Fetch all communities for this city
    const communities = await fetchCommunitiesByLocation(
      cityData.state,
      cityData.name
    );

    // Filter communities if includedCommunities array is not empty
    const filteredCommunities =
      includedCommunities.length > 0
        ? communities.filter((comm) => includedCommunities.includes(comm.name)) // Changed from title to name
        : communities;

    // Generate city table
    const cityTableRows = generateCityTable({
      ...cityData,
      communities: filteredCommunities,
    });

    // Generate community tables for included communities
    const communityTableRows = filteredCommunities.flatMap((comm) =>
      generateCommunityTable(comm)
    );

    // Combine all rows
    const allRows = [...cityTableRows, ...communityTableRows];

    // Convert to CSV
    const csv = allRows.map((row) => row.join(",")).join("\n");

    return csv;
  } catch (error) {
    console.error("Error generating report:", error);
    throw new Error("Failed to generate report");
  }
};
