"use client";

import React from "react";
import moment from "moment";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Stack,
  Chip,
  Divider,
  IconButton,
} from "@mui/material";
import {
  Warning as AlertCircleIcon,
  Schedule as ClockIcon,
  Close as CloseIcon,
} from "@mui/icons-material";
import { TextLog } from "./types";

interface StatusDialogProps {
  open: boolean;
  onClose: () => void;
  log: TextLog | null;
  status: "pending" | "sent";
}

export const StatusDialog = ({
  open,
  onClose,
  log,
  status,
}: StatusDialogProps) => {
  if (!log) return null;

  const isPending = status === "pending";

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {isPending ? (
          <AlertCircleIcon sx={{ color: "warning.main" }} />
        ) : (
          <ClockIcon sx={{ color: "info.main" }} />
        )}
        {isPending ? "Message Pending" : "Message Sent"}
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Recipient:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {log.recipient_phone}
            </Typography>
          </Box>

          <Divider />

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Status:
            </Typography>
            <Chip
              label={isPending ? "Pending Delivery" : "Sent"}
              color={isPending ? "warning" : "info"}
              size="small"
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Sent At:
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {log.sent_at
                ? moment(log.sent_at).format("MMM DD, YYYY HH:mm:ss")
                : moment(log.created_at).format("MMM DD, YYYY HH:mm:ss")}
            </Typography>
          </Box>

          {isPending ? (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Why is this message pending?
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                Text messages fail to deliver due to poor cell reception, the
                recipient&apos;s phone being off or out of range, network
                issues, wrong numbers, or being blocked by the recipient.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                If the message is not received within 24-72 hours it will be
                marked as failed.
              </Typography>
            </Box>
          ) : (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Next Steps:
              </Typography>
              <Typography variant="body2" color="text.secondary">
                The message has been successfully sent and is being processed by
                the recipient's carrier. You should receive a delivery
                confirmation shortly.
              </Typography>
            </Box>
          )}

          {log.twilio_sid && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Message ID:
              </Typography>
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ fontFamily: "monospace" }}
              >
                {log.twilio_sid}
              </Typography>
            </Box>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="contained">
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};
