"use client";

import type React from "react";
import { useMemo } from "react";
import {
  Box,
  Typography,
  Paper,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Alert,
  LinearProgress,
  Divider,
  Card,
  CardContent,
} from "@mui/material";
import {
  CheckCircle,
  Schedule,
  Error,
  Person,
  Phone,
  TrendingUp,
} from "@mui/icons-material";

interface Recipient {
  name: string;
  phone: string;
  contactId: string;
  groups?: any[];
  ownerType?: string;
  ownerId?: string;
}

interface DeliveryAnalysisProps {
  logData: {
    message_id: string;
    status: string;
    statuses: string[];
    recipientCount: number;
    recipients?: any[];
    individualLogIds?: string[];
    created_at: string;
    delivered_at?: string;
  };
  metadata: {
    allRecipients: Recipient[];
    recipientCount: number;
    messageType: string;
    sender?: {
      id: string;
      name: string;
    };
  } | null;
}

export const DeliveryAnalysis: React.FC<DeliveryAnalysisProps> = ({
  logData,
  metadata,
}) => {
  // Parse delivery statistics
  const deliveryStats = useMemo(() => {
    if (!logData.statuses || logData.statuses.length === 0) {
      return {
        delivered: logData.status === "delivered" ? 1 : 0,
        sent: logData.status === "sent" ? 1 : 0,
        failed: logData.status === "failed" ? 1 : 0,
        pending: logData.status === "pending" ? 1 : 0,
        total: 1,
      };
    }

    const stats = {
      delivered: 0,
      sent: 0,
      failed: 0,
      pending: 0,
      total: logData.statuses.length,
    };

    logData.statuses.forEach((status) => {
      switch (status.toLowerCase()) {
        case "delivered":
          stats.delivered++;
          break;
        case "sent":
          stats.sent++;
          break;
        case "failed":
          stats.failed++;
          break;
        case "pending":
          stats.pending++;
          break;
        default:
          stats.pending++;
      }
    });

    return stats;
  }, [logData.statuses, logData.status]);

  // Calculate delivery rate
  const deliveryRate = useMemo(() => {
    if (deliveryStats.total === 0) return 0;
    return Math.round((deliveryStats.delivered / deliveryStats.total) * 100);
  }, [deliveryStats]);

  // Combine recipient data with delivery status
  const recipientAnalysis = useMemo(() => {
    if (!metadata?.allRecipients) return [];

    return metadata.allRecipients.map((recipient, index) => {
      // Get status for this recipient (if individual statuses are available)
      let status = "sent"; // default
      if (logData.statuses && logData.statuses[index]) {
        status = logData.statuses[index];
      } else if (logData.statuses && logData.statuses.length === 1) {
        status = logData.statuses[0];
      } else {
        status = logData.status;
      }

      return {
        ...recipient,
        deliveryStatus: status,
        index: index + 1,
      };
    });
  }, [metadata?.allRecipients, logData.statuses, logData.status]);

  // Status chip component
  const StatusChip = ({ status }: { status: string }) => {
    const getStatusConfig = (status: string) => {
      switch (status.toLowerCase()) {
        case "delivered":
          return {
            color: "success" as const,
            icon: <CheckCircle fontSize="small" />,
            label: "Delivered",
          };
        case "sent":
          return {
            color: "info" as const,
            icon: <Schedule fontSize="small" />,
            label: "Sent",
          };
        case "failed":
          return {
            color: "error" as const,
            icon: <Error fontSize="small" />,
            label: "Failed",
          };
        default:
          return {
            color: "default" as const,
            icon: <Schedule fontSize="small" />,
            label: "Pending",
          };
      }
    };

    const config = getStatusConfig(status);
    return (
      <Chip
        icon={config.icon}
        label={config.label}
        color={config.color}
        size="small"
        variant="outlined"
      />
    );
  };

  if (!metadata) {
    return (
      <Alert severity="warning" sx={{ mt: 2 }}>
        No delivery analysis available - metadata is missing.
      </Alert>
    );
  }

  return (
    <Box sx={{ mt: 3 }}>
      <Typography
        variant="h6"
        gutterBottom
        sx={{ display: "flex", alignItems: "center", gap: 1 }}
      >
        <TrendingUp />
        Delivery Analysis
      </Typography>

      {/* Delivery Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        {/* <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <CheckCircle color="success" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h4" color="success.main">
                {deliveryStats.delivered}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Delivered
              </Typography>
            </CardContent>
          </Card>
        </Grid> */}
        <Grid item xs={6} sm={6}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Schedule color="info" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h4" color="info.main">
                {deliveryStats.sent}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Sent
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={6} sm={6}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Error color="error" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h4" color="error.main">
                {deliveryStats.failed}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Failed
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        {/* <Grid item xs={6} sm={3}>
          <Card>
            <CardContent sx={{ textAlign: "center", py: 2 }}>
              <Schedule color="warning" sx={{ fontSize: 32, mb: 1 }} />
              <Typography variant="h4" color="warning.main">
                {deliveryStats.pending}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Pending
              </Typography>
            </CardContent>
          </Card>
        </Grid> */}
      </Grid>

      {/* Delivery Rate Progress */}
      <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 1,
          }}
        >
          <Typography variant="subtitle2">Delivery Rate</Typography>
          <Typography variant="h6" color="primary">
            {deliveryRate}%
          </Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={deliveryRate}
          sx={{
            height: 8,
            borderRadius: 4,
            backgroundColor: "grey.200",
            "& .MuiLinearProgress-bar": {
              borderRadius: 4,
              backgroundColor:
                deliveryRate >= 90
                  ? "success.main"
                  : deliveryRate >= 70
                  ? "warning.main"
                  : "error.main",
            },
          }}
        />
        <Typography
          variant="caption"
          color="text.secondary"
          sx={{ mt: 1, display: "block" }}
        >
          {deliveryStats.delivered} of {deliveryStats.total} messages delivered
        </Typography>
      </Paper>

      <Divider sx={{ my: 2 }} />

      {/* Individual Recipients Table */}
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2, mb: 2 }}>
        Individual Recipient Status ({recipientAnalysis.length} recipients)
      </Typography>

      <TableContainer component={Paper} elevation={1}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.50" }}>
              <TableCell sx={{ fontWeight: "bold" }}>#</TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Person fontSize="small" />
                  Recipient
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Phone fontSize="small" />
                  Phone
                </Box>
              </TableCell>
              <TableCell sx={{ fontWeight: "bold" }}>Status</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {recipientAnalysis.map((recipient) => (
              <TableRow
                key={recipient.contactId || recipient.index}
                hover
                sx={{
                  "&:nth-of-type(odd)": {
                    backgroundColor: "action.hover",
                  },
                }}
              >
                <TableCell>{recipient.index}</TableCell>
                <TableCell>
                  <Typography variant="body2" fontWeight="medium">
                    {recipient.name || "Unknown"}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography variant="body2" fontFamily="monospace">
                    {recipient.phone}
                  </Typography>
                </TableCell>
                <TableCell>
                  <StatusChip status={recipient.deliveryStatus} />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Additional Info */}
      {deliveryStats.failed > 0 && (
        <Alert severity="warning" sx={{ mt: 2 }}>
          {deliveryStats.failed} message(s) failed to deliver. This could be due
          to invalid phone numbers, network issues, or carrier restrictions.
        </Alert>
      )}

      {deliveryStats.pending > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          {deliveryStats.pending} message(s) are still pending delivery. These
          should update shortly.
        </Alert>
      )}
    </Box>
  );
};

export default DeliveryAnalysis;
