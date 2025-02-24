"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Button,
  IconButton,
  Divider,
} from "@mui/material";
import { useCommunities } from "@/hooks/use-communities";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { FormResponseTable } from "@/components/FormResponseTable";
// FormResponsesDialog.jsx

import moment from "moment";

import { Close, Edit, EditCalendar, Delete } from "@mui/icons-material";
import { useDaysOfService } from "@/hooks/useDaysOfService";
import { useDaysOfServiceProjects } from "@/hooks/useDaysOfServiceProjects";
import Loading from "@/components/util/Loading";
import DosBreadcrumbs from "@/components/days-of-service/DosBreadcrumbs";
import AskYesNoDialog from "@/components/util/AskYesNoDialog";
import { toast } from "react-toastify";

const CityIdToPasswordHash = {
  provo: "Provo6940!",
  orem: "Orem1723!",
  ogden: "Ogden8324!",
  "salt-lake-city": "SLC4676!",
  "west-valley-city": "WVC6961!",
};

const CommunitySelectionPage = ({ params }) => {
  const { fetchNewCommunities } = useCommunities();
  const router = useRouter();
  const [showResponsesDialog, setShowResponsesDialog] = useState(false);
  const [showServiceDayDialog, setShowServiceDayDialog] = useState(false);
  const [selectedServiceDay, setSelectedServiceDay] = useState(null);
  const communityId = params.communityId;
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [community, setCommunity] = useState(null);
  const [daysOfService, setDaysOfService] = useState([]);
  const {
    deleteDayOfService,
    fetchDaysOfServiceByCommunity,
    isLoading,
    error,
  } = useDaysOfService();

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

  const fetchDays = async () => {
    try {
      const { data, error } = await fetchDaysOfServiceByCommunity(communityId);

      if (error) throw error;
      setDaysOfService(data);
    } catch (error) {
      console.error("Error fetching days of service:", error);
    }
  };

  useEffect(() => {
    if (community?.id) {
      fetchDays();
    }
  }, [community]);

  const handleCommunityClick = (community) => {
    setSelectedCommunity(community);
    setShowResponsesDialog(true);
  };

  const handleDeleteDay = async (id) => {
    try {
      await deleteDayOfService(id);
      setDaysOfService((prev) => prev.filter((day) => day.id !== id));
    } catch (error) {
      console.error("Error deleting day of service:", error);
    }

    setSelectedServiceDay(null);
    setShowServiceDayDialog(false);
  };

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
      // Refresh the days of service
      fetchDays();
    }
  };

  const communityVolunteerFormLink = (community) => {
    if (!community || !community.city || !community.name) {
      return "";
    }

    return `${process.env.NEXT_PUBLIC_DOMAIN}/edit/utah/${
      community.city
    }/${community.name.toLowerCase().replaceAll(/\s/g, "-")}/days-of-service`;
  };

  const handleDaysOfServiceCardClick = (day) => {
    router.push(
      process.env.NEXT_PUBLIC_DOMAIN +
        `/admin-dashboard/days-of-service/${day.short_id.replaceAll("_", "/")}`
    );
  };

  if (!community) {
    return <Loading center />;
  }

  return (
    <Box sx={{ p: 4 }}>
      <DosBreadcrumbs communityData={community} />
      <Typography
        variant="h4"
        gutterBottom
        sx={{ textTransform: "capitalize", mb: 5 }}
      >
        {community.city_name} - {community.name} Days of Service
      </Typography>

      <JsonViewer data={community} />

      <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 5 }}>
        Select a Day of Service to view or create projects
      </Typography>

      <Grid container sx={{ mb: 4 }} spacing={3}>
        {daysOfService &&
          daysOfService.map((day) => (
            <Grid
              item
              xs={12}
              md={4}
              key={day.id}
              sx={{
                position: "relative",
              }}
            >
              {/* The Card */}
              <Card
                sx={{
                  cursor: "pointer",
                  "&:hover": {
                    boxShadow: 6,
                  },
                }}
                onClick={() => handleDaysOfServiceCardClick(day)}
              >
                <CardContent>
                  <Typography variant="h6">
                    {day.name || `Day of Service`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {moment(day.end_date).format("dddd, MMMM Do, YYYY")}
                  </Typography>
                </CardContent>
              </Card>

              {/* The Edit Button - outside the Card */}
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  transform: "translate(50%, -50%)",
                  zIndex: 10,
                  bgcolor: "primary.main",
                  borderRadius: "50%",
                  padding: "4px",
                  boxShadow: 2,
                  "&:hover": {
                    bgcolor: "primary.dark",
                  },
                  mt: 3,
                }}
              >
                <IconButton
                  onClick={(e) => {
                    e.stopPropagation();
                    handleEditDay(day);
                  }}
                  size="small"
                  sx={{
                    color: "white",
                    padding: "4px",
                    "&:hover": {
                      bgcolor: "transparent",
                    },
                  }}
                >
                  <EditCalendar fontSize="small" />
                </IconButton>
              </Box>
            </Grid>
          ))}
      </Grid>

      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 4 }}
        onClick={handleCreateNewDay}
      >
        Create New Day Of Service
      </Button>

      <ServiceDayDialog
        open={showServiceDayDialog}
        onClose={handleServiceDayDialogClose}
        cityId={community?.city_id}
        communityId={community?.id}
        initialData={selectedServiceDay}
        fetchDays={fetchDays}
        handleDeleteDay={handleDeleteDay}
      />

      <Divider sx={{ mb: 4, width: "100%" }} />

      <Typography variant="h6" gutterBottom>
        Days Of Service Volunteer Forms
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card
            sx={{
              cursor: community?.volunteerSignUpId ? "pointer" : "default",
              "&:hover": {
                boxShadow: community?.volunteerSignUpId ? 6 : 1,
              },
            }}
          >
            <CardContent>
              <Typography variant="h6">{community?.name} Community</Typography>
              {community?.volunteerSignUpId ? (
                <>
                  <Typography variant="body2" color="text.secondary">
                    Click to view volunteer responses
                  </Typography>
                  <Box
                    onClick={() => handleCommunityClick(community)}
                    sx={{ mt: 2 }}
                  >
                    View Responses
                  </Box>
                </>
              ) : (
                <>
                  <Typography variant="body2" color="text.secondary">
                    No volunteer form found
                  </Typography>
                  <Button
                    href={communityVolunteerFormLink(community)}
                    variant="contained"
                    color="primary"
                    sx={{ mt: 2 }}
                  >
                    Create Volunteer Form
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <FormResponsesDialog
        open={showResponsesDialog}
        onClose={() => setShowResponsesDialog(false)}
        formId={selectedCommunity?.volunteerSignUpId}
        communityName={selectedCommunity?.name}
      />
    </Box>
  );
};

const ServiceDayDialog = ({
  open,
  onClose,
  cityId,
  communityId,
  initialData,
  fetchDays,
  handleDeleteDay,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    start_date: moment().format("YYYY-MM-DD"),
    end_date: moment().format("YYYY-MM-DD"),
    city_id: cityId,
    community_id: communityId,
    partner_stakes: [],
    partner_wards: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteStakeWardDialog, setDeleteStakeWardDialog] = useState({
    open: false,
    type: null, // 'stake' or 'ward'
    value: null,
  });
  const [newStake, setNewStake] = useState({
    id: "",
    name: "",
    liaison_name_1: null,
    liaison_email_1: null,
    liaison_phone_1: null,
    liaison_name_2: null,
    liaison_email_2: null,
    liaison_phone_2: null,
  });

  const { addDayOfService, updateDayOfService, addPartnerToDayOfService } =
    useDaysOfService();
  const { fetchProjectsByDaysOfServiceId } = useDaysOfServiceProjects();

  React.useEffect(() => {
    if (initialData) {
      // Parse partner_stakes if it contains stringified JSON
      const parsedPartnerStakes = (initialData.partner_stakes || []).map(
        (stake) => {
          if (typeof stake === "string") {
            try {
              return JSON.parse(stake);
            } catch (e) {
              console.error("Failed to parse stake:", stake, e);
              return { id: "", name: stake }; // Fallback if parsing fails
            }
          }
          return stake;
        }
      );

      setFormData({
        name: initialData.name || "",
        start_date: moment(initialData.start_date).format("YYYY-MM-DD"),
        end_date: moment(initialData.end_date).format("YYYY-MM-DD"),
        city_id: cityId,
        community_id: communityId,
        partner_stakes: parsedPartnerStakes,
        partner_wards: initialData.partner_wards || [],
      });
    } else {
      setFormData({
        name: "",
        start_date: moment().format("YYYY-MM-DD"),
        end_date: moment().format("YYYY-MM-DD"),
        city_id: cityId,
        community_id: communityId,
        partner_stakes: [],
        partner_wards: [],
      });
    }
  }, [initialData, open, cityId, communityId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (initialData?.id) {
        await updateDayOfService({
          id: initialData.id,
          short_id: initialData.short_id,
          ...formData,
        });
      } else {
        await addDayOfService(formData);
      }
      fetchDays();
      onClose(true);
    } catch (error) {
      console.error("Error saving day of service:", error);
      toast.error("Failed to save day of service");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddStake = async () => {
    if (!newStake.name.trim() || !initialData?.id) return;
    try {
      await addPartnerToDayOfService(initialData.id, "stake", newStake);
      setNewStake({
        id: "",
        name: "",
        liaison_name_1: null,
        liaison_email_1: null,
        liaison_phone_1: null,
        liaison_name_2: null,
        liaison_email_2: null,
        liaison_phone_2: null,
      });
      fetchDays();
    } catch (error) {
      console.error("Error adding stake:", error);
      toast.error("Failed to add stake");
    }
  };

  const handleDeleteStakeOrWard = async (type, value) => {
    const { inUse, projectsUsingIt } = await checkIfStakeOrWardInUse(
      type,
      value
    );

    if (inUse) {
      const projectsList = projectsUsingIt
        .map(
          (project) =>
            `• Project ${project.project_name || "Unnamed"} (ID: ${project.id})`
        )
        .join("\n");
      toast.error(
        <div>
          <p>Cannot delete because it is used by the following project(s):</p>
          <pre style={{ marginTop: "8px", whiteSpace: "pre-wrap" }}>
            {projectsList}
          </pre>
        </div>,
        { autoClose: 8000 }
      );
      setDeleteStakeWardDialog({ open: false, type: null, value: null });
      return;
    }

    const updatedArray =
      type === "stake"
        ? formData.partner_stakes.filter((stake) => stake.id !== value.id)
        : formData.partner_wards.filter((ward) => ward !== value);

    const updateData = {
      id: initialData.id,
      short_id: initialData.short_id,
      [type === "stake" ? "partner_stakes" : "partner_wards"]: updatedArray,
    };

    try {
      setIsLoading(true);
      await updateDayOfService(updateData);
      setFormData((prev) => ({
        ...prev,
        [type === "stake" ? "partner_stakes" : "partner_wards"]: updatedArray,
      }));
      toast.success(
        `"${type === "stake" ? value.name : value}" deleted successfully`
      );
      fetchDays();
    } catch (error) {
      console.error(`Error deleting ${type}:`, error);
      toast.error(
        `Failed to delete "${type === "stake" ? value.name : value}"`
      );
    } finally {
      setIsLoading(false);
      setDeleteStakeWardDialog({ open: false, type: null, value: null });
    }
  };

  const checkIfStakeOrWardInUse = async (type, value) => {
    if (!initialData?.id) return { inUse: false, projectsUsingIt: [] };
    const projects = await fetchProjectsByDaysOfServiceId(initialData.id);
    if (!projects) return { inUse: false, projectsUsingIt: [] };

    const projectsUsingIt = projects.filter((project) => {
      if (type === "stake") {
        return project.partner_stake_id === value.id; // Assuming projects use stake ID
      } else if (type === "ward") {
        return project.partner_ward === value;
      }
      return false;
    });

    return { inUse: projectsUsingIt.length > 0, projectsUsingIt };
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              {initialData ? "Edit Day of Service" : "New Day of Service"}
            </span>
            <IconButton onClick={() => onClose(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
            <TextField
              label="Name (Optional)"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date (Day of Service)"
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            {initialData && (
              <>
                {/* Partner Stakes */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Partner Stakes / Organizations
                  </Typography>
                  {formData.partner_stakes.length > 0 ? (
                    formData.partner_stakes.map((stake) => (
                      <Box key={stake.id || stake.name} sx={{ mb: 2 }}>
                        <Chip
                          label={stake.name}
                          onDelete={() =>
                            setDeleteStakeWardDialog({
                              open: true,
                              type: "stake",
                              value: stake,
                            })
                          }
                          deleteIcon={<Delete />}
                          sx={{ mr: 1 }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          Liaison 1: {stake.liaison_name_1 || "N/A"} (
                          {stake.liaison_email_1 || "N/A"},{" "}
                          {stake.liaison_phone_1 || "N/A"})
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          Liaison 2: {stake.liaison_name_2 || "N/A"} (
                          {stake.liaison_email_2 || "N/A"},{" "}
                          {stake.liaison_phone_2 || "N/A"})
                        </Typography>
                      </Box>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No partner stakes/organizations added yet.
                    </Typography>
                  )}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2">Add New Stake</Typography>
                    <TextField
                      label="Stake Name"
                      value={newStake.name}
                      onChange={(e) =>
                        setNewStake({ ...newStake, name: e.target.value })
                      }
                      fullWidth
                      sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                      <TextField
                        label="Liaison Name 1"
                        value={newStake.liaison_name_1 || ""}
                        onChange={(e) =>
                          setNewStake({
                            ...newStake,
                            liaison_name_1: e.target.value || null,
                          })
                        }
                        size="small"
                      />
                      <TextField
                        label="Email 1"
                        value={newStake.liaison_email_1 || ""}
                        onChange={(e) =>
                          setNewStake({
                            ...newStake,
                            liaison_email_1: e.target.value || null,
                          })
                        }
                        size="small"
                      />
                      <TextField
                        label="Phone 1"
                        value={newStake.liaison_phone_1 || ""}
                        onChange={(e) =>
                          setNewStake({
                            ...newStake,
                            liaison_phone_1: e.target.value || null,
                          })
                        }
                        size="small"
                      />
                    </Box>
                    <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
                      <TextField
                        label="Liaison Name 2"
                        value={newStake.liaison_name_2 || ""}
                        onChange={(e) =>
                          setNewStake({
                            ...newStake,
                            liaison_name_2: e.target.value || null,
                          })
                        }
                        size="small"
                      />
                      <TextField
                        label="Email 2"
                        value={newStake.liaison_email_2 || ""}
                        onChange={(e) =>
                          setNewStake({
                            ...newStake,
                            liaison_email_2: e.target.value || null,
                          })
                        }
                        size="small"
                      />
                      <TextField
                        label="Phone 2"
                        value={newStake.liaison_phone_2 || ""}
                        onChange={(e) =>
                          setNewStake({
                            ...newStake,
                            liaison_phone_2: e.target.value || null,
                          })
                        }
                        size="small"
                      />
                    </Box>
                    <Button
                      onClick={handleAddStake}
                      variant="contained"
                      size="small"
                    >
                      Add Stake
                    </Button>
                  </Box>
                </Box>

                {/* Partner Wards */}
                <Box>
                  <Typography variant="subtitle1" gutterBottom>
                    Partner Wards / Groups
                  </Typography>
                  {formData.partner_wards.length > 0 ? (
                    formData.partner_wards.map((ward) => (
                      <Chip
                        key={ward}
                        label={ward}
                        onDelete={() =>
                          setDeleteStakeWardDialog({
                            open: true,
                            type: "ward",
                            value: ward,
                          })
                        }
                        deleteIcon={<Delete />}
                        sx={{ mr: 1, mb: 1 }}
                      />
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      No partner wards/groups added yet.
                    </Typography>
                  )}
                </Box>

                <Divider sx={{ my: 2 }} />
                <Box
                  sx={{ typography: "body2", color: "text.secondary", mt: 2 }}
                >
                  <Box component="p" sx={{ mb: 1 }}>
                    Created:{" "}
                    {moment(initialData.created_at).format(
                      "MMMM D, YYYY h:mm A"
                    )}
                  </Box>
                  <Box component="p">
                    Last Updated:{" "}
                    {moment(initialData.updated_at).format(
                      "MMMM D, YYYY h:mm A"
                    )}
                  </Box>
                </Box>
              </>
            )}
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {initialData && (
            <Button
              onClick={() => setShowDeleteDialog(true)}
              color="error"
              disabled={isLoading}
              variant="outlined"
            >
              Delete Day
            </Button>
          )}
          <Box sx={{ flex: "1 1 auto" }} />
          <Button onClick={() => onClose(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading || !formData.start_date || !formData.end_date}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </form>

      <AskYesNoDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete Day of Service?"
        description="Are you sure you want to delete this day of service? This will also delete all projects associated with this day. This action cannot be undone."
        onConfirm={() => {
          handleDeleteDay(initialData?.id);
          setShowDeleteDialog(false);
        }}
      />

      <AskYesNoDialog
        open={deleteStakeWardDialog.open}
        onClose={() =>
          setDeleteStakeWardDialog({ open: false, type: null, value: null })
        }
        title={`Delete ${
          deleteStakeWardDialog.type === "stake" ? "Stake" : "Ward"
        }?`}
        description={`Are you sure you want to delete "${
          deleteStakeWardDialog.type === "stake"
            ? deleteStakeWardDialog.value?.name
            : deleteStakeWardDialog.value
        }" from the ${
          deleteStakeWardDialog.type === "stake"
            ? "partner stakes"
            : "partner wards"
        } list? This action cannot be undone if no projects are using it.`}
        onConfirm={() =>
          handleDeleteStakeOrWard(
            deleteStakeWardDialog.type,
            deleteStakeWardDialog.value
          )
        }
      />
    </Dialog>
  );
};

const FormResponsesDialog = ({ open, onClose, formId, communityName }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {communityName} - Volunteer Responses
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <FormResponseTable formId={formId} />
      </DialogContent>
    </Dialog>
  );
};

export default CommunitySelectionPage;
