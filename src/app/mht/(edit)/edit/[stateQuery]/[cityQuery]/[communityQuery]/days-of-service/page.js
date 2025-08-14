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
import { toast } from "react-toastify";

const DaysOfServicePage = ({ params }) => {
  const { stateQuery, cityQuery, communityQuery } = params;
  const [contentEditMode, setContentEditMode] = useState(false);
  const [form, setForm] = useState(null);
  const [formId, setFormId] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  // Initialize the custom forms hook
  const { addForm, updateForm, getFormById } = useCustomForms();

  // Initialize form responses hook
  const {
    submitResponse,
    response,
    loading: responseLoading,
  } = useFormResponses();

  const { community, hasLoaded, updateCommunity } = useCommunity(
    communityQuery,
    cityQuery,
    stateQuery,
    communityTemplate,
    true
  );

  // Fetch the existing form if available
  useEffect(() => {
    if (community?.volunteerSignUpId && hasLoaded) {
      const fetchForm = async () => {
        const formData = await getFormById(community.volunteerSignUpId);
        if (formData) {
          setForm(formData);
          setFormId(formData.id);
        }
      };

      fetchForm();
    }
  }, [community, hasLoaded]);

  // Handle saving content changes
  const handleContentSave = async (contentData) => {
    if (!community) return;

    try {
      // Ensure all fields, including mapUrl, are included in the update
      const updatedDaysOfService = {
        ...(community.daysOfService || {}),
        secondaryHeaderText: contentData.secondaryHeaderText,
        daysOfServiceImage: contentData.daysOfServiceImage,
        bodyContent: contentData.bodyContent,
        wysiwygContent: contentData.wysiwygContent,
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

  const toggleDaysOfServiceVisibility = () => {
    updateCommunity({
      isDaysOfServiceVisibilityFormVisible:
        !community.isDaysOfServiceVisibilityFormVisible,
    });

    toast.success(
      community.isDaysOfServiceVisibilityFormVisible
        ? "Days of Service form is now hidden"
        : "Days of Service form is now visible"
    );
  };

  const handleSubmit = async (data) => {
    // Handle form submission for volunteers
    if (!formId) {
      toast.error("Form ID is missing");
      return;
    }

    setSubmitting(true);
    try {
      // Submit the form data
      const result = await submitResponse(formId, data);

      if (result) {
        toast.success("Form submitted successfully");

        //
        // You might want to reset the form or redirect the user
      } else {
        toast.error("Failed to submit form");
      }
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("An error occurred while submitting the form");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSaveForm = async (formConfig) => {
    try {
      let savedForm;

      // If we already have a form ID, update the existing form
      if (formId) {
        savedForm = await updateForm(formId, {
          form_name: "Volunteer Sign Up Form",
          form_config: formConfig.formConfig,
          field_order: formConfig.fieldOrder,
        });
      } else {
        // Create a new form
        savedForm = await addForm(
          "Volunteer Sign Up Form",
          formConfig.formConfig,
          formConfig.fieldOrder
        );

        // If the form was saved successfully, update the community with the form ID
        if (savedForm) {
          await updateCommunity({
            volunteerSignUpId: savedForm.id,
          });
        }

        toast.success("Form created successfully");
      }

      // Update state with the saved form
      if (savedForm) {
        setForm(savedForm);
        setFormId(savedForm.id);

        setTimeout(() => {
          //refresh the page
          window.location.reload();
        }, 1000);
      }
    } catch (error) {
      console.error("Error saving form:", error);
      toast.error("Failed to save form");
    }
  };

  // Check if user has permission to edit (simplified example)
  const userCanEdit = true; // Replace with actual permission check

  const pathToForm = window.location.pathname + "#form";

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
      <JsonViewer data={community} />
      <CustomDaysOfServiceContent
        isEditMode={userCanEdit}
        onSave={handleContentSave}
        initialContent={community?.daysOfService || {}}
      />
      <Container maxWidth="lg" className="p-8">
        <SignUpForm
          isEdit={userCanEdit}
          form={form}
          signUpFormId={community?.volunteerSignUpId}
          handleSubmit={handleSubmit}
          onClose={handleSaveForm}
          isSubmitting={submitting}
          formLink={pathToForm}
          initialValues={response?.response_data || {}}
          toggleDaysOfServiceVisibility={toggleDaysOfServiceVisibility}
          isFormVisible={community?.isDaysOfServiceVisibilityFormVisible}
        />
      </Container>
    </>
  );
};

export default DaysOfServicePage;
