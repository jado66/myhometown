"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Button,
  IconButton,
  Divider,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  ExpandMore,
  Edit,
  EditCalendar,
  Lock,
  Visibility,
  VisibilityOff,
  LockOpen,
  LocationOn,
  Assignment,
} from "@mui/icons-material";
import moment from "moment";
import { useCommunities } from "@/hooks/use-communities";
import { useDaysOfService } from "@/hooks/useDaysOfService";
import Loading from "@/components/util/Loading";
import DosBreadcrumbs from "@/components/days-of-service/DosBreadcrumbs";
import ServiceDayDialog from "./ServiceDayDialog";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import {
  authenticateBudgetAccess,
  isAuthenticatedBudget,
} from "@/util/auth/simpleAuth";
import AskYesNoDialog from "@/components/util/AskYesNoDialog";
import JsonViewer from "@/components/util/debug/DebugOutput";
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

  const { fetchProjectsByDaysOfStakeId, generateStakeSummaryReport } =
    useDaysOfServiceProjects();

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
          mb: 4,
          textAlign: { xs: "center", sm: "left" },
        }}
      >
        Organization Summary Page
      </Typography>

      <Box sx={{ position: "relative" }}>
        <Typography
          variant="h4"
          gutterBottom
          sx={{
            textTransform: "capitalize",
            mb: 2,
            textAlign: { xs: "center", sm: "left" },
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
        <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 5 }}>
          {daysOfService.length === 0 &&
            "No Days of Service have been created yet. Please create a new Day of Service to get started."}
        </Typography>

        {/* <JsonViewer data={daysOfService} /> */}

        {daysOfService
          .sort((a, b) => new Date(a.end_date) - new Date(b.end_date))
          .map((day, index) => (
            <Card
              key={day.id}
              sx={{
                backgroundColor: "grey.50",
                mb: 4,
                p: {
                  xs: 2,
                  sm: 4,
                },
              }}
              variant="outlined"
            >
              <Box key={day.id} sx={{ mb: 2 }}>
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2,
                  }}
                >
                  {isSmallScreen ? (
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        flexDirection: "column",
                        flexGrow: 1,
                      }}
                    >
                      <Typography variant="h5" color="primary">
                        {day.name || "Day of Service"}
                      </Typography>
                      <Typography variant="subtitle" color="primary">
                        {moment(day.end_date).format("ddd, MM/DD/yy")}
                      </Typography>
                    </Box>
                  ) : (
                    <Box sx={{ display: "flex", flexDirection: "column" }}>
                      <Typography variant="h5" color="primary">
                        {community.name} {day.name || "Day of Service"} -{" "}
                        {moment(day.end_date).format("dddd, MMMM Do, YYYY")}
                      </Typography>
                      {day.check_in_location && (
                        <Typography
                          variant="h6"
                          gutterBottom
                          sx={{
                            display: "flex",
                            alignItems: "center",
                            textTransform: "capitalize",
                            mb: 4,
                            textAlign: { xs: "center", sm: "left" },
                          }}
                        >
                          <LocationOn sx={{ mr: 1 }} />
                          Check-in Location: {day.check_in_location}
                        </Typography>
                      )}
                    </Box>
                  )}

                  <Button
                    onClick={() => handleEditDay(day)}
                    sx={{
                      bgcolor: "primary.main",
                      color: "white",
                      "&:hover": { bgcolor: "primary.dark" },
                      ml: 2,
                      px: 1,
                    }}
                  >
                    <EditCalendar sx={{ mr: 1 }} />
                    {isSmallScreen ? "Edit" : "Edit Day of Service"}
                  </Button>
                </Box>

                <Divider sx={{ mb: 2, mx: 1 }} />

                <Typography variant="h6" gutterBottom sx={{ my: 2, ml: 2 }}>
                  {day.partner_stakes.length === 0
                    ? "Please add a Partner Organization to this day of service"
                    : "Manage the projects for your Partner Organizations"}
                </Typography>
                <Grid
                  container
                  columnSpacing={{
                    xs: 1,
                    md: 3,
                  }}
                  rowSpacing={2}
                  sx={{ ml: 0 }}
                >
                  {day.partner_stakes.map((stake) => (
                    <Grid item xs={12} sm={6} key={stake.id}>
                      <Card
                        sx={{
                          cursor: "pointer",
                          "&:hover": { boxShadow: 6 },
                          position: "relative",
                        }}
                        variant="outlined"
                        onClick={() => handlePartnerStakeClick(day, stake)}
                      >
                        <Box
                          sx={{
                            display: "flex",
                            justifyContent: "space-between",
                            gap: 2,

                            position: "absolute",
                            top: 8,
                            right: 8,
                            color: "primary.main",
                          }}
                        >
                          <Button
                            variant="outlined"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleGenerateDayOfServiceReport(
                                stake.id,
                                day.end_date,
                                day
                              );
                            }}
                            sx={{
                              color: "primary.main",
                            }}
                          >
                            <Assignment sx={{ mr: 1 }} />
                            Print
                          </Button>
                          <IconButton
                            onClick={(e) => {
                              e.stopPropagation();
                              handleEditStake(day.id, stake);
                            }}
                            sx={{
                              color: "primary.main",
                            }}
                          >
                            <Edit />
                          </IconButton>
                        </Box>
                        <CardContent>
                          {/* <Typography variant="h6">ID: {stake.id}</Typography> */}
                          <Typography variant="h6" sx={{ ml: 2 }}>
                            {stake.name}
                          </Typography>
                          <Divider sx={{ my: 2 }} />
                          <Accordion
                            square
                            elevation={0}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <AccordionSummary
                              expandIcon={<ExpandMore />}
                              sx={{
                                px: 1,
                                py: 1,
                                "& .Mui-expanded": {
                                  my: 0,
                                },
                                "& .MuiAccordionSummary-content": {
                                  margin: 0,
                                },
                              }}
                            >
                              <Grid item xs={7}>
                                <Button
                                  variant="outlined"
                                  color="primary"
                                  sx={{ mt: 1 }}
                                  onClick={(e) => {
                                    handlePartnerStakeClick(day, stake);
                                    e.stopPropagation();
                                  }}
                                >
                                  {isSmallScreen ? "Projects" : "View Projects"}
                                </Button>
                              </Grid>
                              <Typography
                                variant="h6"
                                sx={{ fontSize: "16px !important;", ml: 1 }}
                              >
                                Organization Liaison Information
                              </Typography>
                            </AccordionSummary>
                            <AccordionDetails
                              sx={{
                                px: 2,
                                pt: 2,
                                pb: 1,
                                flexDirection: "column",
                              }}
                            >
                              <Grid container spacing={2}>
                                {/* Left column - First liaison */}
                                <Grid item xs={12} lg={6}>
                                  {stake.liaison_name_1 && (
                                    <Typography variant="h6" gutterBottom>
                                      {stake.liaison_name_1}
                                    </Typography>
                                  )}
                                  {stake.partner_stake_liaison_title_1 && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Title:{" "}
                                      {stake.partner_stake_liaison_title_1}
                                    </Typography>
                                  )}
                                  {stake.liaison_email_1 && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Email: {stake.liaison_email_1}
                                    </Typography>
                                  )}
                                  {stake.liaison_phone_1 && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Phone: {stake.liaison_phone_1}
                                    </Typography>
                                  )}
                                </Grid>

                                {/* Right column - Second liaison */}
                                <Grid item xs={12} lg={6}>
                                  {stake.liaison_name_2 && (
                                    <Typography variant="h6" gutterBottom>
                                      {stake.liaison_name_2}
                                    </Typography>
                                  )}
                                  {stake.partner_stake_liaison_title_2 && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Title:{" "}
                                      {stake.partner_stake_liaison_title_2}
                                    </Typography>
                                  )}
                                  {stake.liaison_email_2 && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Email: {stake.liaison_email_2}
                                    </Typography>
                                  )}
                                  {stake.liaison_phone_2 && (
                                    <Typography
                                      variant="body2"
                                      color="text.secondary"
                                    >
                                      Phone: {stake.liaison_phone_2}
                                    </Typography>
                                  )}
                                </Grid>
                              </Grid>

                              {/* Show message if no details */}
                              {!stake.liaison_name_1 &&
                                !stake.liaison_name_2 && (
                                  <Typography
                                    variant="body2"
                                    color="text.secondary"
                                  >
                                    No contact information details available.
                                    Please click edit to add details.
                                  </Typography>
                                )}
                            </AccordionDetails>
                          </Accordion>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>

                <Button
                  variant="contained"
                  color="secondary"
                  sx={{ mt: 4, ml: 2 }}
                  onClick={() => handleOpenAddStakeDialog(day.id)}
                >
                  Add Partner Organization
                </Button>
              </Box>
            </Card>
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
      <Dialog
        open={showStakeDialog}
        onClose={handleCloseStakeDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {currentStake.id
            ? `Edit Stake: ${currentStake.name}`
            : "Add New Stake"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={2} alignItems="stretch">
              {/* Left Column */}
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Organization Name"
                  fullWidth
                  value={currentStake.name}
                  onChange={(e) =>
                    setCurrentStake({ ...currentStake, name: e.target.value })
                  }
                  required
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  autoFocus
                  margin="dense"
                  label="Estimated Number of Projects"
                  fullWidth
                  type="number"
                  value={currentStake.number_of_projects}
                  onChange={(e) =>
                    setCurrentStake({
                      ...currentStake,
                      number_of_projects: e.target.value,
                    })
                  }
                  required
                />
              </Grid>

              <Divider sx={{ my: 2, width: "100%" }} />

              <Grid
                item
                xs={12}
                sm={0.4}
                sx={{ display: { sm: "none", xs: "block" } }}
              >
                <Divider
                  flexItem
                  sx={{
                    height: "100%",
                    bgcolor: "grey.400",
                  }}
                />
              </Grid>

              <Grid item xs={12} sm={5.8}>
                <TextField
                  margin="dense"
                  label="Liaison Name 1"
                  fullWidth
                  value={currentStake.liaison_name_1}
                  onChange={(e) =>
                    setCurrentStake({
                      ...currentStake,
                      liaison_name_1: e.target.value,
                    })
                  }
                />
                <TextField
                  margin="dense"
                  label="Liaison Title 1"
                  key="liaison_title_1"
                  fullWidth
                  value={currentStake.partner_stake_liaison_title_1}
                  onChange={(e) =>
                    setCurrentStake({
                      ...currentStake,
                      partner_stake_liaison_title_1: e.target.value,
                    })
                  }
                />

                <TextField
                  margin="dense"
                  label="Liaison Email 1"
                  fullWidth
                  value={currentStake.liaison_email_1}
                  onChange={(e) =>
                    setCurrentStake({
                      ...currentStake,
                      liaison_email_1: e.target.value,
                    })
                  }
                />
                <TextField
                  margin="dense"
                  label="Liaison Phone 1"
                  fullWidth
                  value={currentStake.liaison_phone_1}
                  onChange={(e) =>
                    setCurrentStake({
                      ...currentStake,
                      liaison_phone_1: e.target.value,
                    })
                  }
                />
              </Grid>

              {/* Vertical Divider */}
              <Grid
                item
                xs={12}
                sm={0.4}
                sx={{ display: { xs: "none", sm: "block" } }}
              >
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{
                    height: "100%",
                    bgcolor: "grey.400",
                    width: "1px",
                  }}
                />
              </Grid>

              <Grid
                item
                xs={12}
                sm={0.4}
                sx={{ display: { sm: "none", xs: "block" } }}
              >
                <Divider
                  flexItem
                  sx={{
                    height: "100%",
                    bgcolor: "grey.400",
                  }}
                />
              </Grid>

              {/* Right Column */}
              <Grid item xs={12} sm={5.8}>
                <TextField
                  margin="dense"
                  label="Liaison Name 2 (Optional)"
                  fullWidth
                  value={currentStake.liaison_name_2}
                  onChange={(e) =>
                    setCurrentStake({
                      ...currentStake,
                      liaison_name_2: e.target.value,
                    })
                  }
                />
                <TextField
                  margin="dense"
                  label="Liaison Title 2 (Optional)"
                  key="liaison_title_2"
                  fullWidth
                  value={currentStake.partner_stake_liaison_title_2}
                  onChange={(e) =>
                    setCurrentStake({
                      ...currentStake,
                      partner_stake_liaison_title_2: e.target.value,
                    })
                  }
                />
                <TextField
                  margin="dense"
                  label="Liaison Email 2 (Optional)"
                  fullWidth
                  value={currentStake.liaison_email_2}
                  onChange={(e) =>
                    setCurrentStake({
                      ...currentStake,
                      liaison_email_2: e.target.value,
                    })
                  }
                />
                <TextField
                  margin="dense"
                  label="Liaison Phone 2 (Optional)"
                  fullWidth
                  value={currentStake.liaison_phone_2}
                  onChange={(e) =>
                    setCurrentStake({
                      ...currentStake,
                      liaison_phone_2: e.target.value,
                    })
                  }
                />
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          {currentStake.id && (
            <Button
              onClick={handleDeleteStake}
              color="error"
              variant="outlined"
              disabled={isSaving}
            >
              Delete Stake
            </Button>
          )}
          <Box sx={{ flex: "1 1 auto" }} />
          <Button onClick={handleCloseStakeDialog} disabled={isSaving}>
            Cancel
          </Button>
          <Button
            onClick={handleSaveStake}
            variant="contained"
            disabled={!currentStake.name.trim() || isSaving}
          >
            {currentStake.id ? "Update" : "Add"} Stake
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={showSpecialAccessDialog}
        onClose={() => setShowSpecialAccessDialog(false)}
      >
        <DialogTitle>Enter the Budget Access Password</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Password"
            type={showPassword ? "text" : "password"}
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={!!authError}
            helperText={
              authError ||
              "If you need a password please contact your Neighborhood Services Director."
            }
            onKeyPress={(e) => {
              if (e.key === "Enter") {
                handleAuthSubmit();
              }
            }}
            InputProps={{
              endAdornment: (
                <IconButton
                  onClick={() => setShowPassword((prev) => !prev)}
                  edge="end"
                >
                  {
                    // Show/hide password icon
                    showPassword ? <VisibilityOff /> : <Visibility />
                  }
                </IconButton>
              ),

              sx: { pr: 2 },
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setShowSpecialAccessDialog(false);
              setPassword("");
              setAuthError("");
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleAuthSubmit} variant="contained">
            Submit
          </Button>
        </DialogActions>
      </Dialog>

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
  );
};

export default CommunitySelectionPage;
