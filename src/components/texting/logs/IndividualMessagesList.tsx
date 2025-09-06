"use client";

import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { IndividualMessageCard } from "./IndividualMessageCard";
import { MessageSearchBar } from "./MessageSearchBar";
import { TextLog, TextBatch } from "./types";

interface Recipient {
  phone: string;
  name: string;
}

interface IndividualMessagesListProps {
  batchId: string;
  batchDetails: TextLog[] | undefined;
  batch: TextBatch; // Add batch prop to access metadata
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
  onClearSearch: () => void;
  onOpenDialog: (log: TextLog, status: "pending" | "sent") => void;
}

// Helper function to get contact name from metadata
const getContactName = (phone: string, batch: TextBatch): string => {
  if (!batch.metadata?.allRecipients) return phone;

  // Normalize phone numbers for comparison (remove formatting)
  const normalizePhone = (phoneNum: string) => phoneNum.replace(/\D/g, "");
  const normalizedPhone = normalizePhone(phone);

  const recipient = batch.metadata.allRecipients.find(
    (r: Recipient) => normalizePhone(r.phone) === normalizedPhone
  );

  return recipient ? `${recipient.name} (${phone})` : phone;
};

const filterMessagesBySearch = (
  messages: TextLog[],
  searchTerm: string,
  batch: TextBatch
) => {
  if (!searchTerm.trim()) return messages;

  const term = searchTerm.toLowerCase().trim();
  return messages.filter((log) => {
    const contactDisplay = getContactName(
      log.recipient_phone,
      batch
    ).toLowerCase();
    return (
      contactDisplay.includes(term) ||
      log.recipient_phone.toLowerCase().includes(term)
    );
  });
};

export const IndividualMessagesList = ({
  batchId,
  batchDetails,
  batch,
  isLoading,
  searchTerm,
  onSearchChange,
  onClearSearch,
  onOpenDialog,
}: IndividualMessagesListProps) => {
  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Individual Messages:
        </Typography>
        {batchDetails && batchDetails.length > 0 && (
          <MessageSearchBar
            searchTerm={searchTerm}
            onSearchChange={onSearchChange}
            onClearSearch={onClearSearch}
          />
        )}
      </Box>

      {isLoading ? (
        <Box sx={{ textAlign: "center", py: 4 }}>
          <CircularProgress size={24} sx={{ mb: 1 }} />
          <Typography variant="body2" color="text.secondary">
            Loading message details...
          </Typography>
        </Box>
      ) : batchDetails ? (
        (() => {
          const filteredMessages = filterMessagesBySearch(
            batchDetails,
            searchTerm,
            batch
          );
          const sortedMessages = filteredMessages.sort((a, b) => {
            // Define the order: undelivered first, then failed, then pending (sent), then delivered
            const statusOrder = {
              undelivered: 0,
              failed: 1,
              sent: 2,
              delivered: 3,
            };
            const aOrder =
              statusOrder[a.status.toLowerCase() as keyof typeof statusOrder] ??
              4;
            const bOrder =
              statusOrder[b.status.toLowerCase() as keyof typeof statusOrder] ??
              4;
            return aOrder - bOrder;
          });

          return (
            <Box>
              {searchTerm && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 1, display: "block" }}
                >
                  Showing {filteredMessages.length} of {batchDetails.length}{" "}
                  messages
                </Typography>
              )}
              <Box sx={{ maxHeight: 384, overflowY: "auto" }}>
                {sortedMessages.length > 0 ? (
                  sortedMessages.map((log) => (
                    <IndividualMessageCard
                      key={log.id}
                      log={log}
                      batch={batch} // Pass batch to access metadata
                      onOpenDialog={onOpenDialog}
                    />
                  ))
                ) : (
                  <Box sx={{ textAlign: "center", py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No messages found matching "{searchTerm}"
                    </Typography>
                  </Box>
                )}
              </Box>
            </Box>
          );
        })()
      ) : (
        <Typography variant="body2" color="text.secondary">
          Click to expand and view individual messages
        </Typography>
      )}
    </Box>
  );
};
