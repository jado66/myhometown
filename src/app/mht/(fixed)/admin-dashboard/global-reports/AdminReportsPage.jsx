"use client";
import React, { useState, useEffect } from "react";
import {
  Container,
  Typography,
  Box,
  Paper,
  Grid,
  Button,
  FormControlLabel,
  Checkbox,
  CircularProgress,
  Alert,
  Divider,
  Radio,
  RadioGroup,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  TextField,
} from "@mui/material";
import {
  FileDownload,
  School,
  AssignmentInd,
  Group,
  ExpandMore,
  CheckBox,
  CheckBoxOutlineBlank,
  AccessTime,
  Dashboard,
  VolunteerActivism,
} from "@mui/icons-material";
import { useCommunities } from "@/hooks/use-communities";
import { useClasses } from "@/hooks/use-classes";
import { useUser } from "@/hooks/use-user";
import Loading from "@/components/util/Loading";
import {
  downloadCSV,
  generateDetailedCSV,
  generateCapacityReportCSV,
  generateStudentAttendanceReportCSV,
} from "@/util/reports/classes/report-helper-functions";
import { generateMVMSHoursReportCSV } from "@/util/reports/mvms/mvms-hours-report";
import { generateOverviewReportCSV } from "@/util/reports/mvms/overview-report";
import { generateDOSReportCSV } from "@/util/reports/days-of-service/dos-global-report";

// Mapping from new community IDs to old ones (same as in ClassPage)
const newToOldCommunity = {
  "a78e8c7c-eca4-4f13-b6c8-e5603d1c36da": "66a811814800d08c300d88fd",
  "a6c19a50-7fc3-4759-b386-6ebdeca3ed9e":
    "fb34e335-5cc6-4e6c-b5fc-2b64588fe921",
  "b3381b98-e44f-4f1f-b067-04e575c515ca": "66df56bef05bd41ef9493f33",
  "7c446e80-323d-4268-b595-6945e915330f": "66df56e6f05bd41ef9493f34",
  "7c8731bc-1aee-406a-9847-7dc1e5255587": "66df5707f05bd41ef9493f35",
  "0806b0f4-9d56-4c1f-b976-ee04f60af194": "66df577bf05bd41ef9493f37",
  "bf4a7d58-b880-4c18-b923-6c89e2597c71": "66df5790f05bd41ef9493f38",
  "0bdf52a4-2efa-465b-a3b1-5ec4d1701967": "66df57a2f05bd41ef9493f39",
  "995c1860-9d5b-472f-a206-1c2dd40947bd": "66df57b3f05bd41ef9493f3a",
  "af0df8f5-dab7-47e4-aafc-9247fee6f29d": "66df57c2f05bd41ef9493f3b",
  "5de22b0b-5dc8-4d72-b424-95b0d1c94fcc": "66df57d1f05bd41ef9493f3c",
  "252cd4b1-830c-4cdb-913f-a1460f218616": "66df57e6f05bd41ef9493f3d",
  "7d059ebc-78ee-4b47-97ab-276ae480b8de": "6838adb32243dc8160ce207d",
  "4687e12e-497f-40a2-ab1b-ab455f250fce": "66df57faf05bd41ef9493f3e",
  "2bc57e19-0c73-4781-9fc6-ef26fc729847": "66df580bf05bd41ef9493f3f",
  "0076ad61-e165-4cd0-b6af-f4a30af2510c": "66df581af05bd41ef9493f40",
  "724b1aa6-0950-40ba-9453-cdd80085c5d4": "6876c09a2a087f662c17feed",
  "dcf35fbc-8053-40fa-b4a4-faaa61e2fbef": "6912655528c9b9c20ee4dede",
};

const AdminReportsPage = () => {
  const { user, isLoading: userLoading, isAdmin } = useUser();
  const { communities, hasLoaded: communitiesLoaded } = useCommunities(
    user,
    true,
  );
  const { getClassesByCommunity } = useClasses();
  const { getCommunity } = useCommunities();

  const [selectedCommunities, setSelectedCommunities] = useState([]);
  const [selectedReport, setSelectedReport] = useState("attendance");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);

  // Date range state
  const todayStr = new Date().toISOString().split("T")[0];
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState(todayStr);
  const [dateError, setDateError] = useState("");

  // Group communities by city for better organization
  const communitiesByCity = React.useMemo(() => {
    if (!communities || !Array.isArray(communities) || communities.length === 0)
      return {};

    return communities.reduce((acc, community) => {
      const cityName = community.city || community.city_name || "Unknown";
      if (!acc[cityName]) {
        acc[cityName] = [];
      }
      acc[cityName].push(community);
      return acc;
    }, {});
  }, [communities]);

  const handleCommunityToggle = (communityId) => {
    setSelectedCommunities((prev) => {
      if (prev.includes(communityId)) {
        return prev.filter((id) => id !== communityId);
      } else {
        return [...prev, communityId];
      }
    });
  };

  const handleSelectAll = () => {
    if (selectedCommunities.length === communities.length) {
      setSelectedCommunities([]);
    } else {
      setSelectedCommunities(communities.map((c) => c._id || c.id));
    }
  };

  const handleSelectCity = (cityName) => {
    const cityCommunities = communitiesByCity[cityName] || [];
    const cityIds = cityCommunities.map((c) => c._id || c.id);

    const allSelected = cityIds.every((id) => selectedCommunities.includes(id));

    if (allSelected) {
      // Deselect all from this city
      setSelectedCommunities((prev) =>
        prev.filter((id) => !cityIds.includes(id)),
      );
    } else {
      // Select all from this city
      setSelectedCommunities((prev) => {
        const newSelection = [...prev];
        cityIds.forEach((id) => {
          if (!newSelection.includes(id)) {
            newSelection.push(id);
          }
        });
        return newSelection;
      });
    }
  };

  const handleGenerateReport = async () => {
    if (selectedCommunities.length === 0) {
      setError("Please select at least one community");
      return;
    }

    // Validate dates
    if (endDate && endDate > todayStr) {
      setDateError("End date cannot be in the future");
      return;
    }
    if (startDate && endDate && startDate > endDate) {
      setDateError("Start date must be before end date");
      return;
    }
    setDateError("");

    const dateRange = {
      startDate: startDate || null,
      endDate: endDate || todayStr,
    };

    setGenerating(true);
    setError(null);

    try {
      // Days of Service Report uses its own dedicated data source
      if (selectedReport === "daysOfService") {
        const response = await fetch("/api/database/dos-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            communityIds: selectedCommunities,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.error || "Failed to fetch Days of Service data",
          );
        }

        const {
          communities: commData,
          daysOfService,
          projects,
        } = await response.json();

        const csvContent = generateDOSReportCSV({
          communities: commData,
          daysOfService,
          projects,
          dateRange,
        });

        const today = new Date().toISOString().split("T")[0];
        downloadCSV(csvContent, `days_of_service_report_${today}.csv`);
        setGenerating(false);
        return;
      }

      // MVMS Hours Report uses its own dedicated data source
      if (selectedReport === "mvmsHours") {
        const response = await fetch("/api/database/mvms-hours-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            communityIds: selectedCommunities,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch MVMS data");
        }

        const {
          communities: commData,
          missionaries,
          hours,
        } = await response.json();

        const csvContent = generateMVMSHoursReportCSV({
          communities: commData,
          missionaries,
          hours,
          dateRange,
        });

        const today = new Date().toISOString().split("T")[0];
        downloadCSV(csvContent, `mvms_hours_report_${today}.csv`);
        setGenerating(false);
        return;
      }

      // MyHometown Overview Report uses its own dedicated data source
      if (selectedReport === "overview") {
        const response = await fetch("/api/database/overview-report", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            communityIds: selectedCommunities,
            startDate: dateRange.startDate,
            endDate: dateRange.endDate,
          }),
        });

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData.error || "Failed to fetch overview data");
        }

        const {
          communities: commData,
          missionaries,
          hours,
          dosProjects,
          classCounts,
        } = await response.json();

        const csvContent = generateOverviewReportCSV({
          communities: commData,
          missionaries,
          hours,
          dosProjects,
          classCounts,
          dateRange,
        });

        const today = new Date().toISOString().split("T")[0];
        downloadCSV(csvContent, `myhometown_overview_report_${today}.csv`);
        setGenerating(false);
        return;
      }

      // Fetch all class data for selected communities
      const allSections = [];

      for (const communityId of selectedCommunities) {
        const oldCommunityId = newToOldCommunity[communityId] || communityId;

        // Fetch community data
        const communityResponse = await fetch(
          `/api/database/communities/fetchByIds`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify([oldCommunityId]),
          },
        );

        if (!communityResponse.ok) continue;

        const communityData = await communityResponse.json();
        const community = communityData[0];

        if (!community) continue;

        const cityName = community.city || community.city_name || "";
        const communityName = community.name || "";

        // Fetch classes for this community
        const classesData = await getClassesByCommunity(oldCommunityId);

        if (!classesData) continue;

        // Create a map of classes for quick lookup
        const classesMap = new Map(
          classesData.map((classItem) => [classItem.id, classItem]),
        );

        // Process each section/category from community data
        if (community.classes && Array.isArray(community.classes)) {
          community.classes.forEach((category) => {
            if (category.type === "header" || category.visibility === false)
              return;

            const sectionClasses = (category.classes || [])
              .map((communityClass) => {
                const fullClassData = classesMap.get(communityClass.id);
                return {
                  ...communityClass,
                  ...fullClassData,
                  title: communityClass.title || fullClassData?.title,
                  visibility:
                    communityClass.visibility ?? fullClassData?.visibility,
                  cityName,
                  communityName,
                };
              })
              .filter((c) => c.visibility !== false);

            if (sectionClasses.length > 0) {
              allSections.push({
                title: `${cityName} - ${communityName} - ${category.title}`,
                visibility: true,
                cityName,
                communityName,
                classes: sectionClasses,
              });
            }
          });
        }
      }

      if (allSections.length === 0) {
        setError("No classes found for selected communities");
        setGenerating(false);
        return;
      }

      // Create a combined "semester" object for the report generators
      const combinedData = {
        title: "All_Communities",
        sections: allSections,
      };

      // Generate the selected report
      const today = new Date().toISOString().split("T")[0];

      switch (selectedReport) {
        case "attendance": {
          const csvContent = generateDetailedCSV(combinedData, dateRange);
          downloadCSV(
            csvContent,
            `all_communities_attendance_report_${today}.csv`,
          );
          break;
        }
        case "studentAttendance": {
          const csvContent = generateStudentAttendanceReportCSV(
            combinedData,
            dateRange,
          );
          downloadCSV(
            csvContent,
            `all_communities_student_attendance_${today}.csv`,
          );
          break;
        }
        case "capacity": {
          const csvContent = generateCapacityReportCSV(combinedData, dateRange);
          downloadCSV(
            csvContent,
            `all_communities_capacity_report_${today}.csv`,
          );
          break;
        }
        case "mvmsHours": {
          // MVMS report uses its own data fetch (Supabase missionaries + hours)
          // so we skip the class-based allSections logic and handle it here
          break;
        }
        default:
          break;
      }
    } catch (err) {
      console.error("Error generating report:", err);
      setError("Failed to generate report. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  if (userLoading || !communitiesLoaded) {
    return <Loading />;
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom fontWeight="bold">
          Admin Reports
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Generate comprehensive reports across all cities and communities.
        </Typography>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Community Selection */}
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, height: "100%" }}>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 2,
              }}
            >
              <Typography variant="h6">Select Communities</Typography>
              <Button
                size="small"
                onClick={handleSelectAll}
                startIcon={
                  selectedCommunities.length === communities.length ? (
                    <CheckBox />
                  ) : (
                    <CheckBoxOutlineBlank />
                  )
                }
              >
                {selectedCommunities.length === communities.length
                  ? "Deselect All"
                  : "Select All"}
              </Button>
            </Box>
            <Divider sx={{ mb: 2 }} />

            <Box sx={{ maxHeight: 400, overflow: "auto" }}>
              {Object.entries(communitiesByCity).map(
                ([cityName, cityCommunities]) => {
                  const cityIds = cityCommunities.map((c) => c._id || c.id);
                  const allCitySelected = cityIds.every((id) =>
                    selectedCommunities.includes(id),
                  );
                  const someCitySelected = cityIds.some((id) =>
                    selectedCommunities.includes(id),
                  );

                  return (
                    <Accordion
                      key={cityName}
                      defaultExpanded={false}
                      sx={{ mb: 1 }}
                    >
                      <AccordionSummary expandIcon={<ExpandMore />}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            width: "100%",
                          }}
                        >
                          <Checkbox
                            checked={allCitySelected}
                            indeterminate={someCitySelected && !allCitySelected}
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelectCity(cityName);
                            }}
                            size="small"
                          />
                          <Typography fontWeight="medium">
                            {cityName}
                          </Typography>
                          <Chip
                            label={`${cityIds.filter((id) => selectedCommunities.includes(id)).length}/${cityCommunities.length}`}
                            size="small"
                            color={allCitySelected ? "primary" : "default"}
                            sx={{ ml: "auto", mr: 1 }}
                          />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails sx={{ pt: 0 }}>
                        {cityCommunities.map((community) => {
                          const id = community._id || community.id;
                          return (
                            <FormControlLabel
                              key={id}
                              control={
                                <Checkbox
                                  checked={selectedCommunities.includes(id)}
                                  onChange={() => handleCommunityToggle(id)}
                                  size="small"
                                />
                              }
                              label={community.name}
                              sx={{ display: "block", ml: 2 }}
                            />
                          );
                        })}
                      </AccordionDetails>
                    </Accordion>
                  );
                },
              )}
            </Box>

            <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
              <Typography variant="body2" color="text.secondary">
                {selectedCommunities.length} of {communities.length} communities
                selected
              </Typography>
            </Box>
          </Paper>
        </Grid>

        {/* Report Selection */}
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Select Report Type
            </Typography>
            <Divider sx={{ mb: 2 }} />

            <RadioGroup
              value={selectedReport}
              onChange={(e) => setSelectedReport(e.target.value)}
            >
              <Grid container spacing={2}>
                {/* Attendance Report */}
                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      border: selectedReport === "attendance" ? 2 : 1,
                      borderColor:
                        selectedReport === "attendance"
                          ? "primary.main"
                          : "divider",
                      cursor: "pointer",
                      "&:hover": { borderColor: "primary.main", boxShadow: 1 },
                    }}
                    onClick={() => setSelectedReport("attendance")}
                  >
                    <FormControlLabel
                      value="attendance"
                      control={<Radio color="primary" />}
                      label={
                        <Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <School color="primary" />
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              color="primary"
                            >
                              Attendance Report
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            Comprehensive report showing attendance statistics
                            for each class across all selected communities.
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: "flex-start", m: 0 }}
                    />
                  </Paper>
                </Grid>

                {/* Student Attendance Report */}
                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      border: selectedReport === "studentAttendance" ? 2 : 1,
                      borderColor:
                        selectedReport === "studentAttendance"
                          ? "primary.main"
                          : "divider",
                      cursor: "pointer",
                      "&:hover": { borderColor: "primary.main", boxShadow: 1 },
                    }}
                    onClick={() => setSelectedReport("studentAttendance")}
                  >
                    <FormControlLabel
                      value="studentAttendance"
                      control={<Radio color="primary" />}
                      label={
                        <Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <AssignmentInd color="primary" />
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              color="primary"
                            >
                              Student Attendance Report
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            Detailed list of all students with their individual
                            attendance records for each class session.
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: "flex-start", m: 0 }}
                    />
                  </Paper>
                </Grid>

                {/* Capacity Report */}
                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      border: selectedReport === "capacity" ? 2 : 1,
                      borderColor:
                        selectedReport === "capacity"
                          ? "primary.main"
                          : "divider",
                      cursor: "pointer",
                      "&:hover": { borderColor: "primary.main", boxShadow: 1 },
                    }}
                    onClick={() => setSelectedReport("capacity")}
                  >
                    <FormControlLabel
                      value="capacity"
                      control={<Radio color="primary" />}
                      label={
                        <Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Group color="primary" />
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              color="primary"
                            >
                              CRC Capacity Report
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            Daily attendance breakdown across all classes
                            showing student counts by day.
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: "flex-start", m: 0 }}
                    />
                  </Paper>
                </Grid>

                {/* MVMS Hours Report */}
                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      border: selectedReport === "mvmsHours" ? 2 : 1,
                      borderColor:
                        selectedReport === "mvmsHours"
                          ? "primary.main"
                          : "divider",
                      cursor: "pointer",
                      "&:hover": { borderColor: "primary.main", boxShadow: 1 },
                    }}
                    onClick={() => setSelectedReport("mvmsHours")}
                  >
                    <FormControlLabel
                      value="mvmsHours"
                      control={<Radio color="primary" />}
                      label={
                        <Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <AccessTime color="primary" />
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              color="primary"
                            >
                              MVMS Hours Report
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            Missionary & volunteer hours summary by community
                            and city, including logging rates and averages.
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: "flex-start", m: 0 }}
                    />
                  </Paper>
                </Grid>

                {/* Days of Service Report */}
                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      border: selectedReport === "daysOfService" ? 2 : 1,
                      borderColor:
                        selectedReport === "daysOfService"
                          ? "primary.main"
                          : "divider",
                      cursor: "pointer",
                      "&:hover": { borderColor: "primary.main", boxShadow: 1 },
                    }}
                    onClick={() => setSelectedReport("daysOfService")}
                  >
                    <FormControlLabel
                      value="daysOfService"
                      control={<Radio color="primary" />}
                      label={
                        <Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <VolunteerActivism color="primary" />
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              color="primary"
                            >
                              Days of Service Report
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            All Day of Service projects across selected
                            communities, including partner organizations,
                            resource couples, volunteer counts, and project
                            details.
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: "flex-start", m: 0 }}
                    />
                  </Paper>
                </Grid>

                {/* MyHometown Overview Report */}
                <Grid item xs={12}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      border: selectedReport === "overview" ? 2 : 1,
                      borderColor:
                        selectedReport === "overview"
                          ? "primary.main"
                          : "divider",
                      cursor: "pointer",
                      "&:hover": { borderColor: "primary.main", boxShadow: 1 },
                    }}
                    onClick={() => setSelectedReport("overview")}
                  >
                    <FormControlLabel
                      value="overview"
                      control={<Radio color="primary" />}
                      label={
                        <Box>
                          <Box display="flex" alignItems="center" gap={1}>
                            <Dashboard color="primary" />
                            <Typography
                              variant="subtitle1"
                              fontWeight="bold"
                              color="primary"
                            >
                              MyHometown Overview Report
                            </Typography>
                          </Box>
                          <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{ mt: 0.5 }}
                          >
                            Comprehensive overview including service hours by
                            category, CRC classes, DOS community stats, and
                            total volunteer counts.
                          </Typography>
                        </Box>
                      }
                      sx={{ alignItems: "flex-start", m: 0 }}
                    />
                  </Paper>
                </Grid>
              </Grid>
            </RadioGroup>

            <Divider sx={{ my: 3 }} />

            {/* Date Range Section */}
            <Typography variant="h6" gutterBottom>
              Date Range
            </Typography>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Start Date"
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    setDateError("");
                  }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{ min: "2026-01-01", max: endDate || todayStr }}
                  fullWidth
                  helperText="Earliest: Jan 1, 2026"
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="End Date"
                  type="date"
                  value={endDate}
                  onChange={(e) => {
                    setEndDate(e.target.value);
                    setDateError("");
                  }}
                  InputLabelProps={{ shrink: true }}
                  inputProps={{
                    max: todayStr,
                    min: startDate || undefined,
                  }}
                  fullWidth
                  helperText="Cannot be in the future"
                />
              </Grid>
              {dateError && (
                <Grid item xs={12}>
                  <Alert severity="error">{dateError}</Alert>
                </Grid>
              )}
            </Grid>

            <Divider sx={{ my: 3 }} />

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={
                  generating ? (
                    <CircularProgress size={20} color="inherit" />
                  ) : (
                    <FileDownload />
                  )
                }
                onClick={handleGenerateReport}
                disabled={generating || selectedCommunities.length === 0}
              >
                {generating ? "Generating..." : "Download Report"}
              </Button>
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminReportsPage;
