import React, { useState } from "react";
import {
  Button,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  TextField,
  Box,
  ClickAwayListener,
} from "@mui/material";

import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Add,
  Delete,
  Edit,
  Save,
  Cancel,
  ArrowUpward,
  ArrowDownward,
} from "@mui/icons-material";
import { CreateClassForm } from "./CreateClassForm";
import { ExampleIcons, IconSelect } from "./IconSelect";
import { StyledTreeItem } from "./StyledTreeItem";
import { CategoryDropdownActions } from "./CategoryDropdownActions";
import { ClassSignup } from "./ClassSignup";
import ClassPreview from "@/components/class-signups/ClassPreviewAccordion";
import CustomClassSignup from "@/components/class-signups";
import ClassCreationStepper from "@/components/class-signups/ClassCreationStepper";
import { ClassSignupProvider } from "@/components/class-signups/ClassSignupContext";

export const ClassCategory = ({
  category,
  isEdit,
  onDeleteClassCategory,
  onDeleteSubclass,
  showIframeHelpDialog,
  onCreateSubclass,
  onUpdateSubclass,

  editingCategoryId,
  editingClassId,
  onEditCategory,
  onUpdateCategory,
  shiftUpClassCategory,
  shiftDownClassCategory,
  shiftUpSubclass,
  shiftDownSubclass,
  isFirstCategory,
  isLastCategory,
  onToggleExpand,
}) => {
  const [isAddNewClass, setAddNewClass] = useState(false);
  const [editTitle, setEditTitle] = useState(category.title);
  const [editIcon, setEditIcon] = useState(category.icon);

  const [openClassSignup, setOpenClassSignup] = useState(null);

  const [showOptions, setShowOptions] = useState(false);

  const IconWithProps = React.cloneElement(ExampleIcons[category.icon], {
    sx: { height: 35, width: 35 },
  });

  const isEditing = editingCategoryId === category.id;

  const handleSaveCategory = () => {
    onUpdateCategory(category.id, editTitle, editIcon);
  };

  const handleCancelEdit = () => {
    setEditTitle(category.title);
    setEditIcon(category.icon);
    onEditCategory(null);
    setAddNewClass(false);
    setShowOptions(false);
  };

  const onClickAway = () => {
    handleCancelEdit();
  };

  const forceExpandCategory = () => {
    onToggleExpand(null, category.id.toString(), true);
  };

  const handleEditSubclass = async (basicClassInfo, classData) => {
    try {
      // Ensure we have the category ID and properly formatted data
      if (!category.id) {
        throw new Error("Category ID is required");
      }

      // Create the subclass with the category ID and formatted data
      const updatedClass = await onUpdateSubclass(
        category.id,
        {
          ...basicClassInfo,
        },
        classData
      );

      if (updatedClass) {
        setOpenClassSignup(null);
      }

      return updatedClass;
    } catch (error) {
      console.error("Failed to update class:", error);
      throw error;
    }
  };

  // In ClassCategory.js, update the handleCreateSubclass function:
  const handleCreateSubclass = async (basicClassInfo, classData) => {
    try {
      // Ensure we have the category ID and properly formatted data
      if (!category.id) {
        throw new Error("Category ID is required");
      }

      // Create the subclass with the category ID and formatted data
      const createdClass = await onCreateSubclass(
        category.id,
        {
          ...basicClassInfo,
        },
        classData
      );

      alert("Class created successfully" + JSON.stringify(classData));

      if (createdClass) {
        setAddNewClass(false);
      }

      return createdClass;
    } catch (error) {
      console.error("Failed to create class:", error);
      throw error;
    }
  };

  const handleDeleteSubclass = async (classId) => {
    try {
      // Ensure we have the category ID and properly formatted data
      if (!category.id) {
        throw new Error("Category ID is required");
      }

      // Delete the subclass with the category ID and formatted data
      const deletedClass = await onDeleteSubclass(category.id, classId);

      if (deletedClass) {
        setOpenClassSignup(null);
      }

      return deletedClass;
    } catch (error) {
      console.error("Failed to delete class:", error);
      throw error;
    }
  };

  return (
    <ClickAwayListener onClickAway={() => {}}>
      <StyledTreeItem
        key={category.id}
        nodeId={category.id.toString()}
        itemId={category.id.toString()}
        onClick={(e) => onToggleExpand(e, category.id.toString(), false)}
        isExpanded={false}
        onMouseEnter={() => setShowOptions(true)}
        onMouseLeave={() => setShowOptions(false)}
        label={
          isEditing ? (
            <Grid container alignItems="center" spacing={2}>
              <Grid item>
                <IconSelect
                  onSelect={(e) => {
                    e.stopPropagation();
                    setEditIcon(e.target.value);
                  }}
                  icon={editIcon}
                />
              </Grid>
              <Grid item xs>
                <TextField
                  fullWidth
                  value={editTitle}
                  onClick={(e) => e.stopPropagation()}
                  onChange={(e) => {
                    setEditTitle(e.target.value);
                    e.stopPropagation(); // Ensure propagation is stopped here
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation(); // Stop the propagation of the space bar key event
                  }}
                  size="small"
                />
              </Grid>
              <Grid item>
                <Button
                  startIcon={<Cancel />}
                  onClick={handleCancelEdit}
                  size="small"
                >
                  Cancel
                </Button>
                <Button
                  startIcon={<Save />}
                  onClick={handleSaveCategory}
                  size="small"
                >
                  Save
                </Button>
              </Grid>
            </Grid>
          ) : (
            <div style={{ display: "flex", alignItems: "center" }}>
              {IconWithProps}
              <Typography sx={{ marginLeft: "1em" }} variant="h5">
                {category.title}
              </Typography>
              <Box sx={{ flexGrow: 1 }} />
              {isEdit && showOptions && (
                <CategoryDropdownActions
                  category={category}
                  setAddNewClass={setAddNewClass}
                  onEditCategory={onEditCategory}
                  onDeleteClassCategory={onDeleteClassCategory}
                  shiftUpClassCategory={shiftUpClassCategory}
                  shiftDownClassCategory={shiftDownClassCategory}
                  isFirstCategory={isFirstCategory}
                  isLastCategory={isLastCategory}
                  onToggleExpand={forceExpandCategory}
                />
              )}
            </div>
          )
        }
      >
        {Array.isArray(category.classes) &&
          category.classes.length > 0 &&
          category.classes.map((classObj, index) => {
            if (
              classObj.contentType === "form" ||
              classObj.contentType === "iframe"
            ) {
              return null;
            } else {
              if (openClassSignup === classObj.id) {
                return (
                  <CustomClassSignup
                    key={classObj.id}
                    classObj={classObj}
                    category={category}
                    handleCreateSubclass={handleCreateSubclass}
                    handleEditSubclass={handleEditSubclass}
                    handleDeleteSubclass={handleDeleteSubclass}
                  />
                );
              } else {
                return (
                  <ClassPreview
                    key={classObj.id}
                    classData={classObj}
                    isEdit={isEdit}
                    onSignupClick={() => setOpenClassSignup(classObj.id)}
                  />
                );
              }
              // return (
              //   <CustomClassSignup
              //     handleCreateSubclass={handleCreateSubclass}
              //   />
              // );
            }
            //
          })}

        {/* {/* {isAddNewClass && ( */}
        {/* <CreateClassForm
          category={category}
          onClose={() => setAddNewClass(false)}
          onCreateSubclass={onCreateSubclass}
          showIframeHelpDialog={showIframeHelpDialog}
        /> */}
        {/* )} */}

        {isAddNewClass && (
          <ClassSignupProvider
            onCreateSubclass={handleCreateSubclass}
            onEditSubclass={handleEditSubclass}
            onDeleteSubclass={handleDeleteSubclass}
            isEdit={isEdit}
            isNew
          >
            <ClassCreationStepper
              category={category}
              onClose={() => setAddNewClass(false)}
            />
          </ClassSignupProvider>
        )}

        {isEdit && (
          <>
            <Grid display="flex" justifyContent="center" flexDirection="column">
              <Button
                startIcon={<Add />}
                onClick={() => setAddNewClass(true)}
                variant="outlined"
                sx={{ my: 1, mx: "auto" }}
              >
                Add Class to {category.title}
              </Button>
            </Grid>
          </>
        )}
      </StyledTreeItem>
    </ClickAwayListener>
  );
};
