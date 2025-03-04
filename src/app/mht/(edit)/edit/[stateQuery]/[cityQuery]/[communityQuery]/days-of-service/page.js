"use client";
import { DaysOfServiceContent } from "@/views/dayOfService/DaysOfService";
import { communityTemplate } from "@/constants/templates/communityTemplate";
import useCommunity from "@/hooks/use-community";
import { useEffect, useState } from "react";
import { useCustomForms } from "@/hooks/useCustomForm";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { SignUpForm } from "@/components/SignUpForm";
import { Container, Divider } from "@mui/material";

const DaysOfServicePage = ({ params }) => {
  const { stateQuery, cityQuery, communityQuery } = params;
  const [headerText, setHeaderText] = useState("");
  const [headerImage, setHeaderImage] = useState("");
  const [formId, setFormId] = useState("");
  const [form, setForm] = useState(null);
  const [isEditing, setIsEditing] = useState(true);

  const { community, hasLoaded, updateCommunity } = useCommunity(
    communityQuery,
    cityQuery,
    stateQuery,
    communityTemplate,
    true
  );

  const { addForm, updateForm, getFormById } = useCustomForms();

  const handleVolunteerFormSave = async (form) => {
    if (!community) return;

    try {
      let finalFormId = formId;

      setForm(form);

      // If we don't have a form ID, create a new form
      if (!community.volunteerSignUpId) {
        const newForm = await addForm(
          `${community.name} Volunteer Sign Up Form`,
          form.formConfig,
          form.fieldOrder // Default field order
        );

        if (newForm) {
          finalFormId = newForm.id;

          // Update community with new form ID
          await updateCommunity({
            volunteerSignUpId: newForm.id,
          });
        }
      } else {
        // Update existing form
        await updateForm(community.volunteerSignUpId, {
          form_config: form.formConfig,
          field_order: form.fieldOrder,
        });
      }
    } catch (error) {
      console.error("Error saving volunteer form:", error);
    }

    setIsEditing(false);
  };

  useEffect(() => {
    if (community?.volunteerSignUpId) {
      getFormById(community.volunteerSignUpId).then((f) => {
        setForm(f);
      });
    }
  }, [community]);

  return (
    <>
      <DaysOfServiceContent />

      {/* <Divider sx={{ my: 2, width: "100%" }} /> */}

      {/* <Container
        maxWidth="lg"
        sx={{
          padding: { md: 4, xs: 3 },
        }}
      >
        <SignUpForm
          isEdit={isEditing}
          onClose={handleVolunteerFormSave}
          form={form}
          signUpFormId={community?.volunteerSignUpId}
          handleSubmit={() => alert("Can't submit in edit mode")}
        />
      </Container> */}
    </>
  );
};

export default DaysOfServicePage;
