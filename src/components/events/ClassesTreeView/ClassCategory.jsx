import React, { useEffect, useState } from "react";
import {
  Button,
  Grid,
  Typography,
  TextField,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Divider,
} from "@mui/material";

import { Add, Save, Cancel, ExpandMore } from "@mui/icons-material";
import { ExampleIcons, IconSelect } from "./IconSelect";
import { StyledTreeItem } from "./StyledTreeItem";
import { CategoryDropdownActions } from "./CategoryDropdownActions";
import { ViewClassSignupForm } from "@/components/class-signups/stepper-components/ViewClassSignupForm";
import ClassCreationStepper from "@/components/class-signups/ClassCreationStepper";
import { ClassSignupProvider } from "@/components/class-signups/ClassSignupContext";
import { ClassDropdownActions } from "@/components/class-signups/ClassDropdownActions";
import ClassPreview from "@/components/class-signups/stepper-components/ClassPreview";
import { ClassSignup } from "./ClassSignup";
import { useLoadedClassesContext } from "@/hooks/use-loaded-classes-context";
import { makeUrlSafeString } from "@/util/makeUrlSafeStrings";
import {
  CategoryVisibilityDropdown,
  ClassVisibilityDropdown,
} from "./VisibilityDropdown";

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
  const [expandedClasses, setExpandedClass] = useState([]);
  const [hoverClass, setHoverClass] = useState(null);

  const { loadClass } = useLoadedClassesContext();

  const editingClassBelongsToThisCategory =
    editingClassId &&
    category.classes &&
    Array.isArray(category.classes) &&
    category.classes.some((c) => c.id === editingClassId);

  // Get the class object for editing with proper logging

  // Helper function to find a class with proper logging
  const findClassById = (classId, context = "unknown") => {
    console.log(
      `[findClassById] Searching for class ID: "${classId}" in context: ${context}`
    );
    console.log(
      `[findClassById] Category: "${category.title}" (ID: ${category.id})`
    );
    console.log(`[findClassById] Category type: "${category.type}"`);
    console.log(`[findClassById] Available classes:`, category.classes);

    // Validate inputs
    if (!classId) {
      console.warn(
        `[findClassById] No class ID provided in context: ${context}`
      );
      return null;
    }

    if (!category.classes || !Array.isArray(category.classes)) {
      console.warn(
        `[findClassById] No valid classes array found in category "${category.title}"`
      );
      console.log(`[findClassById] Category.classes value:`, category.classes);
      return null;
    }

    if (category.type === "header") {
      console.log(
        `[findClassById] Category is header type, skipping class search`
      );
      return null;
    }

    // Find the class
    const foundClass = category.classes.find((classObj) => {
      const match = classObj.id === classId;
      console.log(
        `[findClassById] Checking class "${classObj.title}" (ID: ${classObj.id}) - Match: ${match}`
      );
      return match;
    });

    if (foundClass) {
      console.log(
        `[findClassById] ✅ Found class: "${foundClass.title}" (ID: ${foundClass.id})`
      );
    } else {
      console.warn(
        `[findClassById] ❌ Class with ID "${classId}" not found in category "${category.title}"`
      );
      console.log(
        `[findClassById] Available class IDs:`,
        category.classes.map((c) => c.id)
      );
    }

    return foundClass || null;
  };

  // Helper function to find a class by URL-safe title with proper logging
  const findClassByUrlTitle = (urlTitle, context = "unknown") => {
    console.log(
      `[findClassByUrlTitle] Searching for URL title: "${urlTitle}" in context: ${context}`
    );
    console.log(
      `[findClassByUrlTitle] Category: "${category.title}" (ID: ${category.id})`
    );

    // Validate inputs
    if (!urlTitle) {
      console.warn(
        `[findClassByUrlTitle] No URL title provided in context: ${context}`
      );
      return null;
    }

    if (!category.classes || !Array.isArray(category.classes)) {
      console.warn(
        `[findClassByUrlTitle] No valid classes array found in category "${category.title}"`
      );
      return null;
    }

    // Find the class by URL-safe title
    const foundClass = category.classes.find((classObj) => {
      const classUrlTitle = makeUrlSafeString(classObj.title).trim();
      const searchUrlTitle = urlTitle.trim();
      const match = classUrlTitle === searchUrlTitle;

      console.log(`[findClassByUrlTitle] Checking class "${classObj.title}"`);
      console.log(
        `[findClassByUrlTitle] - Original title: "${classObj.title}"`
      );
      console.log(`[findClassByUrlTitle] - URL-safe title: "${classUrlTitle}"`);
      console.log(`[findClassByUrlTitle] - Search term: "${searchUrlTitle}"`);
      console.log(`[findClassByUrlTitle] - Match: ${match}`);

      return match;
    });

    if (foundClass) {
      console.log(
        `[findClassByUrlTitle] ✅ Found class: "${foundClass.title}" (ID: ${foundClass.id})`
      );
    } else {
      console.warn(
        `[findClassByUrlTitle] ❌ Class with URL title "${urlTitle}" not found in category "${category.title}"`
      );
      console.log(
        `[findClassByUrlTitle] Available URL titles:`,
        category.classes.map(
          (c) => `"${makeUrlSafeString(c.title)}" (from "${c.title}")`
        )
      );
    }

    return foundClass || null;
  };

  const editingClassObj = editingClassBelongsToThisCategory
    ? findClassById(editingClassId, "editing class provider")
    : null;

  const toggleExpandedClass = (classId) => {
    if (expandedClasses.includes(classId)) {
      setExpandedClass((prev) => prev.filter((id) => id !== classId));
    } else {
      setExpandedClass((prev) => [...prev, classId]);
    }
  };

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
    console.log(
      `[handleDuplicateClass] Starting duplication for class ID: ${classId}`
    );

    try {
      const { _id, ...rest } = await loadClass(classId);
      console.log(`[handleDuplicateClass] Loaded class data:`, rest);

      const duplicatedData = {
        ...rest,
        title: `${rest.title} (Copy)`,
        id: undefined,
        signupForm: {
          formConfig: rest.signupForm?.formConfig || {},
          fieldOrder: rest.signupForm?.fieldOrder || [],
        },
        attendance: [],
      };

      console.log(
        `[handleDuplicateClass] Created duplicated data:`,
        duplicatedData
      );
      setDuplicatedClassData(duplicatedData);
      setAddNewClass(true);
    } catch (error) {
      console.error(`[handleDuplicateClass] Error duplicating class:`, error);
    }
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
      console.log(`[useEffect] Processing URL hash: "${hash}"`);

      if (hash === "#crc-classes") {
        console.log(`[useEffect] Hash is crc-classes, skipping processing`);
        return;
      }

      if (hash) {
        console.log(`[useEffect] Looking for class with URL title: "${hash}"`);

        // Use the new helper function
        const matchingClass = findClassByUrlTitle(hash, "URL hash navigation");

        if (matchingClass) {
          console.log(
            `[useEffect] Found matching class, expanding category and scrolling`
          );

          // First, expand the category
          forceExpandCategory();

          // Then set the expanded class state
          setExpandedClass((prev) => [...prev, matchingClass.id]);

          // Finally, scroll to the element after a delay to ensure expansion is complete
          setTimeout(() => {
            const element = document.getElementById(`class-${hash}`);
            if (element) {
              console.log(`[useEffect] Scrolling to element: class-${hash}`);
              const headerOffset = 115;
              const elementPosition = element.getBoundingClientRect().top;
              const offsetPosition =
                elementPosition + window.pageYOffset - headerOffset;

              window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
              });
            } else {
              console.warn(`[useEffect] Element not found: class-${hash}`);
            }
          }, 1500);
        }
      }
    }
  }, []);

  const classes = Array.isArray(category.classes)
    ? isEdit
      ? category.classes
      : category.classes.filter((c) => c.v !== 1 || c.visibility)
    : category.classes;

  // Get the class object for editing with proper logging

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
                expanded={expandedClasses?.includes(classObj.id)}
                onChange={(e) => toggleExpandedClass(classObj.id)}
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

      {editingClassBelongsToThisCategory && editingClassId && (
        <ClassSignupProvider
          key={editingClassId} // Add this key prop to force remount
          classObj={editingClassObj || {}}
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
            editingClassId={editingClassId}
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
