import React from "react";
import { Chip, CardMedia, Typography, Box, Divider } from "@mui/material";
import {
  CalendarToday,
  AccessTime,
  LocationOn,
  People,
} from "@mui/icons-material";
import { ExampleIcons } from "@/components/events/ClassesTreeView/IconSelect";

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
      {classData?.classBannerUrl && !noBanner && (
        <CardMedia
          component="img"
          height="200"
          image={classData?.classBannerUrl}
          alt={classData.title}
          onError={(e) => {
            e.target.src = "/api/placeholder/800/200";
          }}
          sx={{ mb: 2 }}
        />
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        {classData?.description}
      </Typography>

      <Divider sx={{ my: 2 }} />

      {/* <pre>{JSON.stringify(classData, null, 2)}</pre> */}

      {classData?.startDate && classData?.endDate && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <CalendarToday fontSize="small" color="action" />
          <Typography variant="body2">
            {formatDate(classData.startDate)} - {formatDate(classData.endDate)}
          </Typography>
        </Box>
      )}

      {classData?.meetings && (
        <>
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
              <AccessTime fontSize="small" color="action" />
              <Typography variant="body2" fontWeight="medium">
                Meeting Schedule:
              </Typography>
            </Box>

            <Box sx={{ pl: 4, display: "flex", flexWrap: "wrap", gap: 1 }}>
              {classData.meetings.map((meeting) => {
                // Format start time
                const [startHour, startMinute] = meeting.startTime.split(":");
                const startHourNum = parseInt(startHour);
                const startPeriod = startHourNum >= 12 ? "PM" : "AM";
                const formattedStartHour = startHourNum % 12 || 12;
                const formattedStartTime = `${formattedStartHour}:${startMinute} ${startPeriod}`;

                // Format end time
                const [endHour, endMinute] = meeting.endTime.split(":");
                const endHourNum = parseInt(endHour);
                const endPeriod = endHourNum >= 12 ? "PM" : "AM";
                const formattedEndHour = endHourNum % 12 || 12;
                const formattedEndTime = `${formattedEndHour}:${endMinute} ${endPeriod}`;

                return (
                  <Chip
                    key={meeting.id}
                    label={`${meeting.day}: ${formattedStartTime} - ${formattedEndTime}`}
                    size="small"
                    variant="outlined"
                    sx={{ borderRadius: 4 }}
                  />
                );
              })}
            </Box>
          </Box>
        </>
      )}

      {classData?.location && (
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
          <LocationOn fontSize="small" color="action" />
          <Typography variant="body2">{classData.location}</Typography>
        </Box>
      )}

      {classData?.showCapacity && (
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
