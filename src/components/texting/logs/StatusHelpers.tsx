"use client";

import React from "react";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as XCircleIcon,
  Warning as AlertCircleIcon,
  Message as MessageSquareIcon,
} from "@mui/icons-material";

export const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
      return <CheckCircleIcon sx={{ fontSize: 16, color: "success.main" }} />;
    case "sent":
      return <AlertCircleIcon sx={{ fontSize: 16, color: "warning.main" }} />;
    case "failed":
      return <XCircleIcon sx={{ fontSize: 16, color: "error.main" }} />;
    default:
      return (
        <MessageSquareIcon sx={{ fontSize: 16, color: "text.secondary" }} />
      );
  }
};

export const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case "delivered":
    case "completed":
      return "success";
    case "sent":
    case "in_progress":
      return "warning";
    case "failed":
      return "error";
    default:
      return "default";
  }
};

export const getBatchStatus = (status: string) => {
  return status.toLowerCase() === "in_progress" ? "mixed results" : status;
};

export const getDisplayStatus = (status: string) => {
  return status.toLowerCase() === "sent" ? "pending" : status;
};

// Helper function to calculate accurate counts from batch details
export const calculateBatchCounts = (batchDetails: any[] | undefined) => {
  if (!batchDetails || batchDetails.length === 0) {
    return {
      delivered_count: 0,
      pending_count: 0,
      failed_count: 0,
      sent_count: 0,
      total_count: 0,
    };
  }

  let delivered_count = 0;
  let pending_count = 0;
  let failed_count = 0;
  let sent_count = 0;

  batchDetails.forEach((log) => {
    const status = log.status.toLowerCase();
    switch (status) {
      case "delivered":
        delivered_count++;
        break;
      case "sent":
        sent_count++;
        break;
      case "failed":
      case "undelivered":
        failed_count++;
        break;
      default:
        pending_count++;
        break;
    }
  });

  return {
    delivered_count,
    pending_count,
    failed_count,
    sent_count,
    total_count: batchDetails.length,
  };
};
