"use client";

import React from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import { IndividualMessageCard } from "./IndividualMessageCard";
import { MessageSearchBar } from "./MessageSearchBar";
import { TextLog } from "./types";

interface IndividualMessagesListProps {
  batchId: string;
  batchDetails: TextLog[] | undefined;
  isLoading: boolean;
  searchTerm: string;
  onSearchChange: (searchTerm: string) => void;
  onClearSearch: () => void;
  onOpenDialog: (log: TextLog, status: "pending" | "sent") => void;
}

const filterMessagesBySearch = (messages: TextLog[], searchTerm: string) => {
  if (!searchTerm.trim()) return messages;

  const term = searchTerm.toLowerCase().trim();
  return messages.filter((log) =>
    log.recipient_phone.toLowerCase().includes(term)
  );
};

export const IndividualMessagesList = ({
  batchId,
  batchDetails,
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
            searchTerm
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
