"use client";
import { useEffect, useState } from "react";
import {
  Container,
  CircularProgress,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Paper,
} from "@mui/material";
import { useCommunities } from "@/hooks/use-communities";
import { useFormResponses } from "@/hooks/useFormResponses";
import { FormResponseTable } from "@/components/FormResponseTable"; // Import the new component

const DaysOfServicePage = ({ params, daysOfService }) => {
  const { communityId } = params;
  const [community, setCommunity] = useState(null);
  const [responses, setResponses] = useState([]);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const { getCommunity } = useCommunities();
  const {
    getFormById,
    getFormResponses,
    loading: formLoading,
    error: formError,
  } = useFormResponses();

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Get the community first
        const communityData = await getCommunity(communityId);
        setCommunity(communityData);

        if (communityData?.volunteerSignUpId) {
          // 2. Get the form configuration using the new hook
          const formConfigData = await getFormById(
            communityData.volunteerSignUpId
          );

          if (!formConfigData)
            throw new Error("Failed to fetch form configuration");

          // Transform the data to match the expected format for FormResponseTable
          const formattedFormData = {
            form_config: formConfigData.form_config || {},
            field_order: formConfigData.field_order || [],
          };

          setFormData(formattedFormData);

          // 3. Get the form responses using the new hook
          const responseData = await getFormResponses(
            communityData.volunteerSignUpId
          );

          setResponses(responseData || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [communityId]);

  const handleViewResponse = (responseData) => {
    setSelectedResponse(responseData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  if (loading || formLoading) {
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

  if (formError) {
    return (
      <Container>
        <Typography variant="h6" color="error">
          Error loading form data. Please try again later.
        </Typography>
      </Container>
    );
  }

  return (
    <Container>
      {community?.volunteerSignUpId && formData && (
        <>
          <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
            <Typography variant="h4" component="h1" gutterBottom>
              {community.name} Days Of Service Volunteers
            </Typography>
            <Typography variant="body1" color="textSecondary">
              Volunteer signups organized by day of service
            </Typography>
          </Paper>

          {responses.length > 0 ? (
            <FormResponseTable
              formId={community.volunteerSignUpId}
              responses={responses}
              formData={formData}
              onViewResponse={handleViewResponse}
              daysOfService={daysOfService}
            />
          ) : (
            <Paper sx={{ p: 3 }}>
              <Typography variant="body1">
                No volunteer responses have been submitted yet.
              </Typography>
            </Paper>
          )}

          {/* Response details dialog */}
          <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
          >
            <DialogTitle>Response Details</DialogTitle>
            <DialogContent>
              {selectedResponse && (
                <Box sx={{ my: 2 }}>
                  {formData.field_order.map((fieldId) => {
                    const field = formData.form_config[fieldId];
                    if (!field) return null;

                    let displayValue = selectedResponse[fieldId];

                    // Handle array of objects (like minorVolunteers)
                    if (
                      Array.isArray(displayValue) &&
                      displayValue.length > 0 &&
                      typeof displayValue[0] === "object"
                    ) {
                      // For minorVolunteers array specifically
                      if (fieldId === "minorVolunteers") {
                        return (
                          <Box key={fieldId} sx={{ mb: 2 }}>
                            <Typography
                              variant="subtitle2"
                              color="textSecondary"
                            >
                              {field.label || "Minor Volunteers"}
                            </Typography>
                            {displayValue.map((volunteer, index) => (
                              <Box key={index} sx={{ ml: 2, mb: 1 }}>
                                <Typography variant="body1">
                                  Name: {volunteer.name}, Age: {volunteer.age},
                                  Hours: {volunteer.hours}
                                </Typography>
                              </Box>
                            ))}
                          </Box>
                        );
                      }

                      // For other object arrays
                      return (
                        <Box key={fieldId} sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="textSecondary">
                            {field.label || fieldId}
                          </Typography>
                          <Typography variant="body1">
                            {JSON.stringify(displayValue)}
                          </Typography>
                        </Box>
                      );
                    }

                    // Format other values based on field type
                    if (displayValue === null || displayValue === undefined) {
                      displayValue = "-";
                    } else if (
                      fieldId === "volunteerSignature" &&
                      typeof displayValue === "string" &&
                      displayValue.startsWith("data:image")
                    ) {
                      // Handle signature image
                      return (
                        <Box key={fieldId} sx={{ mb: 2 }}>
                          <Typography variant="subtitle2" color="textSecondary">
                            {field.label || "Signature"}
                          </Typography>
                          <Box
                            sx={{
                              mt: 1,
                              border: "1px solid #ccc",
                              p: 1,
                              maxWidth: "100%",
                            }}
                          >
                            <img
                              src={displayValue}
                              alt="Volunteer Signature"
                              style={{ maxWidth: "100%", maxHeight: "200px" }}
                            />
                          </Box>
                        </Box>
                      );
                    } else if (field.type === "checkbox") {
                      displayValue = displayValue ? "Yes" : "No";
                    } else if (field.type === "select" && field.options) {
                      const option = field.options.find(
                        (opt) => opt.value === displayValue
                      );
                      displayValue = option ? option.label : displayValue;
                    } else if (field.type === "date" && displayValue) {
                      displayValue = new Date(
                        displayValue
                      ).toLocaleDateString();
                    } else if (typeof displayValue === "object") {
                      // For all other objects, stringify them
                      displayValue = JSON.stringify(displayValue);
                    }

                    return (
                      <Box key={fieldId} sx={{ mb: 2 }}>
                        <Typography variant="subtitle2" color="textSecondary">
                          {field.label}
                        </Typography>
                        <Typography variant="body1">{displayValue}</Typography>
                      </Box>
                    );
                  })}
                </Box>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseDialog}>Close</Button>
            </DialogActions>
          </Dialog>
        </>
      )}

      {!community?.volunteerSignUpId && (
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
