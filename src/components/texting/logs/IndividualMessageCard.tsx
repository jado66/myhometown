"use client";

import React from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  IconButton,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Warning as AlertCircleIcon,
  Cancel as XCircleIcon,
  Info as InfoIcon,
} from "@mui/icons-material";
import { TextLog, TextBatch } from "./types";

interface IndividualMessageCardProps {
  log: TextLog;
  batch: TextBatch;
  onOpenDialog: (log: TextLog, status: "pending" | "sent") => void;
}

// Helper function to get contact name from metadata
const getContactName = (
  phone: string,
  batch: TextBatch
): { name: string; phone: string } => {
  if (!batch.metadata?.allRecipients) {
    return { name: "", phone };
  }

  // Normalize phone numbers for comparison (remove formatting)
  const normalizePhone = (phoneNum: string) => phoneNum.replace(/\D/g, "");
  const normalizedPhone = normalizePhone(phone);

  const recipient = batch.metadata.allRecipients.find(
    (r) => normalizePhone(r.phone) === normalizedPhone
  );

  return {
    name: recipient?.name || "",
    phone: phone,
  };
};

const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />;
    case "failed":
    case "undelivered":
      return <XCircleIcon sx={{ fontSize: 16, color: "error.main" }} />;
    case "sent":
    case "pending":
      return <AlertCircleIcon sx={{ fontSize: 16, color: "warning.main" }} />;
    default:
      return <InfoIcon sx={{ fontSize: 16, color: "info.main" }} />;
  }
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return "success";
    case "failed":
    case "undelivered":
      return "error";
    case "sent":
    case "pending":
      return "warning";
    default:
      return "default";
  }
};

export const IndividualMessageCard = ({
  log,
  batch,
  onOpenDialog,
}: IndividualMessageCardProps) => {
  const contactInfo = getContactName(log.recipient_phone, batch);
  const status = log.status?.toLowerCase() === "sent" ? "sent" : "pending";

  return (
    <Card
      variant="outlined"
      sx={{
        mb: 1,
        cursor: "pointer",
        "&:hover": {
          bgcolor: "action.hover",
        },
        transition: "background-color 0.2s",
      }}
      onClick={() => onOpenDialog(log, status)}
    >
      <CardContent sx={{ py: 1.5, "&:last-child": { pb: 1.5 } }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {getStatusIcon(log.status)}
              <Box>
                {contactInfo.name ? (
                  <>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>
                      {contactInfo.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {contactInfo.phone}
                    </Typography>
                  </>
                ) : (
                  <Typography variant="body2" sx={{ fontWeight: 500 }}>
                    {contactInfo.phone}
                  </Typography>
                )}
              </Box>
            </Box>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Chip
              label={log.status}
              color={getStatusColor(log.status) as any}
              size="small"
              sx={{ textTransform: "capitalize" }}
            />
            <IconButton size="small" sx={{ ml: 1 }}>
              <InfoIcon fontSize="small" />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};
