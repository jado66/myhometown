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
} from "@mui/material";
import { Lock, LockOpen } from "@mui/icons-material";
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

const CommunitySelectionPage = ({ params }) => {
  const router = useRouter();
  const communityId = params.communityId;
  const [community, setCommunity] = useState(null);
  const [daysOfService, setDaysOfService] = useState([]);
  const [showServiceDayDialog, setShowServiceDayDialog] = useState(false);
  const [selectedServiceDay, setSelectedServiceDay] = useState(null);
  const [selectedDayId, setSelectedDayId] = useState(null);
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

  const { generateStakeSummaryReport } = useDaysOfServiceProjects();

  useEffect(() => {
    const authenticated = isAuthenticatedBudget();
    setIsAuthenticated(authenticated);
  }, []);

  useEffect(() => {
    if (!communityId) return;

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
      "/"
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
    dayOfService
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
      <DosBreadcrumbs communityData={community} />
      <Typography
        variant="h3"
        gutterBottom
        sx={{
          textTransform: "capitalize",
          mb: 0,
          textAlign: "center",
        }}
      >
        Organization Summary Page
      </Typography>
      <Box sx={{ position: "relative" }}>
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            textTransform: "capitalize",
            mb: 2,
            textAlign: "center",
          }}
        >
          {community.city_name} - {community.name} Days of Service
        </Typography>

        <Divider sx={{ mb: 2 }} />

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
          <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 2 }}>
            <Tabs
              value={activeTab}
              onChange={handleTabChange}
              aria-label="community sections"
              variant="fullWidth"
              sx={{
                "& .MuiTab-root": {
                  fontSize: { xs: "0.875rem", sm: "1rem" },
                  fontWeight: "bold",
                },
              }}
            >
              <Tab label="Days of Service and Organizations" />
              <Tab label="Days of Service Volunteers" />
            </Tabs>
          </Box>

          {/* Tab 1: Days of Service and Organizations */}
          <Box role="tabpanel" hidden={activeTab !== 0}>
            {activeTab === 0 && (
              <>
                <Box
                  sx={{
                    mb: 4,
                    display: "flex",
                    flexWrap: "wrap",
                    gap: 2,
                    justifyContent: "center",
                  }}
                >
                  {daysOfService.length > 0 ? (
                    <>
                      <Typography
                        variant="subtitle1"
                        sx={{ width: "100%", textAlign: "center", mb: 1 }}
                      >
                        Jump to a specific Day of Service:
                      </Typography>
                      {daysOfService
                        .sort(
                          (a, b) => new Date(a.end_date) - new Date(b.end_date)
                        )
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
                            {
                              // Format the date
                              new Date(day.end_date).toLocaleDateString(
                                "en-US",
                                {
                                  month: "short",
                                  day: "numeric",
                                }
                              )
                            }
                          </Button>
                        ))}
                    </>
                  ) : null}
                </Box>
                {daysOfService.length === 0 && (
                  <Typography
                    variant="h6"
                    color="primary"
                    gutterBottom
                    sx={{ mb: 5 }}
                  >
                    No Days of Service have been created yet. Please create a
                    new Day of Service to get started.
                  </Typography>
                )}
                {daysOfService
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
                      />
                    </Box>
                  ))}

                {daysOfService.length !== 0 && (
                  <Divider sx={{ my: 3, width: "100%" }} />
                )}

                <Button
                  variant="contained"
                  color="primary"
                  sx={{ mt: 4, mx: "auto", display: "block" }}
                  onClick={handleCreateNewDay}
                >
                  Create New Day Of Service
                </Button>
              </>
            )}
          </Box>

          {/* Tab 2: Days of Service Volunteers */}
          <Box role="tabpanel" hidden={activeTab !== 1}>
            {activeTab === 1 && (
              <>
                <VolunteerSignups communityId={communityId} />
              </>
            )}
          </Box>
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
          cityId={community?.city_id}
          communityId={community?.id}
          initialData={selectedServiceDay}
          fetchDays={fetchDays}
          handleDeleteDay={handleDeleteDay}
          dayOfServicePrefix={community.name}
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
