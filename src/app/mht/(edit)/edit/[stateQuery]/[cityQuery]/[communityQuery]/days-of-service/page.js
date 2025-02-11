"use client";
import { DaysOfServiceContent } from "@/views/dayOfService/DaysOfService";
import { communityTemplate } from "@/constants/templates/communityTemplate";
import useCommunity from "@/hooks/use-community";
import { VolunteerSignUps } from "@/components/VolunteerSignUps";
import { useState } from "react";
import { useCustomForms } from "@/hooks/useCustomForm";
// import JsonViewer from "@/components/util/debug/DebugOutput";

const DaysOfServicePage = ({ params }) => {
  const { stateQuery, cityQuery, communityQuery } = params;
  const [headerText, setHeaderText] = useState("");
  const [headerImage, setHeaderImage] = useState("");
  const [formId, setFormId] = useState("");

  const { community, hasLoaded, updateCommunity } = useCommunity(
    communityQuery,
    cityQuery,
    stateQuery,
    communityTemplate,
    true
  );

  const { addForm, updateForm } = useCustomForms();

  const handleVolunteerFormSave = async (form) => {
    if (!community) return;

    try {
      let finalFormId = formId;

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
  };

  return (
    <>
      <DaysOfServiceContent />

      {/* <JsonViewer data={community} /> */}

      <VolunteerSignUps
        isEdit
        volunteerHeaderText={headerText}
        volunteerHeaderImage={headerImage}
        setVolunteerHeaderText={setHeaderText}
        setVolunteerHeaderImage={setHeaderImage}
        signUpFormId={community?.volunteerSignUpId || ""}
        setSignUpFormId={setFormId}
        onClose={handleVolunteerFormSave}
      />
    </>
  );
};

export default DaysOfServicePage;
