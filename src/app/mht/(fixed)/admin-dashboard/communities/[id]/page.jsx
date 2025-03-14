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
} from "@mui/material";
import { useCommunities } from "@/hooks/use-communities";
import { FormResponseTable } from "@/components/FormResponseTable";
import { supabase } from "@/util/supabase";

const DaysOfServicePage = ({ params }) => {
  const { id } = params;
  const [community, setCommunity] = useState(null);
  const [responses, setResponses] = useState([]);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedResponse, setSelectedResponse] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);

  const { getCommunity } = useCommunities();

  useEffect(() => {
    const loadData = async () => {
      try {
        // 1. Get the community first
        const communityData = await getCommunity(id);
        setCommunity(communityData);

        if (communityData?.volunteerSignUpId) {
          // 2. Get the form configuration
          const { data: formConfigData, error: formError } = await supabase
            .from("forms")
            .select("*")
            .eq("id", communityData.volunteerSignUpId)
            .single();

          if (formError) throw formError;

          // Transform the data to match the expected format for FormResponseTable
          const formattedFormData = {
            form_config: formConfigData.form_config || {},
            field_order: formConfigData.field_order || [],
          };

          setFormData(formattedFormData);

          // 3. Get the form responses
          const { data: responseData, error: responseError } = await supabase
            .from("form_responses")
            .select("*")
            .eq("form_id", communityData.volunteerSignUpId)
            .order("created_at", { ascending: false });

          if (responseError) throw responseError;

          setResponses(responseData || []);
        }
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [id, getCommunity]);

  const handleViewResponse = (responseData) => {
    setSelectedResponse(responseData);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
  };

  if (loading) {
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
    <Container>
      {community?.volunteerSignUpId && formData && (
        <>
          <Typography variant="h4" component="h1" gutterBottom>
            Days Of Service Volunteers
          </Typography>

          {responses.length > 0 ? (
            <FormResponseTable
              formId={community.volunteerSignUpId}
              responses={responses}
              formData={formData}
              onViewResponse={handleViewResponse}
            />
          ) : (
            <Typography variant="body1">
              No volunteer responses have been submitted yet.
            </Typography>
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

                    // Format the value based on field type
                    if (displayValue === null || displayValue === undefined) {
                      displayValue = "-";
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
        <Typography variant="body1">
          No volunteer sign-up form has been created for this community.
        </Typography>
      )}
    </Container>
  );
};

export default DaysOfServicePage;
