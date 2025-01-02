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
import { ViewClassSignupForm } from "./stepper-components/ViewClassSignupForm";
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
  const { classConfig, handleSaveClass, handleDeleteClass, isConfigDirty } =
    useClassSignup();

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
        {classConfig.icon && (
          <Typography sx={{ mr: "1em" }}>
            ExampleIcons[classConfig.icon]
          </Typography>
        )}
        <Typography>{classConfig.title}</Typography>
      </AccordionSummary>

      <AccordionDetails>
        <Stack spacing={3}>
          {true && ( // I need an isEdit community
            <Stack
              direction="row"
              justifyContent="flex-end"
              alignItems="center"
            >
              <Button
                variant="outlined"
                onClick={() => setIsEditMode(!isEditMode)}
                sx={{ ml: 2 }}
              >
                Edit Signup Form
              </Button>

              <Button
                variant="contained"
                onClick={handleSaveClass}
                sx={{ ml: 2 }}
                disabled={!isNew && !isConfigDirty}
              >
                {isNew ? "Create Class" : "Confirm Changes"}
              </Button>

              <MenuWithOptions
                onMoveUp={() => console.log("Move up")}
                onMoveDown={() => console.log("Move down")}
                onDelete={handleDeleteClass}
              />
            </Stack>
          )}
          <ViewClassSignupForm />

          <EditClassSignupForm
            isOpen={isEditMode}
            isNew={isNew}
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
  handleEditSubclass,
  handleDeleteSubclass,
  category,
}) {
  // Handler for when a class is created
  const handleCreateClass = async (classData) => {
    try {
      // Create the basic class info that will be returned to the parent

      const { classConfig: basicClassInfo, signupForm: classSignupForm } =
        classData;

      // alert(
      //   JSON.stringify({
      //     basicClassInfo,
      //     classSignupForm,
      //   })
      // );

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
  const handleEditClass = async (classData) => {
    const { classConfig: basicClassInfo, signupForm: classSignupForm } =
      classData;

    try {
      // Log the full class data

      // Call the parent's handler with the updated data

      // Log the full class data
      console.log("Create class", classData);

      // Call the parent's handler with the basic info
      await handleEditSubclass(basicClassInfo, classSignupForm);

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
      category={category}
      onCreateSubclass={handleCreateClass}
      onEditSubclass={handleEditClass}
      onDeleteSubclass={handleDeleteSubclass}
      onSubmitSignup={handleSubmitSignup}
      isEdit={isEdit}
      isNew={isNew}
    >
      <ClassSignupContent
        isEdit={isEdit}
        isNew={isNew}
        onCreateSubclass={handleCreateClass}
      />
    </ClassSignupProvider>
  );
}

import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import MoreVertIcon from "@mui/icons-material/MoreVert";

const MenuWithOptions = ({ onMoveUp, onMoveDown, onDelete }) => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMoveUp = () => {
    // Add your move up logic here
    handleMenuClose();
  };

  const handleMoveDown = () => {
    // Add your move down logic here
    handleMenuClose();
  };

  return (
    <>
      <Button
        aria-label="more"
        aria-controls="long-menu"
        aria-haspopup="true"
        onClick={handleMenuOpen}
        variant="outlined"
        color="primary"
        sx={{ ml: 2 }}
      >
        Options
        <MoreVertIcon />
      </Button>
      <Menu
        id="long-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleMoveUp}>Move Up</MenuItem>
        <MenuItem onClick={handleMoveDown}>Move Down</MenuItem>
        <MenuItem onClick={onDelete}>Delete</MenuItem>
      </Menu>
    </>
  );
};
