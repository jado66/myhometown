import React, { useState } from "react";
import {
  Button,
  Grid,
  Typography,
  TextField,
  Box,
  ClickAwayListener,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Menu,
  MenuItem,
} from "@mui/material";

import {
  Add,
  Save,
  Cancel,
  ExpandMore,
  VisibilityOff,
  Visibility,
} from "@mui/icons-material";
import { ExampleIcons, IconSelect } from "./IconSelect";
import { StyledTreeItem } from "./StyledTreeItem";
import { CategoryDropdownActions } from "./CategoryDropdownActions";
import { ViewClassSignupForm } from "@/components/class-signups/stepper-components/ViewClassSignupForm";
import ClassPreviewAccordion from "@/components/class-signups/ClassPreviewAccordion";
import ClassCreationStepper from "@/components/class-signups/ClassCreationStepper";
import { ClassSignupProvider } from "@/components/class-signups/ClassSignupContext";
import { ClassDropdownActions } from "@/components/class-signups/ClassDropdownActions";
import ClassPreview from "@/components/class-signups/stepper-components/ClassPreview";
import { ClassSignup } from "./ClassSignup";
import { useLoadedClassesContext } from "@/hooks/use-loaded-classes-context";

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
  onUpdateSubclassField,
  shiftUpSubclass,
  shiftDownSubclass,
  isFirstCategory,
  isLastCategory,
  onToggleExpand,
  CategorySelectOptions,
}) => {
  const [isAddNewClass, setAddNewClass] = useState(false);
  const [editTitle, setEditTitle] = useState(category.title);
  const [editIcon, setEditIcon] = useState(category.icon);
  const [openClassSignup, setOpenClassSignup] = useState(null);
  const [duplicatedClassData, setDuplicatedClassData] = useState(null);
  const [showOptions, setShowOptions] = useState(false);

  const { loadClass } = useLoadedClassesContext();

  const [hoverClass, setHoverClass] = useState(null);

  const hideHoverClass = (id) => {
    if (hoverClass === id) {
      setHoverClass(null);
    }
  };

  // Check if the icon exists before attempting to clone it
  let IconWithProps = null;

  if (category.icon && ExampleIcons[category.icon]) {
    IconWithProps = React.cloneElement(ExampleIcons[category.icon], {
      sx: { height: 35, width: 35 },
    });
  }

  const isEditing = editingCategoryId === category.id;

  const handleDuplicateClass = async (classId) => {
    const newClassData = await loadClass(classId);

    console.log("DUPLICATED DATA" + JSON.stringify(newClassData, null, 4));

    const duplicatedData = {
      ...newClassData,
      title: `${newClassData.title} (Copy)`,
      id: undefined,
      signupForm: {
        formConfig: newClassData.signupForm?.formConfig || {},
        fieldOrder: newClassData.signupForm?.fieldOrder || [],
      },
    };

    setDuplicatedClassData(duplicatedData);
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
        classConfig.categoryId || category.id,
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

  // Helper function to format class time
  const formatClassTime = (startTime, endTime) => {
    if (!startTime || !endTime) return "";
    return `${startTime} - ${endTime}`;
  };

  const onUpdateVisibility = (classId, visibility) => {
    onUpdateSubclassField(category.id, classId, "visibility", visibility);
  };

  const classes = isEdit
    ? category.classes
    : category.classes.filter((c) => c.visibility);

  return (
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
      {Array.isArray(classes) &&
        classes.length > 0 &&
        classes.map((classObj, index) => {
          const formattedClassData = {
            ...classObj,
            schedule:
              classObj.meetingDays?.map((day) => ({
                day,
                time: formatClassTime(classObj.startTime, classObj.endTime),
              })) || [],
            location: classObj.location || "",
            capacity: classObj.capacity || "",
            showCapacity: classObj.showCapacity || false,
          };

          if (classObj?.v == 1)
            return (
              <Accordion>
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  onMouseEnter={() => setHoverClass(classObj.id)}
                  onMouseLeave={() => hideHoverClass(null)}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      width: "100%",
                    }}
                  >
                    {classObj.icon && ExampleIcons[classObj.icon] && (
                      <Box sx={{ mr: 2 }}>
                        {React.cloneElement(ExampleIcons[classObj.icon], {
                          sx: { height: 24, width: 24 },
                        })}
                      </Box>
                    )}
                    <Typography>{classObj.title}</Typography>
                    <Box sx={{ flexGrow: 1 }} />

                    {isEdit && hoverClass === classObj.id && (
                      <ClassDropdownActions
                        classObj={classObj}
                        categoryId={category?.id}
                        onEditClass={() => onEditSubclass(classObj.id)}
                        onDuplicateClass={() =>
                          handleDuplicateClass(classObj.id)
                        }
                        onUpdateVisibility={onUpdateVisibility}
                        isFirstClass={index === 0}
                        isLastClass={index === category.classes.length - 1}
                        shiftUpClass={shiftUpSubclass}
                        shiftDownClass={shiftDownSubclass}
                      />
                    )}
                    {isEdit && !classObj.visibility && (
                      // Drop down button with visibility options
                      <VisibilityDropdown
                        classObj={classObj}
                        onUpdateVisibility={onUpdateVisibility}
                      />
                    )}
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {openClassSignup === classObj.id ? (
                    <ClassSignupProvider
                      key={classObj.id}
                      category={category}
                      classObj={classObj}
                      onClassConfigChange={() => alert("not in edit mode")}
                      onCreateSubclass={() => alert("not in edit mode")}
                      onEditSubclass={() => alert("not in edit mode")}
                      onDeleteSubclass={() => alert("not in edit mode")}
                    >
                      <ViewClassSignupForm classData={classObj} />
                    </ClassSignupProvider>
                  ) : (
                    <>
                      <ClassPreview classData={formattedClassData} />
                      <Button
                        variant="contained"
                        color="primary"
                        fullWidth
                        sx={{ mt: 2 }}
                        onClick={() => setOpenClassSignup(classObj.id)}
                        disabled={isEdit}
                      >
                        {isEdit
                          ? "Sign Up (Not available in edit mode)"
                          : "Sign Up"}
                      </Button>
                    </>
                  )}
                </AccordionDetails>
              </Accordion>
            );
          else
            return (
              <>
                <ClassSignup
                  key={`classname-${classObj.id}`}
                  classObj={classObj}
                  category={category}
                  editingClassId={editingClassId}
                  onUpdateSubclass={onUpdateSubclass}
                  onDeleteSubclass={onDeleteSubclass}
                  shiftUpClass={shiftUpSubclass}
                  shiftDownClass={shiftDownSubclass}
                  showIframeHelpDialog={showIframeHelpDialog}
                  isFirstClass={index === 0}
                  isLastClass={index === category.classes.length - 1}
                  isEdit={isEdit}
                />
              </>
            );
        })}

      {classes.length === 0 && (
        <Typography variant="body2" sx={{ ml: 2, mt: 2 }}>
          No classes available yet. Check back later!
        </Typography>
      )}

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
            CategorySelectOptions={CategorySelectOptions}
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
            CategorySelectOptions={CategorySelectOptions}
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
  );
};

const VisibilityDropdown = ({ classObj, onUpdateVisibility }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event, visibility) => {
    event.stopPropagation();

    onUpdateVisibility(classObj.id, visibility);
    setAnchorEl(null);
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Button
        aria-controls="simple-menu"
        aria-haspopup="true"
        onClick={handleClick}
        sx={{ p: 0, minWidth: 0, mx: 1 }}
        size="small"
      >
        <VisibilityOff />
      </Button>
      <Menu
        id="simple-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <MenuItem onClick={(e) => handleClose(e, true)}>
          <Visibility sx={{ mr: 1 }} /> Make Visible
        </MenuItem>
      </Menu>
    </div>
  );
};
