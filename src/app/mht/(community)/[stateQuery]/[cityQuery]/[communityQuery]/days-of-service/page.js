"use client";
import { DaysOfServiceContent } from "@/views/dayOfService/DaysOfService";
import { communityTemplate } from "@/constants/templates/communityTemplate";
import useCommunity from "@/hooks/use-community";
import { useEffect, useState } from "react";
import { useCustomForms } from "@/hooks/useCustomForm";
import { useFormResponses } from "@/hooks/useFormResponses";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { SignUpForm } from "@/components/SignUpForm";
import { Container, Typography, Box, Divider } from "@mui/material";
import { Alert, AlertTitle } from "@mui/material";

const DaysOfServicePage = ({ params }) => {
  const { stateQuery, cityQuery, communityQuery } = params;
  const [form, setForm] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState("");

  const { community, hasLoaded } = useCommunity(
    communityQuery,
    cityQuery,
    stateQuery,
    communityTemplate,
    true
  );

  const defaultConfig = {
    signupForm: {},
  };

  const { getFormById } = useCustomForms();
  const { submitResponse } = useFormResponses();

  useEffect(() => {
    const loadForm = async () => {
      if (community?.volunteerSignUpId) {
        const formData = await getFormById(community.volunteerSignUpId);
        setForm(formData);
      }
    };

    loadForm();
  }, [community]);

  const handleSubmit = async (formData) => {
    if (!community?.volunteerSignUpId) {
      setSubmitError("Unable to submit form - missing form ID");
      return;
    }

    try {
      const response = await submitResponse(
        community.volunteerSignUpId,
        formData
      );

      if (response) {
        setSubmitSuccess(true);
        setSubmitError("");
      } else {
        setSubmitError("Failed to submit form. Please try again.");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      setSubmitError(
        "An error occurred while submitting the form. Please try again."
      );
    }
  };

  if (!hasLoaded) {
    return (
      <Container maxWidth="lg" className="p-8">
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  return (
    <Box className="min-h-screen bg-gray-50">
      <DaysOfServiceContent />

      <Divider sx={{ my: 4 }} />

      <JsonViewer data={{ defaultConfig }} />

      <Container maxWidth="lg" className="p-8">
        {submitSuccess ? (
          <Alert sx={{ my: 4 }}>
            <AlertTitle>Success!</AlertTitle>
            Thank you for signing up. Your volunteer registration has been
            submitted successfully.
          </Alert>
        ) : (
          <>
            {submitError && (
              <Alert variant="destructive" className="mb-8">
                <AlertTitle>Error</AlertTitle>
                {submitError}
              </Alert>
            )}

            {form && (
              <SignUpForm
                isEdit={false}
                form={form}
                signUpFormId={community?.volunteerSignUpId}
                handleSubmit={handleSubmit}
                defaultConfgig={{}}
              />
            )}
          </>
        )}
      </Container>
    </Box>
  );
};

export default DaysOfServicePage;
