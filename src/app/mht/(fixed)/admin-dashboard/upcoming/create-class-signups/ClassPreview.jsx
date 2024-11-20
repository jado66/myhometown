import React from "react";
import {
  Card,
  CardMedia,
  CardContent,
  Typography,
  Chip,
  Box,
  Divider,
  Button,
} from "@mui/material";
import {
  CalendarToday,
  AccessTime,
  LocationOn,
  People,
} from "@mui/icons-material";

const ClassPreview = ({ classData }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <Card sx={{ maxWidth: 600, margin: "auto", marginTop: 2 }}>
      <CardMedia
        component="img"
        height="200"
        image={classData.classBannerUrl}
        alt={classData.title}
        onError={(e) => {
          e.target.src = "/api/placeholder/800/200";
        }}
      />

      <CardContent>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h5" component="div">
            {classData.title}
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {classData.description}
        </Typography>

        <Divider sx={{ my: 2 }} />

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <CalendarToday fontSize="small" color="action" />
          <Typography variant="body2">
            {formatDate(classData.startDate)} - {formatDate(classData.endDate)}
          </Typography>
        </Box>

        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <AccessTime fontSize="small" color="action" />
            <Typography variant="body2" fontWeight="medium">
              Meeting Schedule:
            </Typography>
          </Box>
          <Box sx={{ pl: 4 }}>
            {classData.meetings.map((meeting) => (
              <Typography key={meeting.id} variant="body2" sx={{ mb: 0.5 }}>
                {meeting.day}: {meeting.startTime} - {meeting.endTime}
              </Typography>
            ))}
          </Box>
        </Box>

        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <LocationOn fontSize="small" color="action" />
          <Typography variant="body2">{classData.location}</Typography>
        </Box>

        {classData.showCapacity && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <People fontSize="small" color="action" />
            <Typography variant="body2">
              Capacity: {classData.capacity} students
            </Typography>
          </Box>
        )}

        <Button variant="contained" color="primary" fullWidth sx={{ mt: 2 }}>
          Sign Up
        </Button>
      </CardContent>
    </Card>
  );
};

export default ClassPreview;
