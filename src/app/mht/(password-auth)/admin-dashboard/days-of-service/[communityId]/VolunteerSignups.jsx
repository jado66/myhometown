"use client";

import { useEffect, useState } from "react";
import {
  Container,
  CircularProgress,
  Typography,
  Box,
  Paper,
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from "@mui/material";
import moment from "moment";

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

const newToOldCommunity = {
  "a78e8c7c-eca4-4f13-b6c8-e5603d1c36da": "66a811814800d08c300d88fd", // Orem - Geneva Heights
  "a6c19a50-7fc3-4759-b386-6ebdeca3ed9e":
    "fb34e335-5cc6-4e6c-b5fc-2b64588fe921", // Orem - Sharon Park
  "b3381b98-e44f-4f1f-b067-04e575c515ca": "66df56bef05bd41ef9493f33", // Provo - Pioneer Park
  "7c446e80-323d-4268-b595-6945e915330f": "66df56e6f05bd41ef9493f34", // Provo - Dixon
  "7c8731bc-1aee-406a-9847-7dc1e5255587": "66df5707f05bd41ef9493f35", // Provo - South Freedom
  "0806b0f4-9d56-4c1f-b976-ee04f60af194": "66df577bf05bd41ef9493f37", // Ogden - North
  "bf4a7d58-b880-4c18-b923-6c89e2597c71": "66df5790f05bd41ef9493f38", // Ogden - South
  "0bdf52a4-2efa-465b-a3b1-5ec4d1701967": "66df57a2f05bd41ef9493f39", // Ogden - West
  "995c1860-9d5b-472f-a206-1c2dd40947bd": "66df57b3f05bd41ef9493f3a", // Salt Lake City - Central
  "af0df8f5-dab7-47e4-aafc-9247fee6f29d": "66df57c2f05bd41ef9493f3b", // Salt Lake City - Northwest
  "5de22b0b-5dc8-4d72-b424-95b0d1c94fcc": "66df57d1f05bd41ef9493f3c", // Salt Lake City - Westside
  "252cd4b1-830c-4cdb-913f-a1460f218616": "66df57e6f05bd41ef9493f3d", // West Valley City - Central Granger
  "7d059ebc-78ee-4b47-97ab-276ae480b8de": "6838adb32243dc8160ce207d", // Layton - Layton
  "4687e12e-497f-40a2-ab1b-ab455f250fce": "66df57faf05bd41ef9493f3e", // West Valley City - North East Granger
  "2bc57e19-0c73-4781-9fc6-ef26fc729847": "66df580bf05bd41ef9493f3f", // West Valley City - West Granger
  "0076ad61-e165-4cd0-b6af-f4a30af2510c": "66df581af05bd41ef9493f40", // West Valley City - Central Valley View
  "724b1aa6-0950-40ba-9453-cdd80085c5d4": "6876c09a2a087f662c17feed", // Santaquin - Santaquin
  "dcf35fbc-8053-40fa-b4a4-faaa61e2fbef": "6912655528c9b9c20ee4dede",
};

const DaysOfServicePage = ({
  params,
  daysOfService,
  generateCommunityReport,
  cityName,
  view = "summary",
  selectedDayId = null,
}) => {
  const { communityId } = params;
  const [localDayId, setLocalDayId] = useState("");

  // Custom hooks
  const {
    community,
    formConfig,
    loading: communityLoading,
  } = useCommunityData(newToOldCommunity[communityId] || communityId);

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

  // Load responses when community is ready
  useEffect(() => {
    if (!responsesLoaded && community?.volunteerSignUpId) {
      loadResponses();
    }
  }, [responsesLoaded, community, loadResponses]);

  // Filter project summary and responses by selected day
  const filteredProjectSummary = localDayId
    ? projectSummary.filter((p) => p.dayOfServiceId === localDayId)
    : projectSummary;

  const filteredDaysOfService = localDayId
    ? (daysOfService || []).filter((d) => d.id === localDayId)
    : daysOfService || [];

  const filteredResponses = localDayId
    ? (responses || []).filter(
        (r) => (r.response_data || r).dayOfService === localDayId,
      )
    : responses;

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
          <Paper elevation={0} sx={{ my: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {cityName} {community.name} Days Of Service
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Projects and volunteer participation overview
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2 }}>
              Total Community Volunteer Hours:{" "}
              <strong>
                {Number(totalVolunteerHours).toLocaleString(undefined, {
                  maximumFractionDigits: 0,
                })}
              </strong>
            </Typography>
          </Paper>

          <Divider sx={{ mb: 4 }} />

          {/* Projects Summary Section */}
          {view === "summary" && (
            <ProjectsSummarySection
              projectSummary={filteredProjectSummary}
              generateCommunityReport={generateCommunityReport}
            />
          )}

          {/* Volunteer Signups Section */}
          {view === "volunteers" && (
            <>
              {/* Day of Service Picker */}
              {(daysOfService || []).length > 1 && (
                <>
                  <Typography
                    variant="subtitle2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    Filter by Day of Service
                  </Typography>
                  <FormControl size="small" sx={{ minWidth: 280, mb: 2 }}>
                    <InputLabel id="volunteers-dos-label">
                      Day of Service
                    </InputLabel>
                    <Select
                      labelId="volunteers-dos-label"
                      value={localDayId}
                      label="Day of Service"
                      onChange={(e) => setLocalDayId(e.target.value)}
                    >
                      {(daysOfService || [])
                        .slice()
                        .sort(
                          (a, b) => new Date(a.end_date) - new Date(b.end_date),
                        )
                        .map((day) => (
                          <MenuItem key={day.id} value={day.id}>
                            {moment(day.end_date).format("MMM DD, YYYY")}
                            {day.name ? ` — ${day.name}` : ""}
                          </MenuItem>
                        ))}
                    </Select>
                  </FormControl>
                  <Divider sx={{ mb: 3 }} />
                </>
              )}

              <VolunteersNeededSection
                projects={filteredProjectSummary}
                daysOfService={filteredDaysOfService}
                responses={filteredResponses || []}
              />

              <Divider sx={{ my: 4 }} />

              <VolunteerSignupsSection
                formId={community.volunteerSignUpId}
                responses={filteredResponses}
                formConfig={formConfig}
                onViewResponse={handleViewResponse}
                onDeleteResponse={handleDeleteClick}
                daysOfService={daysOfService}
                projectsMap={projectsMap}
                isLoading={!responsesLoaded}
              />
            </>
          )}

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
