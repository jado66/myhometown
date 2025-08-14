"use client";

import { useState, useEffect } from "react";
import {
  Container,
  CircularProgress,
  Typography,
  Box,
  Paper,
} from "@mui/material";

// Custom hooks
import { useCommunityData } from "@/hooks/useCommunityData";
import { useProjectSummary } from "@/hooks/useProjectSummary";
import { useVolunteerResponses } from "@/hooks/useVolunteerResponses";

// Component imports
import ProjectsSummarySection from "./components/ProjectsSummarySection";
import OrganizationSummarySection from "./components/OrganizationSummarySection";
import VolunteerSignupsSection from "./components/VolunteerSignupsSection";
import VolunteersNeededSection from "./components/VolunteersNeededSection";
import ResponseDetailsDialog from "./components/ResponseDetailsDialog";
import DeleteConfirmationDialog from "./components/DeleteConfirmationDialog";

const DaysOfServicePage = ({
  params,
  daysOfService,
  generateCommunityReport,
}) => {
  const { communityId } = params;

  // Accordion state
  const [volunteerAccordionOpen, setVolunteerAccordionOpen] = useState(false);
  const [volunteersNeededAccordionOpen, setVolunteersNeededAccordionOpen] =
    useState(false);
  const [projectsAccordionOpen, setProjectsAccordionOpen] = useState(false);
  const [organizationAccordionOpen, setOrganizationAccordionOpen] =
    useState(false);

  // Custom hooks
  const {
    community,
    formConfig,
    loading: communityLoading,
  } = useCommunityData(communityId);

  const {
    projectSummary,
    projectsMap,
    totalVolunteerHours,
    loading: projectsLoading,
  } = useProjectSummary(daysOfService);

  const {
    responses,
    responsesLoaded,
    selectedSubmissionId,
    fullSubmissionData,
    openDialog,
    deleteDialogOpen,
    responseToDelete,
    loading: responsesLoading,
    loadResponses,
    handleViewResponse,
    handleCloseDialog,
    handleDeleteClick,
    handleCloseDeleteDialog,
    handleConfirmDelete,
  } = useVolunteerResponses(community?.volunteerSignUpId);

  // Load responses when accordion is opened
  useEffect(() => {
    if (
      (volunteerAccordionOpen || volunteersNeededAccordionOpen) &&
      !responsesLoaded &&
      community?.volunteerSignUpId
    ) {
      loadResponses();
    }
  }, [
    volunteerAccordionOpen,
    volunteersNeededAccordionOpen,
    responsesLoaded,
    community,
    loadResponses,
  ]);

  // Accordion handlers
  const handleVolunteerAccordionChange = (event, expanded) => {
    setVolunteerAccordionOpen(expanded);
  };

  const handleVolunteersNeededAccordionChange = (event, expanded) => {
    setVolunteersNeededAccordionOpen(expanded);
  };

  const handleProjectsAccordionChange = (event, expanded) => {
    setProjectsAccordionOpen(expanded);
  };

  const handleOrganizationAccordionChange = (event, expanded) => {
    setOrganizationAccordionOpen(expanded);
  };

  // Loading state
  if (communityLoading || projectsLoading) {
    return (
      <Container>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          minHeight="200px"
        >
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="2xl">
      {community?.volunteerSignUpId && formConfig ? (
        <>
          <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {community.name} Days Of Service
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Projects and volunteer participation overview
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Total Community Volunteer Hours:{" "}
              <strong>{totalVolunteerHours}</strong>
            </Typography>
          </Paper>

          {/* Projects Summary Section */}
          <ProjectsSummarySection
            expanded={projectsAccordionOpen}
            onChange={handleProjectsAccordionChange}
            projectSummary={projectSummary}
            generateCommunityReport={generateCommunityReport}
          />

          {/* Organization Summary Section */}
          {/* <OrganizationSummarySection
            expanded={organizationAccordionOpen}
            onChange={handleOrganizationAccordionChange}
            projectSummary={projectSummary}
            generateCommunityReport={generateCommunityReport}
          /> */}

          {/* Volunteer Signups Section */}
          <VolunteerSignupsSection
            expanded={volunteerAccordionOpen}
            onChange={handleVolunteerAccordionChange}
            formId={community.volunteerSignUpId}
            responses={responses}
            formConfig={formConfig}
            onViewResponse={handleViewResponse}
            onDeleteResponse={handleDeleteClick}
            daysOfService={daysOfService}
            projectsMap={projectsMap}
            isLoading={volunteerAccordionOpen && !responsesLoaded}
          />

          {/* Volunteers Needed Chart Section */}
          <VolunteersNeededSection
            expanded={volunteersNeededAccordionOpen}
            onChange={handleVolunteersNeededAccordionChange}
            projects={projectSummary}
            daysOfService={daysOfService}
            responses={responses}
          />

          {/* Response Details Dialog */}
          <ResponseDetailsDialog
            open={openDialog}
            onClose={handleCloseDialog}
            fullSubmissionData={fullSubmissionData}
            formConfig={formConfig}
            selectedSubmissionId={selectedSubmissionId}
            onDelete={handleDeleteClick}
            formId={community.volunteerSignUpId}
          />

          {/* Delete Confirmation Dialog */}
          <DeleteConfirmationDialog
            open={deleteDialogOpen}
            onClose={handleCloseDeleteDialog}
            onConfirm={handleConfirmDelete}
          />
        </>
      ) : (
        <Paper sx={{ p: 3 }}>
          <Typography variant="body1">
            No volunteer sign-up form has been created for this community.
          </Typography>
        </Paper>
      )}
    </Container>
  );
};

export default DaysOfServicePage;
