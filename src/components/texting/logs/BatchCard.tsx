"use client";

import React from "react";
import moment from "moment";
import {
  Box,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Grid,
  Chip,
  Collapse,
  IconButton,
} from "@mui/material";
import {
  ExpandMore as ChevronDownIcon,
  ChevronRight as ChevronRightIcon,
  CheckCircle as CheckCircleIcon,
  Warning as AlertCircleIcon,
  Cancel as XCircleIcon,
} from "@mui/icons-material";
import {
  getBatchStatus,
  getStatusColor,
  calculateBatchCounts,
} from "./StatusHelpers";
import { IndividualMessagesList } from "./IndividualMessagesList";
import { TextLog, TextBatch } from "./types";

interface BatchCardProps {
  batch: TextBatch;
  isExpanded: boolean;
  batchDetails: TextLog[] | undefined;
  isLoadingDetails: boolean;
  searchTerm: string;
  onToggleBatch: () => void;
  onSearchChange: (searchTerm: string) => void;
  onClearSearch: () => void;
  onOpenDialog: (log: TextLog, status: "pending" | "sent") => void;
}

export const BatchCard = ({
  batch,
  isExpanded,
  batchDetails,
  isLoadingDetails,
  searchTerm,
  onToggleBatch,
  onSearchChange,
  onClearSearch,
  onOpenDialog,
}: BatchCardProps) => {
  return (
    <Card key={batch.id} sx={{ mb: 2, width: "100%" }}>
      <CardHeader
        sx={{
          cursor: "pointer",
          "&:hover": {
            bgcolor: "action.hover",
          },
          transition: "background-color 0.2s",
        }}
        onClick={onToggleBatch}
        action={
          <>
            <Typography sx={{ ml: 2 }}>
              See Details:
              <IconButton>
                {isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
              </IconButton>
            </Typography>
          </>
        }
        title={
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              width: "100%",
            }}
          >
            <Box>
              <Typography variant="subtitle1">
                <strong>{batch.total_count} Sent Messages </strong> -{" "}
                {batch.message_content.length > 50
                  ? `${batch.message_content.slice(0, 50)}...`
                  : batch.message_content}
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ mt: 0.5 }}
              >
                {moment(batch.created_at).format("MMM DD, YYYY HH:mm")}
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", mt: -2 }}>
              <Chip
                label={getBatchStatus(batch.status)}
                color={getStatusColor(batch.status) as any}
                size="small"
                sx={{ textTransform: "capitalize" }}
              />
            </Box>
          </Box>
        }
        subheader={(() => {
          // Use calculated counts if batch details are available, otherwise fall back to database counts
          const calculatedCounts = calculateBatchCounts(batchDetails);
          const hasDetails = batchDetails && batchDetails.length > 0;

          const deliveredCount = hasDetails
            ? calculatedCounts.delivered_count
            : batch.delivered_count;
          const pendingCount = hasDetails
            ? calculatedCounts.sent_count + calculatedCounts.pending_count
            : batch.sent_count + batch.pending_count;
          const failedCount = hasDetails
            ? calculatedCounts.failed_count
            : batch.failed_count;

          return (
            <Grid container spacing={1} sx={{ mt: 1 }}>
              <Grid item xs={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <CheckCircleIcon
                    sx={{ fontSize: 12, color: "success.main" }}
                  />
                  <Typography variant="caption">
                    Delivered: {deliveredCount}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <AlertCircleIcon
                    sx={{ fontSize: 12, color: "warning.main" }}
                  />
                  <Typography variant="caption">
                    Pending: {pendingCount}
                  </Typography>
                </Box>
              </Grid>
              <Grid item xs={2}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <XCircleIcon sx={{ fontSize: 12, color: "error.main" }} />
                  <Typography variant="caption">
                    Failed: {failedCount}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          );
        })()}
      />

      <Collapse in={isExpanded}>
        <CardContent sx={{ pt: 0, borderTop: 1, borderColor: "divider" }}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              Message Content:
            </Typography>
            <Box
              sx={{
                p: 2,
                bgcolor: "action.hover",
                borderRadius: 1,
                border: 1,
                borderColor: "divider",
              }}
            >
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                }}
              >
                {batch.message_content}
              </Typography>
            </Box>
          </Box>

          <IndividualMessagesList
            batchId={batch.id}
            batchDetails={batchDetails}
            isLoading={isLoadingDetails}
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            onClearSearch={onClearSearch}
            onOpenDialog={onOpenDialog}
          />
        </CardContent>
      </Collapse>
    </Card>
  );
};
