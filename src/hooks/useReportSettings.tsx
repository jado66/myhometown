"use client";

import { useState } from "react";

interface ReportSettings {
  includedFields: {
    property_owner: boolean;
    address: boolean;
    // Add other fields as needed
  };
  anonymizePII: boolean;
}

export function useReportSettings() {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [reportType, setReportType] = useState<
    "singleReport" | "summaryReport"
  >("singleReport");
  const [currentProjectId, setCurrentProjectId] = useState<string | undefined>(
    undefined
  );
  const [onGenerateCallback, setOnGenerateCallback] = useState<
    ((settings: ReportSettings) => void) | null
  >(null);

  const openReportDialog = (
    type: "singleReport" | "summaryReport",
    projectId?: string,
    onGenerate?: (settings: ReportSettings) => void
  ) => {
    setReportType(type);
    setCurrentProjectId(projectId);
    setOnGenerateCallback(() => onGenerate || null);
    setDialogOpen(true);
  };

  const closeReportDialog = () => {
    setDialogOpen(false);
  };

  const handleGenerate = (settings: ReportSettings) => {
    if (onGenerateCallback) {
      onGenerateCallback(settings);
    }
  };

  return {
    dialogOpen,
    reportType,
    currentProjectId,
    openReportDialog,
    closeReportDialog,
    handleGenerate,
  };
}
