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
  Button,
  IconButton,
  Divider,
} from "@mui/material";
import { useCommunities } from "@/hooks/use-communities";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { FormResponseTable } from "@/components/FormResponseTable";
// FormResponsesDialog.jsx

import moment from "moment";

import { Close, Edit, EditCalendar } from "@mui/icons-material";
import { useDaysOfService } from "@/hooks/useDaysOfService";
import Loading from "@/components/util/Loading";
import DosBreadcrumbs from "@/components/days-of-service/DosBreadcrumbs";
import AskYesNoDialog from "@/components/util/AskYesNoDialog";

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
  const [formData, setFormData] = React.useState({
    name: "",
    start_date: moment().format("MM-DD-YYYY"),
    end_date: moment().format("MM-DD-YYYY"),
    city_id: cityId,
    community_id: communityId,
  });

  const [isLoading, setIsLoading] = React.useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false);

  const { addDayOfService, updateDayOfService } = useDaysOfService();

  React.useEffect(() => {
    if (initialData) {
      setFormData((prev) => ({
        ...prev,
        name: initialData.name || "",
        start_date: moment(initialData.start_date).format("YYYY-MM-DD"),
        end_date: moment(initialData.end_date).format("YYYY-MM-DD"),
      }));
    } else {
      setFormData((prev) => ({
        ...prev,
        name: "",
        start_date: null,
        end_date: null,
      }));
    }
  }, [initialData, open]);

  const handleSubmit = async (e) => {
    setIsLoading(true);
    e.preventDefault();
    try {
      if (initialData?.id) {
        await updateDayOfService({
          id: initialData.id,
          ...formData,
        });
        fetchDays();
      } else {
        await addDayOfService({
          ...formData,
        });
        fetchDays();
      }
      onClose();
    } catch (error) {
      console.error("Error saving day of service:", error);
    }
    setIsLoading(false);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
            <IconButton
              onClick={onClose}
              size="small"
              sx={{ width: 24, height: 24 }}
            >
              <Close sx={{ width: 16, height: 16 }} />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              gap: 3,
              pt: 2,
            }}
          >
            <JsonViewer data={formData} />

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
              <Box
                sx={{
                  typography: "body2",
                  color: "text.secondary",
                  mt: 2,
                }}
              >
                <Box component="p" sx={{ mb: 1 }}>
                  Created:{" "}
                  {moment(initialData.created_at).format("MMMM D, YYYY h:mm A")}
                </Box>
                <Box component="p">
                  Last Updated:{" "}
                  {moment(initialData.updated_at).format("MMMM D, YYYY h:mm A")}
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions
          sx={{
            px: 3,
            pb: 3,
          }}
        >
          <Button
            onClick={() => setShowDeleteDialog(true)}
            color="error"
            disabled={isLoading}
            variant="outlined"
          >
            Delete
          </Button>
          <Box sx={{ flex: "1 1 auto" }} />
          <Button onClick={onClose}>Cancel</Button>
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
