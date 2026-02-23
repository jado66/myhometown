"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Typography,
  Box,
  Button,
  Divider,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
  Switch,
  FormControlLabel,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import { Assignment, Lock, LockOpen } from "@mui/icons-material";
import { useCommunities } from "@/hooks/use-communities";
import { useDaysOfService } from "@/hooks/useDaysOfService";
import Loading from "@/components/util/Loading";
import DosBreadcrumbs from "@/components/days-of-service/DosBreadcrumbs";
import ServiceDayDialog from "./ServiceDayDialog";
import AddOrganizationDialog from "./AddOrganizationDialog";
import BudgetDialog from "./BudgetDialog";
import VolunteerSignups from "./VolunteerSignups";
import { DayOfServiceCard } from "./DayOfServiceCard";

import {
  authenticateBudgetAccess,
  isAuthenticatedBudget,
} from "@/util/auth/simpleAuth";
import AskYesNoDialog from "@/components/util/AskYesNoDialog";
import { toast } from "react-toastify";
import { useDaysOfServiceProjects } from "@/hooks/useDaysOfServiceProjects";
import moment from "moment";

import UnassignedProjects from "./UnassignedProjects";
import { supabase } from "@/util/supabase";

const CommunitySelectionPage = ({ params }) => {
  const router = useRouter();
  const communityId = params.communityId;
  const [community, setCommunity] = useState(null);
  const [daysOfService, setDaysOfService] = useState([]);
  const [showServiceDayDialog, setShowServiceDayDialog] = useState(false);
  const [selectedServiceDay, setSelectedServiceDay] = useState(null);
  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [stakeToDelete, setStakeToDelete] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  const [showSpecialAccessDialog, setShowSpecialAccessDialog] = useState(false);
  const [password, setPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const [showPriorYears, setShowPriorYears] = useState(false);
  const [selectedDayId, setSelectedDayId] = useState("");

  const currentYear = moment().year();

  const filteredDaysOfService = showPriorYears
    ? daysOfService
    : daysOfService.filter((day) => moment(day.end_date).year() >= currentYear);

  const theme = useTheme();

  const isSmallScreen = useMediaQuery(theme.breakpoints.down("lg"));

  const [currentStake, setCurrentStake] = useState({
    name: "",
    liaison_name_1: "",
    liaison_email_1: "",
    liaison_phone_1: "",
    liaison_name_2: "",
    liaison_email_2: "",
    liaison_phone_2: "",
  });
  const { fetchNewCommunities } = useCommunities();
  const {
    fetchDaysOfServiceByCommunity,
    deleteDayOfService,
    addPartnerToDayOfService,
    updatePartnerStakeInDayOfService,
    removePartnerStakeFromDayOfService,
  } = useDaysOfService();

  const { generateStakeSummaryReport, generateCommunityReportCSV } =
    useDaysOfServiceProjects();

  useEffect(() => {
    const authenticated = isAuthenticatedBudget();
    setIsAuthenticated(authenticated);
  }, []);

  useEffect(() => {
    if (!communityId) return;

    // Skip fetching community if communityId is "dev"
    if (communityId === "dev") {
      setCommunity({
        id: "dev",
        name: "Dev Mode",
        city_name: "Development",
        city_id: null,
      });
      return;
    }

    const fetchCommunity = async () => {
      try {
        const { data, error } = await fetchNewCommunities({
          query: (q) => q.eq("id", communityId),
        });
        if (error) throw error;
        setCommunity(data[0]);
      } catch (error) {
        console.error("Error fetching communities:", error);
      }
    };

    fetchCommunity();
  }, [communityId]);

  const fetchDays = useCallback(async () => {
    try {
      const { data, error } = await fetchDaysOfServiceByCommunity(communityId);
      if (error) throw error;

      // Parse partner_stakes for each day
      const parsedData = data.map((day) => ({
        ...day,
        partner_stakes: Array.isArray(day.partner_stakes)
          ? day.partner_stakes
              .map((stake) => {
                try {
                  return typeof stake === "string" ? JSON.parse(stake) : stake;
                } catch (e) {
                  console.error("Error parsing stake:", stake, e);
                  return null;
                }
              })
              .filter(Boolean) // Remove any null values from parsing errors
          : [], // Set to empty array if partner_stakes is null or undefined
      }));

      setDaysOfService(parsedData);
    } catch (error) {
      console.log(error);
      console.error("Error fetching days of service:", error);
    }
  }, [communityId, fetchDaysOfServiceByCommunity]);

  useEffect(() => {
    if (community?.id) {
      fetchDays();
    }
  }, [community, fetchDays]);

  const handleEditDay = (day) => {
    setSelectedServiceDay(day);
    setShowServiceDayDialog(true);
  };

  const handleCreateNewDay = () => {
    setSelectedServiceDay(null);
    setShowServiceDayDialog(true);
  };

  const handleServiceDayDialogClose = (wasSuccessful) => {
    setShowServiceDayDialog(false);
    setSelectedServiceDay(null);
    if (wasSuccessful && community?.name) {
      fetchDays();
    }
  };

  const toggleLockDayOfService = async (daysOfServiceId, isLocked) => {
    try {
      // Get the Supabase client

      // Start a transaction by using supabase's rpc function
      const { data, error } = await supabase.rpc("toggle_lock_transaction", {
        p_days_of_service_id: daysOfServiceId,
        p_is_locked: isLocked,
      });

      if (error) {
        console.error("Error toggling lock status:", error);
        return { success: false, error: error.message };
      }

      setDaysOfService((prevDays) =>
        prevDays.map((day) =>
          day.id === daysOfServiceId ? { ...day, is_locked: isLocked } : day,
        ),
      );

      toast.success("Day of Service has been locked. ");
    } catch (error) {
      console.error("Unexpected error in toggleLock:", error);
      toast.error(
        error instanceof Error ? error.message : "Unknown error occurred",
      );
    }
  };

  const handleDeleteDay = async (id) => {
    try {
      await deleteDayOfService(id);
      setDaysOfService((prev) => prev.filter((day) => day.id !== id));
    } catch (error) {
      console.error("Error deleting day of service:", error);
    }
  };

  const handleAuthSubmit = () => {
    const isAuthenticated = authenticateBudgetAccess(password);

    if (isAuthenticated) {
      setShowSpecialAccessDialog(false);
      setPassword("");
      setAuthError("");
      toast.success("Access granted. You can now view the budget estimates.");
      setIsAuthenticated(true);
    } else {
      setAuthError("Invalid password. Please try again.");
    }
  };

  const handlePartnerStakeClick = (day, stake) => {
    const url = `${
      process.env.NEXT_PUBLIC_DOMAIN
    }/admin-dashboard/days-of-service/${day.short_id.replaceAll(
      "_",
      "/",
    )}/stake/${stake.id}`;

    // alert(url);

    // return;
    router.push(url);
  };

  const handleEditStake = (dayId, stake) => {
    setSelectedDayId(dayId);
    setCurrentStake(stake);
    setShowStakeDialog(true);
  };

  const handleOpenAddStakeDialog = (dayId) => {
    setSelectedDayId(dayId);
    setCurrentStake({
      name: "",
      liaison_name_1: "",
      liaison_email_1: "",
      liaison_phone_1: "",
      liaison_name_2: "",
      liaison_email_2: "",
      liaison_phone_2: "",
    });
    setShowStakeDialog(true);
  };

  const handleCloseStakeDialog = () => {
    setShowStakeDialog(false);
    setSelectedDayId(null);
    setCurrentStake({
      name: "",
      liaison_name_1: "",
      liaison_email_1: "",
      liaison_phone_1: "",
      liaison_name_2: "",
      liaison_email_2: "",
      liaison_phone_2: "",
    });
  };

  const handleSaveStake = async () => {
    if (!currentStake.name.trim() || !selectedDayId) return;

    setIsSaving(true);

    try {
      if (currentStake.id) {
        // Update existing stake using the hook
        await updatePartnerStakeInDayOfService(selectedDayId, currentStake);
      } else {
        // Add new stake
        await addPartnerToDayOfService(selectedDayId, "stake", currentStake);
      }
      await fetchDays();
      handleCloseStakeDialog();
      setIsSaving(false);
    } catch (error) {
      console.error("Error saving stake:", error);
      toast.error("Error saving stake:" + error);
      setIsSaving(false);
    }
  };

  const handleDeleteStake = () => {
    setStakeToDelete(currentStake);
    setShowDeleteDialog(true);
  };

  const confirmDeleteStake = async () => {
    if (!selectedDayId || !stakeToDelete) return;

    setIsSaving(true);

    try {
      await removePartnerStakeFromDayOfService(selectedDayId, stakeToDelete.id);
      await fetchDays();
      setShowDeleteDialog(false);
      setStakeToDelete(null);
      setShowStakeDialog(false);
      setIsSaving(false);
    } catch (error) {
      console.error("Error deleting stake:", error);
      toast.error("Error deleting stake:" + error);
      setIsSaving(false);
    }
  };

  const handleGenerateDayOfServiceReport = async (
    stakeId,
    date,
    dayOfService,
  ) => {
    if (!dayOfService?.id) {
      toast.error("Day of Service ID not available");
      return;
    }
    try {
      // Get all projects for this stake

      // Use the new function instead
      await generateStakeSummaryReport(stakeId, date, dayOfService);
    } catch (error) {
      console.error("Error generating projects summary:", error);
      toast.error("Failed to generate projects summary");
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const scrollToDay = (dayId) => {
    const element = document.getElementById(`day-of-service-${dayId}`);
    if (element) {
      element.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const generateCommunityReport = async () => {
    // // myHometown {City} - {Community} Days of Service Report
    // const fileName = `${community.city_name} - ${community.name} Days of Service Report`;

    // console.log(fileName);
    // console.log("\n\n");
    // // Generate the report
    // for (const day of daysOfService) {
    //   // Generate the report for each day
    //   console.log(
    //     `${day.name || "Day of Service"} - ${moment(day.end_date).format(
    //       "ddd, MM/DD/yy"
    //     )} - ${day.id}`
    //   );

    //   // Process each stake sequentially
    //   for (const stake of day.partner_stakes) {
    //     // Generate the report for each stake
    //     console.log(`\t${stake.name} - ${stake.id}`);

    //     // Now we can use await here
    //     const projects = await fetchProjectsByDaysOfStakeId(stake.id);
    //     console.log("\t\tOwner, Address, Status, # of Volunteers, # of Hours");

    //     if (projects.length === 0) {
    //       console.log("\t\tNo projects found for this stake.\n\n");
    //       continue;
    //     }

    //     projects.forEach((project) => {
    //       // address_city,address_state,address_street1,address_street2,address_zip_code,
    //       const address = `${project.address_street1}, ${project.address_street2}, ${project.address_city}, ${project.address_state}, ${project.address_zip_code}`;
    //       const status = project.status || "Incomplete";
    //       const volunteers = project.volunteers || "Not yet reported";
    //       const hours = project.hours || "Not yet reported";

    //       console.log(
    //         `\t\t${project.property_owner}, ${address}, ${status}, ${volunteers}, ${hours}\n`
    //       );
    //     });
    //     console.log("\n");
    //   }

    //   console.log("\n\n");
    // }

    generateCommunityReportCSV(community, daysOfService);
  };

  if (!community) {
    return <Loading center />;
  }

  return (
    <Box
      sx={{
        p: {
          xs: 1,
          sm: 4,
        },
        mt: 4,
      }}
    >
      {communityId !== "dev" && <DosBreadcrumbs communityData={community} />}
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          textTransform: "capitalize",
          mb: 0,
          textAlign: "center",
        }}
      >
        Days Of Service Management{communityId === "dev" ? " - Dev Mode" : ""}
      </Typography>
      <Box sx={{ position: "relative" }}>
        <Typography
          variant="h5"
          gutterBottom
          sx={{
            textTransform: "capitalize",
            mb: 2,
            textAlign: "center",
            color: "primary.main",
          }}
        >
          {communityId === "dev"
            ? "Development / Testing Mode"
            : `${community.city_name} - ${community.name}`}
        </Typography>

        {!isSmallScreen && (
          <Box sx={{ position: "absolute", top: 0, right: 0, zIndex: 1 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                if (isAuthenticated) {
                  toast.info("You are already authenticated.");
                  return;
                }
                setShowSpecialAccessDialog(true);
              }}
            >
              {isAuthenticated ? (
                <LockOpen sx={{ mr: 1 }} />
              ) : (
                <Lock sx={{ mr: 1 }} />
              )}
              {isAuthenticated ? "Budget Access Granted" : "Budget Access"}
            </Button>
          </Box>
        )}

        <Box sx={{ width: "100%", mt: 3 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "flex-end",
              justifyContent: "space-between",
            }}
          >
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="community sections"
              sx={{
                borderBottom: "2px solid #e0e0e0",
                flexGrow: 1,
                overflow: "visible",
                "& .MuiTabs-scroller": {
                  overflow: "visible !important",
                },
                "& .MuiTabs-flexContainer": {
                  overflow: "visible",
                },
                "& .MuiTab-root": {
                  fontSize: { xs: "0.9rem", sm: "1.1rem" },
                  fontWeight: 600,
                  minHeight: "64px",
                  py: 2,
                  overflow: "visible",
                  textTransform: "none",
                  borderTopLeftRadius: "8px",
                  borderTopRightRadius: "8px",
                  marginRight: "4px",
                  backgroundColor: "#e8e8e8",
                  color: "#666",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    backgroundColor: "#d8d8d8",
                  },
                  "&.Mui-selected": {
                    backgroundColor: "#fff",
                    color: "primary.main",
                    fontWeight: 700,
                    borderTop: "3px solid",
                    borderTopColor: "primary.main",
                    borderLeft: "1px solid #e0e0e0",
                    borderRight: "1px solid #e0e0e0",
                  },
                },
                "& .MuiTabs-indicator": {
                  display: "none",
                },
              }}
            >
              <Tab label="Project Planning" />
              <Tab label="Unassigned Projects" />
              {communityId !== "dev" && <Tab label="Summary of Projects" />}
              {communityId !== "dev" && (
                <Tab label="Community Volunteer Detail" />
              )}
            </Tabs>
            <Box sx={{ pb: 1, pl: 2, flexShrink: 0 }}>
              <FormControlLabel
                control={
                  <Switch
                    checked={showPriorYears}
                    onChange={(e) => setShowPriorYears(e.target.checked)}
                    size="small"
                  />
                }
                label={
                  <Typography variant="caption">Show prior years</Typography>
                }
              />
            </Box>
          </Box>

          {/* Tab 1: Days of Service and Organizations */}
          <Box role="tabpanel" hidden={activeTab !== 0}>
            {activeTab === 0 && (
              <>
                {daysOfService.length > 0 && (
                  <Box
                    sx={{
                      mb: 4,
                      display: "flex",
                      flexWrap: "wrap",
                      gap: 2,
                      justifyContent: "center",
                    }}
                  >
                    <Box
                      sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        mt: 2,
                        mb: 1,
                      }}
                    >
                      <Typography
                        variant="subtitle1"
                        sx={{ textAlign: "center" }}
                      >
                        Jump to a specific Day of Service:
                      </Typography>
                    </Box>
                    {filteredDaysOfService
                      .sort((a, b) => {
                        const dateA = moment(b.end_date);
                        const dateB = moment(a.end_date);
                        return dateB.isValid() && dateA.isValid()
                          ? dateB.diff(dateA)
                          : 0; // Default to no change if dates are invalid
                      })
                      .map((day) => (
                        <Button
                          key={`nav-${day.id}`}
                          variant="outlined"
                          onClick={() => scrollToDay(day.id)}
                          sx={{
                            borderRadius: "20px",
                            textTransform: "none",
                            minWidth: "auto",
                          }}
                        >
                          {moment(day.end_date).format("MMM DD, YYYY")}
                        </Button>
                      ))}
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleCreateNewDay}
                      sx={{
                        borderRadius: "20px",
                        textTransform: "none",
                        minWidth: "auto",
                      }}
                    >
                      Create New Day Of Service
                    </Button>
                  </Box>
                )}

                {daysOfService.length === 0 && (
                  <Box sx={{ display: "flex", justifyContent: "center", mb: 5 }}>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleCreateNewDay}
                      sx={{ mt: 2 }}
                    >
                      Create New Day Of Service
                    </Button>
                  </Box>
                )}
                {filteredDaysOfService
                  .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
                  .map((day, index) => (
                    <Box key={day.id} id={`day-of-service-${day.id}`}>
                      <DayOfServiceCard
                        day={day}
                        community={community}
                        isSmallScreen={isSmallScreen}
                        handleEditDay={handleEditDay}
                        handleOpenAddStakeDialog={handleOpenAddStakeDialog}
                        handlePartnerStakeClick={handlePartnerStakeClick}
                        handleEditStake={handleEditStake}
                        handleGenerateDayOfServiceReport={
                          handleGenerateDayOfServiceReport
                        }
                        toggleLockDayOfService={toggleLockDayOfService}
                      />
                    </Box>
                  ))}
              </>
            )}
          </Box>

          {/* Tab 2: Unassigned Projects */}
          <Box role="tabpanel" hidden={activeTab !== 1}>
            {activeTab === 1 && (
              <UnassignedProjects
                communityId={communityId === "dev" ? null : communityId}
                cityId={communityId === "dev" ? null : community.city_id}
              />
            )}
          </Box>

          {/* Tab 3: Summary of Projects */}
          {communityId !== "dev" && (
            <Box role="tabpanel" hidden={activeTab !== 2}>
              {activeTab === 2 && (
                <VolunteerSignups
                  params={params}
                  cityName={community.city_name}
                  daysOfService={filteredDaysOfService}
                  generateCommunityReport={generateCommunityReport}
                  view="summary"
                  selectedDayId={selectedDayId || null}
                />
              )}
            </Box>
          )}

          {/* Tab 4: Volunteer Details */}
          {communityId !== "dev" && (
            <Box role="tabpanel" hidden={activeTab !== 3}>
              {activeTab === 3 && (
                <VolunteerSignups
                  params={params}
                  cityName={community.city_name}
                  daysOfService={filteredDaysOfService}
                  generateCommunityReport={generateCommunityReport}
                  view="volunteers"
                  selectedDayId={selectedDayId || null}
                />
              )}
            </Box>
          )}
        </Box>

        {isSmallScreen && (
          <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
            <Button
              variant="outlined"
              color="primary"
              onClick={() => {
                if (isAuthenticated) {
                  toast.info("You are already authenticated.");
                  return;
                }
                setShowSpecialAccessDialog(true);
              }}
            >
              {isAuthenticated ? (
                <LockOpen sx={{ mr: 1 }} />
              ) : (
                <Lock sx={{ mr: 1 }} />
              )}
              {isAuthenticated ? "Budget Access Granted" : "Budget Access"}
            </Button>
          </Box>
        )}

        <ServiceDayDialog
          open={showServiceDayDialog}
          onClose={handleServiceDayDialogClose}
          cityId={communityId === "dev" ? null : community?.city_id}
          communityId={communityId === "dev" ? null : community?.id}
          initialData={selectedServiceDay}
          fetchDays={fetchDays}
          handleDeleteDay={handleDeleteDay}
          dayOfServicePrefix={communityId === "dev" ? "dev" : community.name}
        />
        <AddOrganizationDialog
          open={showStakeDialog}
          onClose={handleCloseStakeDialog}
          currentStake={currentStake}
          setCurrentStake={setCurrentStake}
          isSaving={isSaving}
          handleSaveStake={handleSaveStake}
          handleDeleteStake={handleDeleteStake}
        />
        <BudgetDialog
          open={showSpecialAccessDialog}
          onClose={() => setShowSpecialAccessDialog(false)}
          password={password}
          setPassword={setPassword}
          authError={authError}
          handleAuthSubmit={handleAuthSubmit}
          showPassword={showPassword}
          setShowPassword={setShowPassword}
        />
        <AskYesNoDialog
          open={showDeleteDialog}
          onClose={() => setShowDeleteDialog(false)}
          onConfirm={confirmDeleteStake}
          onCancel={() => {
            setShowDeleteDialog(false);
            setStakeToDelete(null);
            setSelectedDayId(null);
          }}
          title="Delete Partner Organization?"
          description={`Are you sure you want to delete the Stake "${stakeToDelete?.name}"? This action cannot be undone.`}
        />
      </Box>
    </Box>
  );
};

export default CommunitySelectionPage;
