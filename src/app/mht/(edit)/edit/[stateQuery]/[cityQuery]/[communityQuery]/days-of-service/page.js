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
import { CustomDaysOfServiceContent } from "@/views/dayOfService/CustomDaysOfService";
import Loading from "@/components/util/Loading";
const DaysOfServicePage = ({ params }) => {
  const { stateQuery, cityQuery, communityQuery } = params;
  const [contentEditMode, setContentEditMode] = useState(false);
  const [form, setForm] = useState(null);

  const { community, hasLoaded, updateCommunity } = useCommunity(
    communityQuery,
    cityQuery,
    stateQuery,
    communityTemplate,
    true
  );

  // Handle saving content changes
  const handleContentSave = async (contentData) => {
    if (!community) return;

    try {
      // Ensure all fields, including mapUrl, are included in the update
      const updatedDaysOfService = {
        ...(community.daysOfService || {}),
        secondaryHeaderText: contentData.secondaryHeaderText,
        daysOfServiceImage: contentData.daysOfServiceImage, // Explicitly include mapUrl
        bodyContent: contentData.bodyContent,
      };

      // Update the community with the new daysOfService object
      await updateCommunity({
        daysOfService: updatedDaysOfService,
      });

      toast.success("Content updated successfully");
      setContentEditMode(false);
    } catch (error) {
      console.error("Error saving content:", error);
      toast.error("Failed to update content");
    }
  };

  const handleSubmit = async (data) => {
    // Handle form submission
  };

  const handleSaveForm = async (formConfig) => {};

  // Check if user has permission to edit (simplified example)
  const userCanEdit = true; // Replace with actual permission check

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
    <>
      <CustomDaysOfServiceContent
        isEditMode
        onSave={handleContentSave}
        initialContent={community?.daysOfService || {}}
      />
      <Container maxWidth="lg" className="p-8">
        <SignUpForm
          isEdit
          form={form}
          signUpFormId={community?.volunteerSignUpId}
          handleSubmit={handleSubmit}
          defaultConfgig={{}}
          onClose={() => {}}
        />
      </Container>
    </>
  );
};

export default DaysOfServicePage;
