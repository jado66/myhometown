import React, { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Button,
} from "@mui/material";
import { ExpandMore } from "@mui/icons-material";
import { ExampleIcons } from "@/components/events/ClassesTreeView/IconSelect";
import ClassPreview from "./stepper-components/ClassPreview";
import { ClassDropdownActions } from "./ClassDropdownActions";

const ClassPreviewAccordion = ({
  classData,
  isEdit,
  onSignupClick,
  category,
  shiftUpClass,
  shiftDownClass,
  onEditSubclass,
  onDuplicateClass,
  isFirstClass,
  isLastClass,
}) => {
  const [showOptions, setShowOptions] = useState(false);

  const handleDuplicate = () => {
    // Create a copy of the class data with the signupForm data included
    const duplicatedData = {
      ...classData,
      title: `${classData.title} (Copy)`,
      id: undefined,
      signupForm: {
        formConfig: classData.signupForm?.formConfig || {},
        fieldOrder: classData.signupForm?.fieldOrder || [],
      },
    };
    onDuplicateClass(duplicatedData);
  };

  // Helper function to format class time
  const formatClassTime = (startTime, endTime) => {
    if (!startTime || !endTime) return "";
    return `${startTime} - ${endTime}`;
  };

  // Format the class data for preview
  const formattedClassData = {
    ...classData,
    schedule:
      classData.meetingDays?.map((day) => ({
        day,
        time: formatClassTime(classData.startTime, classData.endTime),
      })) || [],
    location: classData.location || "",
    capacity: classData.capacity || "",
    waitlistCapacity: classData.waitlistCapacity || "",
    showCapacity: classData.showCapacity || false,
  };

  return (
    <Accordion>
      <AccordionSummary
        expandIcon={<ExpandMore />}
        onMouseEnter={() => setShowOptions(true)}
        onMouseLeave={() => setShowOptions(false)}
      >
        <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
          {classData.icon && ExampleIcons[classData.icon] && (
            <Box sx={{ mr: 2 }}>
              {React.cloneElement(ExampleIcons[classData.icon], {
                sx: { height: 24, width: 24 },
              })}
            </Box>
          )}
          <Typography>{classData.title}</Typography>
          <Box sx={{ flexGrow: 1 }} />
          {isEdit && showOptions && (
            <ClassDropdownActions
              classObj={classData}
              categoryId={category?.id}
              onEditClass={() => onEditSubclass(classData.id)}
              onDuplicateClass={handleDuplicate}
              shiftUpClass={() => shiftUpClass(category.id, classData.id)}
              shiftDownClass={() => shiftDownClass(category.id, classData.id)}
              isFirstClass={isFirstClass}
              isLastClass={isLastClass}
            />
          )}
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        <ClassPreview classData={formattedClassData} />
        <Button
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={onSignupClick}
          disabled={isEdit}
        >
          {isEdit ? "Sign Up (Not available in edit mode)" : "Sign Up"}
        </Button>
      </AccordionDetails>
    </Accordion>
  );
};

export default ClassPreviewAccordion;
