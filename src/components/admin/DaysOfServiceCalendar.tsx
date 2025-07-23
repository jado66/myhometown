"use client";

import type React from "react";
import { useMemo, useCallback } from "react";
import { Calendar, momentLocalizer, Views } from "react-big-calendar";
import moment from "moment";
import { Grid, styled, Typography, Card } from "@mui/material";
import Loading from "../util/Loading";
import "react-big-calendar/lib/css/react-big-calendar.css";

// Set locale to English to ensure consistent formatting
moment.locale("en");

// Helper function to parse partner stakes JSON strings
const parsePartnerStakes = (partnerStakes: string[]) => {
  if (!partnerStakes || partnerStakes.length === 0) return [];

  return partnerStakes.map((stakeString) => {
    try {
      const parsed = JSON.parse(stakeString);
      return parsed.name || "Unknown Stake";
    } catch (error) {
      console.error("Error parsing partner stake:", error);
      return stakeString; // Fallback to original string
    }
  });
};

const localizer = momentLocalizer(moment);

const StyledCalendar = styled(Calendar)(({ theme }) => ({
  ".rbc-event": {
    "&.rbc-selected": {
      backgroundColor: theme.palette.secondary.main,
      color: "black",
    },
    backgroundColor: theme.palette.primary.main,
  },
  ".rbc-today": {
    backgroundColor: theme.palette.secondary.light,
  },
  ".rbc-show-more": {
    color: theme.palette.primary.main,
  },
}));

interface DayOfService {
  id: string;
  start_date: string;
  end_date: string;
  name: string | null;
  city_id: string;
  community_id: string;
  short_id: string;
  partner_stakes?: string[] | null;
  partner_wards?: string[] | null;
  partner_stakes_json?: any;
  check_in_location?: string | null;
  is_locked: boolean;
  created_at: string;
  updated_at: string;
}

interface DaysOfServiceCalendarProps {
  daysOfService: DayOfService[];
  onSelectDay?: (day: DayOfService) => void;
  isLoading?: boolean;
}

export const DaysOfServiceCalendar: React.FC<DaysOfServiceCalendarProps> = ({
  daysOfService,
  onSelectDay,
  isLoading = false,
}) => {
  // Transform incoming data for react-big-calendar
  const processedDays = useMemo(() => {
    if (!daysOfService) return [];

    return daysOfService
      .map((day) => {
        // Only use end_date for the actual event day
        let eventDate = day.end_date ? moment(day.end_date).toDate() : null;
        let nextDay = day.end_date
          ? moment(day.end_date).add(1, "day").toDate()
          : null;
        if (
          !eventDate ||
          !nextDay ||
          isNaN(eventDate.getTime()) ||
          isNaN(nextDay.getTime())
        )
          return null;

        return {
          ...day,
          title:
            day.name && day.name.trim()
              ? day.name
              : `Day of Service - ${day.short_id}`,
          start: eventDate,
          end: nextDay, // react-big-calendar treats end as exclusive
          allDay: true,
          resource: day,
        };
      })
      .filter(Boolean);
  }, [daysOfService]);

  const { defaultDate, views, formats } = useMemo(
    () => ({
      defaultDate: new Date(),
      views: Object.keys(Views).map((k) => Views[k]),
      formats: {
        dateFormat: "DD",
        dayFormat: "DD ddd",
        monthHeaderFormat: "YYYY MMMM",
        dayHeaderFormat: "YYYY MMMM DD dddd",
        dayRangeHeaderFormat: ({ start, end }) =>
          `${moment(start).format("YYYY MMMM DD")} - ${moment(end).format(
            "DD"
          )}`,
        eventTimeRangeFormat: () => "All Day", // Since these are all-day events
        timeGutterFormat: (date) => moment(date).format("HH:mm"),
      },
    }),
    []
  );

  const handleSelectEvent = useCallback(
    (calEvent) => {
      if (!onSelectDay) {
        return;
      }
      // Pass the original day of service data
      onSelectDay(calEvent.resource);
    },
    [onSelectDay]
  );

  // Custom event component to show additional info
  const EventComponent = ({ event }) => {
    const partnerStakeNames = parsePartnerStakes(
      event.resource.partner_stakes || []
    );

    return (
      <div>
        <strong>{event.title}</strong>
        {event.resource.check_in_location && (
          <div style={{ fontSize: "0.8em", opacity: 0.8 }}>
            📍 {event.resource.check_in_location}
          </div>
        )}
        {partnerStakeNames.length > 0 && (
          <div style={{ fontSize: "0.7em", opacity: 0.7 }}>
            Stakes: {partnerStakeNames.slice(0, 2).join(", ")}
            {partnerStakeNames.length > 2 &&
              ` +${partnerStakeNames.length - 2} more`}
          </div>
        )}
        {event.resource.is_locked && (
          <div style={{ fontSize: "0.8em", opacity: 0.8 }}>🔒 Locked</div>
        )}
      </div>
    );
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      <Typography
        variant="h4"
        component="h2"
        color="primary"
        textAlign="center"
        gutterBottom
      >
        Days of Service Calendar
      </Typography>
      <Card sx={{ padding: 2, marginTop: 2 }}>
        <Grid item xs={12} sx={{ height: "600px" }}>
          <StyledCalendar
            localizer={localizer}
            defaultView="month"
            views={views}
            defaultDate={defaultDate}
            events={processedDays}
            showMultiDayTimes
            step={60}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={handleSelectEvent}
            formats={formats}
            culture="en"
            components={{
              event: EventComponent,
            }}
            // Disable slot selection since we're display-only
            selectable={false}
          />
        </Grid>
      </Card>
    </>
  );
};

export default DaysOfServiceCalendar;
