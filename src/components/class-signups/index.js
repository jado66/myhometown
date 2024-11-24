"use client";

import {
  Container,
  Paper,
  Stack,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import VisibilityIcon from "@mui/icons-material/Visibility";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { ClassSignupProvider, useClassSignup } from "./ClassSignupContext";
import { EditClassSignupForm } from "./EditClassSignupForm";
import { ViewClassSignupForm } from "./ViewClassSignupForm";
import { FieldSelectorDialog } from "./FieldSelectorDialog";
import { useState } from "react";
import { ExampleIcons } from "@/components/events/ClassesTreeView/IconSelect";

function ClassSignupContent({
  category,
  onCreateSubclass,
  isEdit,
  isNew,
  classData,
}) {
  const [isEditMode, setIsEditMode] = useState(isEdit && isNew);
  const [isShowingFieldSelector, setIsShowingFieldSelector] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const { classConfig, handleSaveClass } = useClassSignup();

  const handleAccordionChange = (_, isExpanded) => {
    setExpanded(isExpanded);
  };

  return (
    <Accordion expanded={expanded} onChange={handleAccordionChange}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        sx={{
          "& .MuiAccordionSummary-content": {
            alignItems: "center",
          },
        }}
      >
        {classConfig.icon && ExampleIcons[classConfig.icon]}

        <Typography sx={{ marginLeft: "1em" }}>
          {classConfig.className}
        </Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Stack spacing={3}>
          <Stack direction="row" justifyContent="flex-end" alignItems="center">
            <Button
              variant="outlined"
              onClick={() => setIsEditMode(!isEditMode)}
              sx={{ ml: 2 }}
            >
              Edit Form
            </Button>

            <Button
              variant="contained"
              onClick={handleSaveClass}
              sx={{ ml: 2 }}
            >
              Save
            </Button>
          </Stack>

          <ViewClassSignupForm />

          <EditClassSignupForm
            isOpen={isEditMode}
            handleClose={() => setIsEditMode(false)}
            showFieldSelector={() => setIsShowingFieldSelector(true)}
          />
          <FieldSelectorDialog
            isOpen={isShowingFieldSelector}
            handleClose={() => setIsShowingFieldSelector(false)}
          />
        </Stack>
      </AccordionDetails>
    </Accordion>
  );
}

export default function CustomClassSignup({
  classObj,
  isEdit,
  isNew,
  handleCreateSubclass,
  category,
}) {
  // Handler for when a class is created
  const handleCreateClass = async (classData, classSignupForm) => {
    try {
      // Create the basic class info that will be returned to the parent
      const basicClassInfo = {
        id: classData.id,
        categoryId: category.id,
        title: classData.className,
        icon: classData.icon,
        classBannerUrl: classData.classBannerUrl,
        description: classData.description,
        startDate: classData.startDate,
        endDate: classData.endDate,
        meetings: classData.meetings,
        location: classData.location,
        capacity: classData.capacity,
        showCapacity: classData.showCapacity,
      };

      // Log the full class data
      console.log("Create class", classData);

      // Call the parent's handler with the basic info
      await handleCreateSubclass(basicClassInfo, classSignupForm);

      return true;
    } catch (error) {
      console.error("Failed to create class:", error);
      throw error;
    }
  };

  // Handler for editing an existing class
  const handleEditClass = async (id, data) => {
    try {
      console.log("Edit class", id, data);
      // Add your edit logic here
      return true;
    } catch (error) {
      console.error("Failed to edit class:", error);
      throw error;
    }
  };

  // Handler for form submissions
  const handleSubmitSignup = async (formData) => {
    try {
      // Process the signup
      console.log("Processing signup:", formData);
      // Add your signup processing logic here
      return true;
    } catch (error) {
      console.error("Failed to process signup:", error);
      throw error;
    }
  };

  return (
    <ClassSignupProvider
      classObj={classObj}
      onCreateSubclass={handleCreateClass}
      onEditSubclass={handleEditClass}
      onSubmitSignup={handleSubmitSignup}
      isEdit={isEdit}
    >
      <ClassSignupContent
        isEdit={isEdit}
        isNew={isNew}
        onCreateSubclass={handleCreateClass}
      />
    </ClassSignupProvider>
  );
}
