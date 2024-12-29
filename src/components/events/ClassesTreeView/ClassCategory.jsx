import React, { useState } from "react";
import {
  Button,
  Grid,
  Typography,
  TextField,
  Box,
  ClickAwayListener,
} from "@mui/material";

import { Add, Save, Cancel } from "@mui/icons-material";
import { ExampleIcons, IconSelect } from "./IconSelect";
import { StyledTreeItem } from "./StyledTreeItem";
import { CategoryDropdownActions } from "./CategoryDropdownActions";
import { ViewClassSignupForm } from "@/components/class-signups/stepper-components/ViewClassSignupForm";
import ClassPreviewAccordion from "@/components/class-signups/ClassPreviewAccordion";
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
  onEditSubclass,
  editingCategoryId,
  setEditingClassId,
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
  const [duplicatedClassData, setDuplicatedClassData] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  const IconWithProps = React.cloneElement(ExampleIcons[category.icon], {
    sx: { height: 35, width: 35 },
  });

  const isEditing = editingCategoryId === category.id;

  const handleDuplicateClass = (classData) => {
    setDuplicatedClassData(classData);
    setAddNewClass(true);
  };

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

  const forceExpandCategory = () => {
    onToggleExpand(null, category.id.toString(), true);
  };

  const handleCreateSubclass = async (classConfig, signupForm) => {
    // alert("Calling function from class category");
    console.log(
      JSON.stringify(
        "Calling function from class category" +
          JSON.stringify({ classConfig, signupForm }, null, 4)
      )
    );
    try {
      if (!category.id) {
        throw new Error("Category ID is required");
      }

      // Ensure all required fields are present

      const createdClass = await onCreateSubclass(
        category.id,
        classConfig,
        signupForm
      );

      if (createdClass) {
        setAddNewClass(false);
        setDuplicatedClassData(null);
      }

      return createdClass;
    } catch (error) {
      console.error("Failed to create class:", error);
      throw error;
    }
  };

  const handleEditSubclass = async (basicClassInfo, classData) => {
    try {
      if (!category.id) {
        throw new Error("Category ID is required");
      }

      const updatedClass = await onUpdateSubclass(
        category.id,
        basicClassInfo,
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
                    e.stopPropagation();
                  }}
                  onKeyDown={(e) => {
                    e.stopPropagation();
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
                  <ClassSignupProvider
                    key={classObj.id}
                    category={category}
                    classObj={classObj}
                    onClassConfigChange={() => alert("not in edit mode")}
                    onCreateSubclass={() => alert("not in edit mode")}
                    onEditSubclass={() => alert("not in edit mode")}
                    onDeleteSubclass={() => alert("not in edit mode")}
                  >
                    <ViewClassSignupForm />
                  </ClassSignupProvider>
                );
              } else {
                return (
                  <ClassPreviewAccordion
                    key={classObj.id}
                    classData={classObj}
                    isEdit={isEdit}
                    category={category}
                    onEditSubclass={onEditSubclass}
                    onDuplicateClass={handleDuplicateClass}
                    onSignupClick={() => setOpenClassSignup(classObj.id)}
                    isFirstClass={index === 0}
                    isLastClass={index === category.classes.length - 1}
                    shiftUpClass={shiftUpSubclass}
                    shiftDownClass={shiftDownSubclass}
                  />
                );
              }
            }
          })}

        {editingClassId && (
          <ClassSignupProvider
            classObj={
              category.classes.find(
                (classObj) => classObj.id === editingClassId
              ) || {}
            }
            category={category}
            onCreateSubclass={handleCreateSubclass}
            onEditSubclass={handleEditSubclass}
            onDeleteSubclass={() => {
              onDeleteSubclass(category.id, editingClassId, () => {
                setEditingClassId(null);
              });
            }}
            isEditMode={true}
            isNew={false}
          >
            <ClassCreationStepper
              handleClose={() => {
                setEditingClassId(null);
              }}
            />
          </ClassSignupProvider>
        )}

        {isAddNewClass && (
          <ClassSignupProvider
            category={category}
            onCreateSubclass={handleCreateSubclass}
            onEditSubclass={handleEditSubclass}
            classObj={duplicatedClassData || {}}
            defaultConfig={
              duplicatedClassData
                ? {
                    ...duplicatedClassData,
                    title: `${duplicatedClassData.title}`,
                    id: undefined,
                  }
                : undefined
            }
            isEdit={isEdit}
            isNew={true}
          >
            <ClassCreationStepper
              isNew={true}
              handleClose={() => {
                setAddNewClass(false);
                setDuplicatedClassData(null);
              }}
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
