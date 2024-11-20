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

function ClassSignupContent({ onCreateSubclass, isEdit }) {
  const [isEditMode, setIsEditMode] = useState(isEdit);
  const [isShowingFieldSelector, setIsShowingFieldSelector] = useState(false);
  const [expanded, setExpanded] = useState(true);
  const { classConfig } = useClassSignup();

  const handleAccordionChange = (_, isExpanded) => {
    setExpanded(isExpanded);
  };

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Accordion expanded={expanded} onChange={handleAccordionChange}>
        <AccordionSummary
          expandIcon={<ExpandMoreIcon />}
          sx={{
            "& .MuiAccordionSummary-content": {
              alignItems: "center",
            },
          }}
        >
          {classConfig.icon && (
            <div className="mr-2">
              <img
                src={classConfig.icon}
                alt="Class Icon"
                style={{ width: 24, height: 24, marginRight: 8 }}
              />
            </div>
          )}
          <Typography variant="h6" component="div">
            {classConfig.className || "Class"}
          </Typography>
        </AccordionSummary>

        <AccordionDetails>
          <Paper sx={{ p: 4 }}>
            <Stack spacing={3}>
              <Stack
                direction="row"
                justifyContent="flex-end"
                alignItems="center"
              >
                <Button
                  variant="contained"
                  startIcon={isEditMode ? <VisibilityIcon /> : <EditIcon />}
                  onClick={() => setIsEditMode(!isEditMode)}
                  sx={{ ml: 2 }}
                >
                  {isEditMode ? "Preview Form" : "Edit Form"}
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
          </Paper>
        </AccordionDetails>
      </Accordion>
    </Container>
  );
}

export default function CustomClassSignup({ isEdit, handleCreateSubclass }) {
  // Handler for when a class is created
  const handleCreateClass = async (classData) => {
    try {
      // Create the basic class info that will be returned to the parent
      const basicClassInfo = {
        id: classData.id,
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
      await handleCreateSubclass(basicClassInfo, classData);

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
      onCreateSubclass={handleCreateClass}
      onEditSubclass={handleEditClass}
      onSubmitSignup={handleSubmitSignup}
      isEditMode={isEdit}
    >
      <ClassSignupContent
        isEdit={isEdit}
        onCreateSubclass={handleCreateClass}
      />
    </ClassSignupProvider>
  );
}
