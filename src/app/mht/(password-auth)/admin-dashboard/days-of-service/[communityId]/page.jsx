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
} from "@mui/material";
import { EditCalendar } from "@mui/icons-material";
import moment from "moment";
import { useCommunities } from "@/hooks/use-communities";
import { useDaysOfService } from "@/hooks/useDaysOfService";
import Loading from "@/components/util/Loading";
import DosBreadcrumbs from "@/components/days-of-service/DosBreadcrumbs";
import ServiceDayDialog from "./ServiceDayDialog";

const CommunitySelectionPage = ({ params }) => {
  const router = useRouter();
  const communityId = params.communityId;
  const [community, setCommunity] = useState(null);
  const [daysOfService, setDaysOfService] = useState([]);
  const [showServiceDayDialog, setShowServiceDayDialog] = useState(false);
  const [selectedServiceDay, setSelectedServiceDay] = useState(null);
  const { fetchNewCommunities } = useCommunities();
  const { fetchDaysOfServiceByCommunity, deleteDayOfService } =
    useDaysOfService();

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
        partner_stakes: day.partner_stakes
          .map((stake) => {
            try {
              return JSON.parse(stake);
            } catch (e) {
              console.error("Error parsing stake:", stake, e);
              return null;
            }
          })
          .filter(Boolean), // Remove any null values from parsing errors
      }));

      setDaysOfService(parsedData);
    } catch (error) {
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

  const handlePartnerStakeClick = (day, stake) => {
    const url = `${
      process.env.NEXT_PUBLIC_DOMAIN
    }/admin-dashboard/days-of-service/${day.short_id.replaceAll("_", "/")}/${
      stake.id
    }`;

    // alert(url);

    // return;
    router.push(url);
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

      <Typography variant="h6" color="primary" gutterBottom sx={{ mb: 5 }}>
        Select a Partner Stake to view or create projects
      </Typography>

      {daysOfService.map((day) => (
        <Box key={day.id} sx={{ mb: 4 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 2,
            }}
          >
            <Typography variant="h5">
              {day.name || "Day of Service"} -{" "}
              {moment(day.end_date).format("dddd, MMMM Do, YYYY")}
            </Typography>
            <IconButton
              onClick={() => handleEditDay(day)}
              sx={{
                bgcolor: "primary.main",
                color: "white",
                "&:hover": { bgcolor: "primary.dark" },
              }}
            >
              <EditCalendar />
            </IconButton>
          </Box>
          <Grid container spacing={3}>
            {day.partner_stakes.map((stake) => (
              <Grid item xs={12} sm={6} md={4} key={stake.id}>
                <Card
                  sx={{
                    cursor: "pointer",
                    "&:hover": { boxShadow: 6 },
                  }}
                  onClick={() => handlePartnerStakeClick(day, stake)}
                >
                  <CardContent>
                    <Typography variant="h6">ID: {stake.id}</Typography>
                    <Typography variant="h6">{stake.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {stake.liaison_name_1
                        ? `Liaison: ${stake.liaison_name_1}`
                        : "No liaison assigned"}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      ))}

      <Button
        variant="contained"
        color="primary"
        sx={{ mt: 4 }}
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
    </Box>
  );
};

export default CommunitySelectionPage;
