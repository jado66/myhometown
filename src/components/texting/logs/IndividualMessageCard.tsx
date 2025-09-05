"use client";

import React from "react";
import { Box, Card, Typography, Chip, IconButton } from "@mui/material";
import { Info } from "@mui/icons-material";
import {
  getStatusIcon,
  getStatusColor,
  getDisplayStatus,
} from "./StatusHelpers";
import { ErrorMessageDisplay } from "./ErrorMessageDisplay";
import { TextLog } from "./types";

interface IndividualMessageCardProps {
  log: TextLog;
  onOpenDialog: (log: TextLog, status: "pending" | "sent") => void;
}

export const IndividualMessageCard = ({
  log,
  onOpenDialog,
}: IndividualMessageCardProps) => {
  return (
    <Card
      key={log.id}
      variant="outlined"
      sx={{
        mb: 1,
        p: 2,
        bgcolor: "background.default",
      }}
    >
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            mb: 1,
          }}
        >
          {getStatusIcon(log.status)}
          <Typography variant="body2" sx={{ fontWeight: 600 }}>
            {log.recipient_phone}
          </Typography>
          <Chip
            label={getDisplayStatus(log.status)}
            color={getStatusColor(log.status) as any}
            variant="outlined"
            sx={{ textTransform: "capitalize" }}
            size="small"
          />
          {log.status.toLowerCase() === "sent" && (
            <IconButton
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                onOpenDialog(log, "pending");
              }}
            >
              <Info sx={{ fontSize: 20 }} />
            </IconButton>
          )}
        </Box>
        <ErrorMessageDisplay errorMessage={log.error_message} />
      </Box>
    </Card>
  );
};
