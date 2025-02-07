import React, { useEffect, useState } from "react";
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
  Divider,
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
import { makeUrlSafeString } from "@/util/makeUrlSafeStrings";

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
  const [expandedClass, setExpandedClass] = useState(null);
  const [hoverClass, setHoverClass] = useState(null);

  const { loadClass } = useLoadedClassesContext();

  const hideHoverClass = (id) => {
    if (hoverClass === id) {
      setHoverClass(null);
    }
  };

  const onUpdateCategoryVisibility = (visibility) => {
    onUpdateCategory(category.id, category.title, category.icon, visibility);
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
    try {
      if (!category.id) {
        throw new Error("Category ID is required");
      }

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

  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash.replace("#class-", "");

      if (hash) {
        // Find the class with matching ID
        const matchingClass = category.classes.find((classObj) => {
          return makeUrlSafeString(classObj.title).trim() == hash.trim();
        });

        if (matchingClass) {
          // First, expand the category
          forceExpandCategory();

          // Then set the expanded class state
          setExpandedClass(matchingClass.id);

          // Finally, scroll to the element after a delay to ensure expansion is complete
          setTimeout(() => {
            const element = document.getElementById(`class-${hash}`);
            if (element) {
              const headerOffset = 115;
              const elementPosition = element.getBoundingClientRect().top;
              const offsetPosition =
                elementPosition + window.pageYOffset - headerOffset;

              window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
              });
            }
          }, 1500); // Reduced timeout since we're now properly controlling expansion
        }
      }
    }
  }, []);

  const classes = Array.isArray(category.classes)
    ? isEdit
      ? category.classes
      : category.classes.filter((c) => c.v !== 1 || c.visibility)
    : category.classes;

  return (
    <StyledTreeItem
      key={category.id}
      nodeId={category.id.toString()}
      itemId={category.id.toString()}
      onClick={(e) => onToggleExpand(e, category.id.toString(), false)}
      isExpanded={false}
      onMouseEnter={isEdit ? () => setShowOptions(true) : () => {}}
      onMouseLeave={isEdit ? () => setShowOptions(false) : () => {}}
      label={
        isEditing ? (
          <Grid container alignItems="center" spacing={2}>
            <Grid item>
              {category.type !== "header" && (
                <IconSelect
                  onSelect={(e) => {
                    e.stopPropagation();
                    setEditIcon(e.target.value);
                  }}
                  icon={editIcon}
                />
              )}
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
            {category.type === "header" ? (
              <Box
                sx={{ display: "flex", flexDirection: "column", width: "100%" }}
              >
                {!isFirstCategory && <Divider sx={{ my: 2, width: "100%" }} />}
                <Typography
                  sx={{
                    marginLeft: "1em",
                    fontSize: "1.85em !important",
                    width: "100%",
                    textAlign: "center",
                    color: "#318d43",
                    mt: isFirstCategory ? 0 : "1em",
                    ml: 0,
                  }}
                  variant="h4"
                >
                  {category.title}
                </Typography>
              </Box>
            ) : (
              <Typography sx={{ marginLeft: "1em" }} variant="h5">
                {category.title}
              </Typography>
            )}

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
                onUpdateCategoryVisibility={onUpdateCategoryVisibility}
              />
            )}
            {isEdit &&
              category.visibility !== undefined &&
              category.visibility === false && (
                <CategoryVisibilityDropdown
                  category={category}
                  onUpdateVisibility={onUpdateCategoryVisibility}
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

          if (classObj?.v === 1)
            return (
              <Accordion
                key={classObj.id}
                expanded={expandedClass === classObj.id}
                onChange={(e, isExpanded) =>
                  setExpandedClass(isExpanded ? classObj.id : null)
                }
                id={`class-${makeUrlSafeString(classObj.title)}`}
                component={({ children, ...props }) => (
                  <div
                    {...props}
                    onKeyDown={null}
                    onKeyUp={null}
                    onKeyPress={null}
                  >
                    {children}
                  </div>
                )}
              >
                <AccordionSummary
                  expandIcon={<ExpandMore />}
                  onMouseEnter={() => setHoverClass(classObj.id)}
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
                      <ClassVisibilityDropdown
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
            );
        })}

      {classes?.length === 0 && (
        <Typography variant="body2" sx={{ ml: 2, mt: 2 }}>
          No classes available yet. Check back later!
        </Typography>
      )}

      {editingClassId && (
        <ClassSignupProvider
          classObj={
            (category.type !== "header" &&
              category.classes.find(
                (classObj) => classObj.id === editingClassId
              )) ||
            {}
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

      {isEdit && category.type !== "header" && (
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

const CategoryVisibilityDropdown = ({ category, onUpdateVisibility }) => {
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleClick = (event) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = (event, visibility) => {
    event.stopPropagation();

    onUpdateVisibility(category.id, visibility);
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

const ClassVisibilityDropdown = ({ classObj, onUpdateVisibility }) => {
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
