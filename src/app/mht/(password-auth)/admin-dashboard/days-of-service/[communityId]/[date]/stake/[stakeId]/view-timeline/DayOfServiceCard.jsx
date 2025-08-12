"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardContent,
  Typography,
  Box,
  Divider,
  IconButton,
  Collapse,
} from "@mui/material";
import {
  CalendarMonth,
  LocationOn,
  People,
  AccessTime,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import { useCommunities } from "@/hooks/use-communities";

const DayOfServiceCard = ({
  dayOfService: { id, end_date, community_id, created_at, updated_at, name },
}) => {
  const [community, setCommunity] = useState(null);
  const [expanded, setExpanded] = useState(false);
  const { fetchNewCommunities } = useCommunities();

  useEffect(() => {
    if (community_id) {
      loadCommunity();
    }
  }, [community_id]);

  const loadCommunity = async () => {
    const { data, error } = await fetchNewCommunities({
      query: (q) => q.eq("id", community_id),
    });

    if (error) throw error;

    if (data) {
      setCommunity(data[0]);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });
  };

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  return (
    <Card sx={{ maxWidth: 600, width: "100%", boxShadow: 3 }}>
      <CardHeader
        sx={{
          "& .MuiCardHeader-content": { width: "100%" },
        }}
        title={
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h5" component="h2">
              {name || "Day of Service"}
            </Typography>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
              }}
            >
              <LocationOn sx={{ fontSize: 20, mr: 0.5 }} />
              <Typography variant="body2">
                {community?.city_name} - {community?.name}
              </Typography>
            </Box>
          </Box>
        }
      />

      <CardContent sx={{ "& > *": { mb: 2 }, position: "relative" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            color: "text.secondary",
          }}
        >
          <CalendarMonth sx={{ fontSize: 20, mr: 1 }} />
          <Typography variant="body2">
            Day of Service - {formatDate(end_date)}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            color: "text.secondary",
            mb: 0,
          }}
        >
          <People sx={{ fontSize: 20, mr: 1 }} />
          <Typography variant="body2">
            {community?.city_name} - {community?.name}
          </Typography>
        </Box>

        <Box
          sx={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
            position: "absolute",
            bottom: 0,
            right: 5,
          }}
        >
          <Typography variant="body2" sx={{ mr: 1 }}>
            Show More
          </Typography>
          <IconButton
            onClick={handleExpandClick}
            aria-expanded={expanded}
            aria-label="show more"
            sx={{
              transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s",
            }}
          >
            <ExpandMoreIcon />
          </IconButton>
        </Box>

        <Collapse in={expanded} timeout="auto" unmountOnExit>
          <Divider
            sx={{
              my: 2,
            }}
          />
          <Box sx={{ "& > *": { mb: 1 } }}>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
              }}
            >
              <AccessTime sx={{ fontSize: 20, mr: 1 }} />
              <Typography variant="body2">
                Created: {new Date(created_at).toLocaleString()}
              </Typography>
            </Box>
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
              }}
            >
              <AccessTime sx={{ fontSize: 20, mr: 1 }} />
              <Typography variant="body2">
                Last Modified: {new Date(updated_at).toLocaleString()}
              </Typography>
            </Box>
            <Typography
              variant="caption"
              sx={{ color: "text.disabled", mt: 2, display: "block" }}
            >
              ID: {id}
            </Typography>
          </Box>
        </Collapse>
      </CardContent>
    </Card>
  );
};

export default DayOfServiceCard;
