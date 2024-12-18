import React from "react";
import moment from "moment";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Checkbox,
} from "@mui/material";

export default function ClassRollTable({ classData }) {
  const { title, startDate, endDate, meetings, signups, signupForm } =
    classData;

  // Generate dates based on meetings
  const generateDates = () => {
    const dates = [];
    let currentDate = new Date(startDate);
    const endDateTime = new Date(endDate);

    while (currentDate <= endDateTime) {
      const dayOfWeek = currentDate.toLocaleDateString("en-US", {
        weekday: "long",
      });
      const matchingMeetings = meetings.filter(
        (meeting) => meeting.day === dayOfWeek
      );

      if (matchingMeetings.length > 0) {
        dates.push(currentDate.toISOString().split("T")[0]);
      }

      currentDate = new Date(currentDate.setDate(currentDate.getDate() + 1));
    }

    return dates;
  };

  const dates = generateDates();

  // Define name fields
  const nameFields = Object.entries(signupForm)
    .filter(
      ([key, field]) =>
        field.type !== "divider" &&
        field.type !== "header" &&
        field.type !== "staticText" &&
        field.type !== "bannerImage" &&
        (key.toLowerCase().includes("name") ||
          field.label.toLowerCase().includes("name"))
    )
    .map(([key, field]) => ({
      key,
      label: field.label,
      required: field.required || false,
    }));

  if (signups.length === 0) {
    return (
      <div className="text-center mt-4 text-lg font-medium">
        No signups yet for {title}.
      </div>
    );
  }

  return (
    <TableContainer
      component={Paper}
      sx={{
        mt: 4,
        overflowX: "auto",
        "& .MuiTableCell-root": {
          whiteSpace: "nowrap",
        },
      }}
    >
      <Table
        sx={{
          minWidth: 650,
          "& .sticky-column": {
            position: "sticky",
            left: 0,
            background: "white",
            zIndex: 1,
            borderRight: "1px solid rgba(224, 224, 224, 1)",
            "&:after": {
              content: '""',
              position: "absolute",
              right: 0,
              top: 0,
              bottom: 0,
              width: 1,
            },
          },
          "& .sticky-column-1": {
            left: 200,
          },
          "& .sticky-column-2": {
            left: 400,
          },
          // Add more positions if needed for additional name columns
        }}
      >
        <TableHead>
          <TableRow>
            {nameFields.map((field, index) => (
              <TableCell
                key={field.key}
                sx={{
                  minWidth: 200,
                }}
                className={`sticky-column ${
                  index > 0 ? `sticky-column-${index}` : ""
                }`}
              ></TableCell>
            ))}
            {dates.map((date) => (
              <TableCell key={date} align="center" sx={{ minWidth: 100 }}>
                {moment(date).format("dddd")}
              </TableCell>
            ))}
          </TableRow>
          <TableRow>
            {nameFields.map((field, index) => (
              <TableCell
                key={field.key}
                sx={{
                  minWidth: 200,
                }}
                className={`sticky-column ${
                  index > 0 ? `sticky-column-${index}` : ""
                }`}
                rowSpan={2}
              >
                {field.label}
              </TableCell>
            ))}
            {dates.map((date) => (
              <TableCell key={date} align="center" sx={{ minWidth: 100 }}>
                {moment(date).format("DD/MM/YY")}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {signups.map((signup, index) => (
            <TableRow key={index}>
              {nameFields.map((field, fieldIndex) => (
                <TableCell
                  key={field.key}
                  className={`sticky-column ${
                    fieldIndex > 0 ? `sticky-column-${fieldIndex}` : ""
                  }`}
                >
                  {signup[field.key] || ""}
                </TableCell>
              ))}
              {dates.map((date) => (
                <TableCell key={date} align="center">
                  <Checkbox />
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
