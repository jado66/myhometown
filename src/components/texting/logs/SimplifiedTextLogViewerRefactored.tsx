"use client";

import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import { Stack } from "@mui/material";
import { useTextLogs } from "@/hooks/useTextLogs";
import { StatusDialog } from "./StatusDialog";
import { BatchCard } from "./BatchCard";
import { PaginationControls } from "./PaginationControls";
import { LoadingState, EmptyState } from "./LoadingAndEmptyStates";
import { TextLog, TextBatch } from "./types";

interface TextBatchViewerProps {
  userId: string;
  userCommunities?: string[];
  userCities?: string[];
  isAdmin?: boolean;
}

export function TextBatchViewer({
  userId,
  userCommunities = [],
  userCities = [],
  isAdmin = false,
}: TextBatchViewerProps) {
  const theme = useTheme();
  const { logs, loading, error, fetchTextLogs, fetchBatchDetails } =
    useTextLogs();
  const [expandedBatches, setExpandedBatches] = useState<Set<string>>(
    new Set()
  );
  const [batchDetails, setBatchDetails] = useState<Record<string, TextLog[]>>(
    {}
  );
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());

  // Search state for individual numbers
  const [searchTerms, setSearchTerms] = useState<Record<string, string>>({});

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<TextLog | null>(null);
  const [dialogStatus, setDialogStatus] = useState<"pending" | "sent">(
    "pending"
  );

  const handleOpenDialog = (log: TextLog, status: "pending" | "sent") => {
    setSelectedLog(log);
    setDialogStatus(status);
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setSelectedLog(null);
  };

  // Search handlers
  const handleSearchChange = (batchId: string, searchTerm: string) => {
    setSearchTerms((prev) => ({
      ...prev,
      [batchId]: searchTerm,
    }));
  };

  const clearSearch = (batchId: string) => {
    setSearchTerms((prev) => {
      const newTerms = { ...prev };
      delete newTerms[batchId];
      return newTerms;
    });
  };

  // Pagination handlers
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    page: number
  ) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (event: any) => {
    setPageSize(event.target.value);
    setCurrentPage(1); // Reset to first page when changing page size
  };

  // Fetch data when pagination changes
  React.useEffect(() => {
    fetchTextLogs({
      page: currentPage,
      limit: pageSize,
    });
  }, [currentPage, pageSize, fetchTextLogs]);

  const toggleBatch = async (batchId: string) => {
    const newExpanded = new Set(expandedBatches);

    if (expandedBatches.has(batchId)) {
      newExpanded.delete(batchId);
    } else {
      newExpanded.add(batchId);

      // Fetch batch details if not already loaded
      if (!batchDetails[batchId]) {
        setLoadingDetails((prev) => new Set(prev).add(batchId));
        try {
          const details = await fetchBatchDetails(batchId);
          setBatchDetails((prev) => ({ ...prev, [batchId]: details }));
        } catch (err) {
          console.error("Error fetching batch details:", err);
        } finally {
          setLoadingDetails((prev) => {
            const newSet = new Set(prev);
            newSet.delete(batchId);
            return newSet;
          });
        }
      }
    }

    setExpandedBatches(newExpanded);
  };

  const renderBatchSection = (title: string, batches: TextBatch[]) => {
    if (!batches || batches.length === 0) return null;

    const totalCount = logs.totalCounts.allUserLogs || 0;
    const totalPages = Math.ceil(totalCount / pageSize);

    return (
      <Box sx={{ mb: 4 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title} ({totalCount} total)
          </Typography>
          <PaginationControls
            currentPage={currentPage}
            totalPages={totalPages}
            pageSize={pageSize}
            onPageChange={handlePageChange}
            onPageSizeChange={handlePageSizeChange}
          />
        </Box>

        {batches.map((batch) => (
          <BatchCard
            key={batch.id}
            batch={batch}
            isExpanded={expandedBatches.has(batch.id)}
            batchDetails={batchDetails[batch.id]}
            isLoadingDetails={loadingDetails.has(batch.id)}
            searchTerm={searchTerms[batch.id] || ""}
            onToggleBatch={() => toggleBatch(batch.id)}
            onSearchChange={(searchTerm) =>
              handleSearchChange(batch.id, searchTerm)
            }
            onClearSearch={() => clearSearch(batch.id)}
            onOpenDialog={handleOpenDialog}
          />
        ))}

        {totalPages > 1 && (
          <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              pageSize={pageSize}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
            />
          </Box>
        )}
      </Box>
    );
  };

  // Show loading or error states
  if (loading || error) {
    return <LoadingState isLoading={loading} error={error} />;
  }

  const hasNoBatches =
    (!logs.userLogs || logs.userLogs.length === 0) &&
    Object.keys(logs.communityLogs).length === 0 &&
    Object.keys(logs.cityLogs).length === 0;

  return (
    <Box sx={{ p: 3, flexGrow: 1, position: "relative" }}>
      {loading && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <Box sx={{ textAlign: "center" }}>
            <CircularProgress size={32} sx={{ mb: 2 }} />
            <Typography>Loading batches...</Typography>
          </Box>
        </Box>
      )}

      <Stack spacing={4}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <Box>
            <Typography
              variant="h4"
              component="h2"
              fontWeight="bold"
              sx={{ mt: 5 }}
            >
              Text Message Batches
            </Typography>
            {logs.totalCounts.allUserLogs > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                Page {currentPage} of{" "}
                {Math.ceil(logs.totalCounts.allUserLogs / pageSize)}• Showing{" "}
                {pageSize} per page
              </Typography>
            )}
          </Box>
        </Box>

        {Object.entries(logs.communityLogs).map(([communityId, batches]) =>
          renderBatchSection(`All Messages`, batches as TextBatch[])
        )}

        {hasNoBatches && <EmptyState currentPage={currentPage} />}
      </Stack>

      <StatusDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        log={selectedLog}
        status={dialogStatus}
      />
    </Box>
  );
}
