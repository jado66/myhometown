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

import { Close } from "@mui/icons-material";
import { useDaysOfService } from "@/hooks/useDaysOfService";

const CityIdToPasswordHash = {
  provo: "Provo6940!",
  orem: "Orem1723!",
  ogden: "Ogden8324!",
  "salt-lake-city": "SLC4676!",
  "west-valley-city": "WVC6961!",
};

const CommunitySelectionPage = ({ params }) => {
  const router = useRouter();
  const [showResponsesDialog, setShowResponsesDialog] = useState(false);
  const cityName = params.city;
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [communities, setCommunities] = useState([]);
  const { fetchCommunitiesByCity } = useCommunities();

  // Add state for days of service
  const [daysOfService, setDaysOfService] = useState([]);
  const { deleteDayOfService, isLoading, error } = useDaysOfService();

  const filteredCommunities = useMemo(() => {
    if (!communities || !Array.isArray(communities)) {
      return [];
    }
    return communities;
  }, [communities]);

  useEffect(() => {
    if (!cityName) return;

    const fetchCommunities = async () => {
      try {
        const data = await fetchCommunitiesByCity(cityName);
        setCommunities(data);
      } catch (error) {
        console.error("Error fetching communities:", error);
        setCommunities([]);
      }
    };

    fetchCommunities();
  }, [cityName]);

  // Fetch days of service when component mounts
  useEffect(() => {
    const fetchDays = async () => {
      try {
        const { data, error } = await supabase
          .from("day_of_service")
          .select("*")
          .eq("city_id", cityName)
          .order("start_date", { ascending: true });

        if (error) throw error;
        setDaysOfService(data);
      } catch (error) {
        console.error("Error fetching days of service:", error);
      }
    };

    if (cityName) {
      fetchDays();
    }
  }, [cityName]);

  const handleCommunityClick = (community) => {
    setSelectedCommunity(community);
    setShowResponsesDialog(true);
  };

  const handleDeleteDay = async (id) => {
    if (
      window.confirm("Are you sure you want to delete this day of service?")
    ) {
      try {
        await deleteDayOfService(id);
        // Remove the deleted day from the state
        setDaysOfService((prev) => prev.filter((day) => day.id !== id));
      } catch (error) {
        console.error("Error deleting day of service:", error);
      }
    }
  };

  const handleEditDay = (id) => {
    router.push(
      process.env.NEXT_PUBLIC_DOMAIN +
        `/admin-dashboard/days-of-service/${cityName}/edit/${id}`
    );
  };

  const communityVolunteerFormLink = (community) => {
    return (
      process.env.NEXT_PUBLIC_DOMAIN +
      `/edit/utah/${cityName}/${community.name
        .toLowerCase()
        .replaceAll(/\s/g, "-")}/days-of-service`
    );
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ textTransform: "capitalize" }}
      >
        {cityName ? `${cityName} Days of Service` : "All Communities"}
      </Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {daysOfService.map((day) => (
          <Grid item xs={12} md={4} key={day.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">
                  {day.name || "Unnamed Service Day"}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {moment(day.start_date).format("MMMM Do, YYYY")}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {moment(day.start_date).format("h:mm A")} -{" "}
                  {moment(day.end_date).format("h:mm A")}
                </Typography>
                <Box sx={{ mt: 2, display: "flex", gap: 1 }}>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleEditDay(day.id)}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => handleDeleteDay(day.id)}
                  >
                    Delete
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Button
        variant="contained"
        color="primary"
        sx={{ mb: 4 }}
        onClick={() => {
          router.push(
            process.env.NEXT_PUBLIC_DOMAIN +
              `/admin-dashboard/days-of-service/${cityName}/new`
          );
        }}
      >
        Create New Day Of Service
      </Button>

      <Divider sx={{ mb: 4, width: "100%" }} />

      <Typography variant="h6" gutterBottom>
        Days Of Service Volunteer Forms
      </Typography>

      <Grid container spacing={3}>
        {filteredCommunities.map((community) => (
          <Grid item xs={12} md={4} key={community._id}>
            <Card
              sx={{
                cursor: community.volunteerSignUpId ? "pointer" : "default",
                "&:hover": {
                  boxShadow: community.volunteerSignUpId ? 6 : 1,
                },
              }}
            >
              <CardContent>
                <Typography variant="h6">{community.name} Community</Typography>
                {community.volunteerSignUpId ? (
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
        ))}
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

export const ServiceDayDialog = ({ open, onClose, cityId, initialData }) => {
  const { addDayOfService, updateDayOfService, isLoading } = useDaysOfService();
  const [formData, setFormData] = React.useState({
    name: "",
    start_date: moment().format("YYYY-MM-DDTHH:mm"),
    end_date: moment().add(2, "hours").format("YYYY-MM-DDTHH:mm"),
  });

  React.useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        start_date: moment(initialData.start_date).format("YYYY-MM-DDTHH:mm"),
        end_date: moment(initialData.end_date).format("YYYY-MM-DDTHH:mm"),
      });
    } else {
      setFormData({
        name: "",
        start_date: moment().format("YYYY-MM-DDTHH:mm"),
        end_date: moment().add(2, "hours").format("YYYY-MM-DDTHH:mm"),
      });
    }
  }, [initialData, open]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (initialData?.id) {
        await updateDayOfService({
          id: initialData.id,
          ...formData,
        });
      } else {
        await addDayOfService({
          ...formData,
          city_id: cityId,
        });
      }
      onClose();
    } catch (error) {
      console.error("Error saving day of service:", error);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            {initialData ? "Edit Day of Service" : "New Day of Service"}
            <IconButton onClick={onClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box display="flex" flexDirection="column" gap={3} pt={2}>
            <TextField
              label="Name (Optional)"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Start Date & Time"
              type="datetime-local"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date & Time"
              type="datetime-local"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </form>
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
