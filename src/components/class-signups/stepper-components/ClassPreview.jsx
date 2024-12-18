import React from "react";
import { Card, CardMedia, Typography, Box, Divider } from "@mui/material";
import {
  CalendarToday,
  AccessTime,
  LocationOn,
  People,
} from "@mui/icons-material";

const ClassPreview = ({ classData, noBanner }) => {
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <>
      {classData.classBannerUrl && !noBanner && (
        <CardMedia
          component="img"
          height="200"
          image={classData.classBannerUrl}
          alt={classData.title}
          onError={(e) => {
            e.target.src = "/api/placeholder/800/200";
          }}
        />
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {classData.description}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {classData.startDate && classData.endDate && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <CalendarToday fontSize="small" color="action" />
          <Typography variant="body2">
            {formatDate(classData.startDate)} - {formatDate(classData.endDate)}
          </Typography>
        </Box>
      )}

      {classData.meetings && (
        <>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <AccessTime fontSize="small" color="action" />
              <Typography variant="body2" fontWeight="medium">
                Meeting Schedule:
              </Typography>
            </Box>

            <Box sx={{ pl: 4, display: "flex", flexDirection: "row" }}>
              {classData.meetings.map((meeting, index) => (
                <Typography key={meeting.id} variant="body2" sx={{ mb: 0.5 }}>
                  {meeting.day}: {meeting.startTime} - {meeting.endTime}
                  {index < classData.meetings.length - 1 && ", "}
                </Typography>
              ))}
            </Box>
          </Box>
        </>
      )}

      {classData.location && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <LocationOn fontSize="small" color="action" />
          <Typography variant="body2">{classData.location}</Typography>
        </Box>
      )}

      {classData.showCapacity && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <People fontSize="small" color="action" />
          <Typography variant="body2">
            Capacity: {classData.capacity} students
          </Typography>
        </Box>
      )}
    </>
  );
};

export default ClassPreview;
