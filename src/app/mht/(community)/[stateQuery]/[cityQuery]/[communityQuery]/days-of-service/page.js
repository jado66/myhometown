"use client";
import { DaysOfServiceContent } from "@/views/dayOfService/DaysOfService";
import { communityTemplate } from "@/constants/templates/communityTemplate";
import useCommunity from "@/hooks/use-community";
import { useEffect, useState } from "react";
import { useCustomForms } from "@/hooks/useCustomForm";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { SignUpForm } from "@/components/SignUpForm";
import { Container, Typography, Box, Divider, Button } from "@mui/material";
import { Alert, AlertTitle } from "@mui/material";
import { CustomDaysOfServiceContent } from "@/views/dayOfService/CustomDaysOfService";
import Loading from "@/components/util/Loading";
import { useFormResponses } from "@/hooks/useFormResponses";

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

  useEffect(() => {
    // Check if the page has loaded and if there's a hash in the URL
    if (hasLoaded && typeof window !== "undefined") {
      // Get the hash from the URL (without the #)
      const hash = window.location.hash.replace("#", "");

      if (hash) {
        // Find the element with the matching ID

        // set timeout
        setTimeout(() => {
          const element = document.getElementById(hash);

          if (element) {
            const headerOffset = 100;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition =
              elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
          }
        }, 1500);
      }
    }
  }, [hasLoaded]);

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

        // reset form
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
      <Container
        maxWidth="lg"
        className="p-8"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "80vh",
        }}
      >
        <Loading size={100} />
      </Container>
    );
  }

  return (
    <Box className="min-h-screen bg-gray-50">
      <CustomDaysOfServiceContent
        isEditMode={false}
        onSave={() => alert("Can't save in view mode")}
        initialContent={community?.daysOfService || {}}
      />

      {community?.isDaysOfServiceVisibilityFormVisible && (
        <>
          <Divider sx={{ my: 4 }} />
          <Container maxWidth="lg" className="p-8" id="form">
            {submitSuccess ? (
              <>
                <Alert sx={{ my: 4 }}>
                  <AlertTitle>Success!</AlertTitle>
                  Thank you for signing up. Your volunteer registration has been
                  submitted successfully.
                </Alert>
                <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={() => {
                      setSubmitSuccess(false);
                      setSubmitError("");
                    }}
                  >
                    Sign Up Another Volunteer
                  </Button>
                </Box>
              </>
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
                    isFormVisible={
                      community?.isDaysOfServiceVisibilityFormVisible
                    }
                  />
                )}
              </>
            )}
          </Container>
        </>
      )}
    </Box>
  );
};

export default DaysOfServicePage;
