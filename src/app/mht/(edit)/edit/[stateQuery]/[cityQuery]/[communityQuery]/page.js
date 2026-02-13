"use client";
import {
  Accordion,
  Box,
  Breadcrumbs,
  Button,
  Card,
  Container,
  Divider,
  Grid,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { fa, faker } from "@faker-js/faker";
import GallerySLC from "@/views/supportingPages/About/components/GallerySLC/Gallery";
import ContentEditable from "react-contenteditable";
import { useEffect, createRef, useState, useRef } from "react";
import createFakeEvents from "@/util/events/create-fake-events";
import UpcomingEvents from "@/components/events/UpcomingEvents";
import { EventsCalendar } from "@/components/events/EventsCalendar";
import { EventDialog_NewEdit } from "@/components/events/EventDialog_NewEdit";
import useCommunity from "@/hooks/use-community";
import Loading from "@/components/util/Loading";
import { useEdit } from "@/hooks/use-edit";
import { useHandleEvents } from "@/hooks/use-handle-events";
import { communityTemplate } from "@/constants/templates/communityTemplate";
import PhotoGallery from "@/components/PhotoGallery";
import { useUser } from "@/hooks/use-user";
import { Edit, Close, VisibilityOff, Visibility } from "@mui/icons-material";
import UploadImage from "@/components/util/UploadImage";
import { StatsCounter } from "@/components/StatsCounter";
import { v4 as uuidv4 } from "uuid";
import { VolunteerSignUps } from "@/components/VolunteerSignUps";
import { LightBox } from "@/components/LightBox";
import { ClassesTreeView } from "@/components/events/ClassesTreeView";
import Link from "next/link";
import UnsavedChangesAlert from "@/components/util/UnsavedChangesAlert";
import { toast } from "react-toastify";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { LoadedClassesProvider } from "@/contexts/LoadedClassesProvider";
import AskYesNoDialog from "@/components/util/AskYesNoDialog";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { useEvents } from "@/hooks/useEvents";
import { Link as LinkIcon } from "@mui/icons-material";

import MarketingItemEdit from "@/components/community/MarketingItemEdit";

const communityDataContentTemplate = {
  paragraph1Text: faker.lorem.paragraph(),
  paragraph2Text: faker.lorem.paragraph(),
};

const Page = ({ params }) => {
  const { stateQuery, cityQuery, communityQuery } = params;
  const { user } = useUser();
  const { fetchEvents, addEvent, updateEvent, deleteEvent } = useEvents();
  const [events, setEvents] = useState([]);

  const [marketingImageCount, setMarketingImageCount] = useState(2);

  const [loadedClassSignups, setLoadedClassSignups] = useState([]);

  const [isEditVolunteerForm, setIsEditVolunteerForm] = useState(true);

  const [deleteDialogConfig, setDeleteDialogConfig] = useState({
    open: false,
    title: "",
    description: "",
    onConfirm: null,
    classCategoryId: null,
    subclassId: null,
  });

  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";

  const { community, hasLoaded } = useCommunity(
    communityQuery,
    cityQuery,
    stateQuery,
    communityTemplate,
    true,
  );

  const {
    data: communityData,
    setData: setCommunityData,
    stagedRequests: stagedClassRequests,
    setStagedRequests: setStagedClassRequests,
    setEntityType,
    isDirty,
  } = useEdit();

  let content;

  if (communityData) {
    ({ content } = communityData);
  }

  useEffect(() => {
    if (community) {
      setCommunityData({
        content: { ...communityDataContentTemplate },
        ...community,
      });

      if (!community._id) {
        return;
      }

      setMarketingImageCount(
        Math.max(
          ...Object.keys(community.content)
            .filter((key) => key.startsWith("marketingImage"))
            .map((key) => parseInt(key.replace("marketingImage", "")) || 0),
        ),
      );

      async function loadCommunityEvents() {
        // Changed name here

        const communityId = community._id;
        const events = await fetchEvents({
          // This now clearly refers to the imported function
          communityId: communityId,
          // startDate: new Date(),
        });
        setEvents(events);
      }

      loadCommunityEvents();

      setEntityType("community");
    }
  }, [community]);

  const [selectedEvent, setSelectedEvent] = useState(null);

  const [isCreatingNewEvent, setIsCreatingNewEvent] = useState(false);

  const startCreatingNewEvent = () => {
    setIsCreatingNewEvent(true);
  };

  const closeEventDialog = () => {
    setSelectedEvent(null);
    setIsCreatingNewEvent(false);
  };

  const onSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const handleSaveEvent = async (event) => {
    try {
      if (isCreatingNewEvent) {
        await addEvent(event);
        toast.success("Event created successfully!");
      } else {
        // Ensure we're passing the event ID for updates
        await updateEvent(selectedEvent.id, {
          ...event,
          id: selectedEvent.id, // Preserve the original event ID
        });
        toast.success("Event updated successfully!");
      }

      // Refresh events after save
      const updatedEvents = await fetchEvents({
        communityId: community._id,
      });
      setEvents(updatedEvents);

      setSelectedEvent(null);
      setIsCreatingNewEvent(false);
    } catch (error) {
      console.error("Error saving event:", error);
      toast.error("Failed to save event: " + error.message);
    }
  };

  const handleChangePhoto = (url, key) => {
    setCommunityData((prevState) => {
      const newPhotos = { ...prevState.content.galleryPhotos };
      if (newPhotos[key]) {
        newPhotos[key] = {
          ...newPhotos[key],
          src: url,
        };
      }

      return {
        ...prevState,
        content: {
          ...prevState.content,
          galleryPhotos: newPhotos,
        },
      };
    });
  };

  const handleChangeMap = (url) => {
    setCommunityData({
      ...communityData,
      content: {
        ...communityData.content,
        mapUrl: url,
      },
    });
  };

  const handleChangeMarketingImage = (url, index) => {
    setCommunityData({
      ...communityData,
      content: {
        ...communityData.content,
        [`marketingImage${index}`]: url,
      },
    });
  };

  const handleDeleteEvent = (eventId) => {
    try {
      deleteEvent(eventId);
      toast.success("Event Deleted. No need to save.");
    } catch (err) {
      toast.error(JSON.stringify(err));
    }

    setSelectedEvent(null);
    setIsCreatingNewEvent(false);
  };

  const handleParagraphChange = (e, name) => {
    const { value } = e.target;

    if (name === "paragraph1") {
      setCommunityData({
        ...communityData,
        content: {
          ...communityData.content,
          paragraph1Text: value,
        },
      });
    } else {
      setCommunityData({
        ...communityData,
        content: {
          ...communityData.content,
          paragraph2Text: value,
        },
      });
    }
  };

  const handleHeaderChange = (e, name) => {
    const { value } = e.target;
    setCommunityData({
      ...communityData,
      content: {
        ...communityData.content,
        header: value,
      },
    });
  };

  const onCreateClassCategory = (iconName, title) => {
    const id = uuidv4();

    const newClassCategory = {
      icon: iconName,
      title: title,
      id: id,
      classes: [],
    };

    setCommunityData({
      ...communityData,
      classes: [...communityData.classes, newClassCategory],
    });
  };

  const onCreateCategoryHeader = (title) => {
    const id = uuidv4();

    const newClassCategory = {
      title: title,
      id: id,
      type: "header",
    };

    setCommunityData({
      ...communityData,
      classes: [...communityData.classes, newClassCategory],
    });
  };

  const handleStagedClassRequest = (classId, callVerb, data) => {
    setStagedClassRequests((prev) => {
      const currentEntry = prev[classId];

      if (currentEntry) {
        // Handle case when there's an existing entry for the given classId
        switch (currentEntry.callVerb) {
          case "add":
            if (callVerb === "edit") {
              // Transform "edit" on top of "add" to be a new "add"
              return {
                ...prev,
                [classId]: {
                  callVerb: "add",
                  type: "class",
                  data,
                },
              };
            } else if (callVerb === "delete") {
              // Remove the entry if "delete" comes after "add"
              const { [classId]: _, ...rest } = prev;
              return rest;
            }
            break;

          case "edit":
            if (callVerb === "delete") {
              // Keep only the "delete"
              const { [classId]: _, ...rest } = prev;
              return {
                ...rest,
                [classId]: {
                  callVerb: "delete",
                  type: "class",
                  data: null, // Assuming no data needed for delete
                },
              };
            }
            break;

          default:
            break;
        }
      }

      // No existing entry or other combinations
      return {
        ...prev,
        [classId]: {
          callVerb,
          type: "class",
          data,
        },
      };
    });
  };

  const onCreateSubclass = async (
    classCategoryId,
    basicClassInfo,
    signupForm,
  ) => {
    try {
      if (!signupForm || !signupForm.formConfig || !signupForm.fieldOrder) {
        throw new Error("Missing required signup form configuration");
      }

      const id = uuidv4();
      const newSubclass = {
        ...basicClassInfo,
        id,
        categoryId: classCategoryId,
        communityId: community._id,
        createdAt: new Date().toISOString(),
        signupForm: signupForm,
        signups: [],
        v: 1,
      };

      handleStagedClassRequest(newSubclass.id, "add", newSubclass);

      setCommunityData((prevState) => ({
        ...prevState,
        classes: prevState.classes.map((classCategory) =>
          classCategory.id === classCategoryId
            ? {
                ...classCategory,
                classes: [...(classCategory.classes || []), newSubclass],
              }
            : classCategory,
        ),
      }));

      toast.success("Class created successfully! Remember to save.");
      return newSubclass;
    } catch (error) {
      console.error("Error creating subclass:", error);
      toast.error("Failed to create class: " + error.message);
      throw error;
    }
  };

  const onUpdateSubclass = (classCategoryId, basicClassInfo, classData) => {
    try {
      if (!classCategoryId || !basicClassInfo.id) {
        throw new Error("Missing required class information");
      }

      const updatedClass = {
        ...basicClassInfo,
        communityId: community._id,
        signupForm: classData,
        categoryId: classCategoryId,
        v: 1,
      };

      // Stage the update request
      handleStagedClassRequest(basicClassInfo.id, "edit", updatedClass);

      // Update the UI state
      setCommunityData((prevState) => {
        const updatedClasses = prevState.classes.map((classCategory) => {
          if (classCategory.id === classCategoryId) {
            return {
              ...classCategory,
              classes: classCategory.classes.map((subclass) => {
                if (subclass.id === basicClassInfo.id) {
                  return updatedClass;
                }
                return subclass;
              }),
            };
          }
          return classCategory;
        });

        return {
          ...prevState,
          classes: updatedClasses,
        };
      });

      toast.success("Class updated successfully! Remember to save.");
      return updatedClass;
    } catch (error) {
      console.error("Error updating subclass:", error);
      toast.error("Failed to update class: " + error.message);
      throw error;
    }
  };

  const onUpdateSubclassField = (classCategoryId, subclassId, field, value) => {
    try {
      if (!classCategoryId || !subclassId || !field) {
        throw new Error("Missing required class information");
      }

      // Find the class category and subclass to get the title
      const category = communityData.classes.find(
        (cat) => cat.id === classCategoryId,
      );
      const subclass = category?.classes.find((cls) => cls.id === subclassId);

      if (!category || !subclass) {
        throw new Error("Class not found");
      }

      // Stage the update request
      handleStagedClassRequest(subclassId, "edit", {
        ...subclass,
        [field]: value,
      });

      // Update the UI state
      setCommunityData((prevState) => ({
        ...prevState,
        classes: prevState.classes.map((classCategory) => {
          if (classCategory.id === classCategoryId) {
            return {
              ...classCategory,
              classes: classCategory.classes.map((cls) => {
                if (cls.id === subclassId) {
                  return {
                    ...cls,
                    [field]: value,
                  };
                }
                return cls;
              }),
            };
          }
          return classCategory;
        }),
      }));

      toast.success("Class updated successfully! Remember to save.");
    } catch (error) {
      console.error("Error updating subclass field:", error);
      toast.error("Failed to update class: " + error.message);
    }
  };

  const onDeleteClassCategory = (classCategoryId) => {
    // First, find the category to check if it has any classes
    const categoryToDelete = communityData.classes.find(
      (category) => category.id === classCategoryId,
    );

    // If category not found, show error and return
    if (!categoryToDelete) {
      toast.error("Category not found");
      return;
    }

    // Check if the category has any classes
    if (categoryToDelete.classes && categoryToDelete.classes.length > 0) {
      toast.error(
        "Cannot delete category that contains classes. Please delete or move all classes first.",
      );
      return;
    }

    // If we reach here, it's safe to delete. Show confirmation dialog
    setDeleteDialogConfig({
      open: true,
      title: "Delete Category",
      description: `Are you sure you want to delete the category "${categoryToDelete.title}"? This action cannot be undone.`,
      onConfirm: () => {
        // Delete the category
        setCommunityData((prevState) => {
          const updatedClasses = prevState.classes.filter(
            (classCategory) => classCategory.id !== classCategoryId,
          );

          return {
            ...prevState,
            classes: updatedClasses,
          };
        });

        // Show success message
        toast.success("Category deleted successfully");

        // Close the dialog
        setDeleteDialogConfig({
          open: false,
          title: "",
          description: "",
          onConfirm: null,
        });
      },
    });
  };

  const handleMarketingHeaderChange = (e, name) => {
    const { value } = e.target;
    setCommunityData({
      ...communityData,
      content: {
        ...communityData.content,
        [name]: value,
      },
    });
  };

  const handleVolunteerSignUpHeaderChange = (value) => {
    setCommunityData({
      ...communityData,
      volunteerHeaderText: value,
    });
  };

  const handleVolunteerSignUpHeaderImageChange = (src) => {
    setCommunityData({
      ...communityData,
      volunteerHeaderImage: src,
    });
  };

  const handleSignUpFormIdChange = (value) => {
    setCommunityData({
      ...communityData,
      signUpFormId: value,
    });
  };

  const swapArrayElements = (array, index1, index2) => {
    const newArray = [...array];
    [newArray[index1], newArray[index2]] = [newArray[index2], newArray[index1]];
    return newArray;
  };

  const shiftUpClassCategory = (classCategoryId) => {
    setCommunityData((prevState) => {
      const index = prevState.classes.findIndex(
        (classCategory) => classCategory.id === classCategoryId,
      );
      if (index > 0) {
        const updatedClasses = swapArrayElements(
          prevState.classes,
          index,
          index - 1,
        );
        return {
          ...prevState,
          classes: updatedClasses,
        };
      }
      return prevState; // No change if the index is already the first one.
    });
  };

  const shiftDownClassCategory = (classCategoryId) => {
    setCommunityData((prevState) => {
      const index = prevState.classes.findIndex(
        (classCategory) => classCategory.id === classCategoryId,
      );
      if (index < prevState.classes.length - 1) {
        const updatedClasses = swapArrayElements(
          prevState.classes,
          index,
          index + 1,
        );
        return {
          ...prevState,
          classes: updatedClasses,
        };
      }
      return prevState; // No change if the index is already the last one.
    });
  };

  const shiftUpSubclass = (classCategoryId, subclassId) => {
    setCommunityData((prevState) => {
      const updatedClasses = prevState.classes.map((classCategory) => {
        if (classCategory.id === classCategoryId) {
          const index = classCategory.classes.findIndex(
            (subclass) => subclass.id === subclassId,
          );
          if (index > 0) {
            return {
              ...classCategory,
              classes: swapArrayElements(
                classCategory.classes,
                index,
                index - 1,
              ),
            };
          }
        }
        return classCategory;
      });

      return {
        ...prevState,
        classes: updatedClasses,
      };
    });
  };

  const shiftDownSubclass = (classCategoryId, subclassId) => {
    setCommunityData((prevState) => {
      const updatedClasses = prevState.classes.map((classCategory) => {
        if (classCategory.id === classCategoryId) {
          const index = classCategory.classes.findIndex(
            (subclass) => subclass.id === subclassId,
          );
          if (index < classCategory.classes.length - 1) {
            return {
              ...classCategory,
              classes: swapArrayElements(
                classCategory.classes,
                index,
                index + 1,
              ),
            };
          }
        }
        return classCategory;
      });

      return {
        ...prevState,
        classes: updatedClasses,
      };
    });
  };

  const onUpdateClassCategory = (categoryId, newTitle, newIcon, visibility) => {
    setCommunityData((prevState) => {
      const updatedClasses = prevState.classes.map((category) => {
        if (category.id === categoryId) {
          return {
            ...category,
            title: newTitle,
            icon: newIcon,
            visibility: visibility,
          };
        }
        return category;
      });

      return {
        ...prevState,
        classes: updatedClasses,
      };
    });
  };

  const closeYesNoDialog = () => {
    setDeleteDialogConfig({
      open: false,
      title: "",
      description: "",
      onConfirm: null,
    });
  };

  const onDeleteSubclass = (
    classCategoryId,
    subclassId,
    closeStepperFunction,
  ) => {
    if (!classCategoryId || !subclassId) {
      alert(JSON.stringify({ classCategoryId, subclassId }));
      toast.error("Missing required class information");
      return;
    }

    // Find the class category and subclass to get the title
    const category = communityData.classes.find(
      (cat) => cat.id === classCategoryId,
    );
    const subclass = category?.classes.find((cls) => cls.id === subclassId);

    if (!category || !subclass) {
      toast.error("Class not found");
      return;
    }

    setDeleteDialogConfig({
      open: true,
      title: "Delete Class",
      description: `Are you sure you want to delete the class "${subclass.title}" from category "${category.title}"? This action cannot be undone.`,
      onClose: () => {
        setDeleteDialogConfig({
          open: false,
          title: "",
          description: "",
          onConfirm: null,
        });
      },
      onConfirm: () => {
        // Stage the delete request
        handleStagedClassRequest(subclassId, "delete", null);

        if (closeStepperFunction) closeStepperFunction();
        // Update the UI state
        setCommunityData((prevState) => ({
          ...prevState,
          classes: prevState.classes.map((classCategory) => {
            if (classCategory.id === classCategoryId) {
              return {
                ...classCategory,
                classes: classCategory.classes.filter(
                  (cls) => cls.id !== subclassId,
                ),
              };
            }
            return classCategory;
          }),
        }));

        // Show success message
        toast.success("Class deleted successfully! Remember to save.");

        // Close the dialog
        setDeleteDialogConfig({
          open: false,
          title: "",
          description: "",
          onConfirm: null,
        });
      },
      classCategoryId,
      subclassId,
    });
  };

  const handleDeleteMarketingItem = (indexToDelete) => {
    // Prevent deletion if there are only 2 or fewer items
    if (marketingImageCount <= 2) {
      toast.error(
        "Cannot delete marketing item. At least 2 items must remain.",
      );
      return;
    }

    // Create a confirmation dialog before deleting
    if (
      !window.confirm(
        `Are you sure you want to delete marketing item ${indexToDelete}?`,
      )
    ) {
      return;
    }

    setCommunityData((prevData) => {
      const updatedContent = { ...prevData.content };

      // Remove the deleted item
      const headerKey = `marketingHeader${
        indexToDelete === 1 ? "" : indexToDelete
      }`;
      const imageKey = `marketingImage${indexToDelete}`;
      delete updatedContent[headerKey];
      delete updatedContent[imageKey];

      // If we're not deleting the last item, reorder the remaining items
      if (indexToDelete < marketingImageCount) {
        // Shift all items after the deleted one forward
        for (let i = indexToDelete + 1; i <= marketingImageCount; i++) {
          const currentHeaderKey = `marketingHeader${i === 1 ? "" : i}`;
          const currentImageKey = `marketingImage${i}`;
          const newIndex = i - 1;
          const newHeaderKey = `marketingHeader${
            newIndex === 1 ? "" : newIndex
          }`;
          const newImageKey = `marketingImage${newIndex}`;

          // Move the content to the new keys
          if (updatedContent[currentHeaderKey]) {
            updatedContent[newHeaderKey] = updatedContent[currentHeaderKey];
            delete updatedContent[currentHeaderKey];
          }
          if (updatedContent[currentImageKey]) {
            updatedContent[newImageKey] = updatedContent[currentImageKey];
            delete updatedContent[currentImageKey];
          }
        }
      }

      return {
        ...prevData,
        content: updatedContent,
      };
    });

    // Decrease the marketing image count
    setMarketingImageCount((prev) => prev - 1);

    toast.success("Marketing item deleted successfully.");
  };
  const toggleVolunteerSectionVisibility = (newState) => {
    setCommunityData((prevState) => ({
      ...prevState,
      isVolunteerSectionVisible: newState,
    }));
  };

  const toggleCalendarVisibility = (newState) => {
    setCommunityData((prevState) => ({
      ...prevState,
      showCalendar: newState,
    }));
  };

  const CategorySelectOptions = communityData?.classes?.map((category) => ({
    value: category.id,
    label: category.title,
    type: category.type,
  }));

  if (!hasLoaded) {
    return (
      <div
        style={{
          height: "100vh",
          padding: "5em",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <Loading size={100} />
      </div>
    );
  }

  if (hasLoaded && !community) {
    return (
      <div
        style={{
          height: "100vh",
          padding: "5em",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <Typography variant="h2" align="center" sx={{ my: 3 }}>
          Community not found
        </Typography>
      </div>
    );
  }

  const isHideVolunteerSection =
    typeof communityData?.isVolunteerSectionVisible !== "undefined" &&
    communityData?.isVolunteerSectionVisible === true;

  const isCalendarVisible = communityData?.showCalendar === true;

  return (
    <>
      <UnsavedChangesAlert hasUnsavedChanges={isDirty} />

      {deleteDialogConfig.open && (
        <AskYesNoDialog
          open={deleteDialogConfig.open}
          title={deleteDialogConfig.title}
          description={deleteDialogConfig.description}
          onConfirm={deleteDialogConfig.onConfirm}
          onCancel={deleteDialogConfig.onClose}
        />
      )}

      <Container sx={{ paddingTop: 3, marginBottom: 2 }}>
        <Breadcrumbs
          separator="-"
          aria-label="breadcrumb"
          sx={{ mx: "auto", width: "fit-content" }}
        >
          <Link
            color="inherit"
            href={rootUrl + "/admin-dashboard"}
            sx={{ display: "flex", alignItems: "center" }}
          >
            Admin Dashboard
          </Link>

          <Link
            variant="body1"
            style={{
              display: "flex",
              alignItems: "center",
              textTransform: "capitalize",
            }}
            href={rootUrl + `/edit/utah/${cityQuery}`}
          >
            {cityQuery.toLowerCase().endsWith("city")
              ? cityQuery.replaceAll("-", " ")
              : `${cityQuery.replaceAll("-", " ")} City`}
          </Link>

          <Typography
            variant="body1"
            sx={{
              display: "flex",
              alignItems: "center",
              textTransform: "capitalize",
              fontWeight: "bold",
              color: "black",
            }}
          >
            {communityQuery.replaceAll("-", " ")} Community
          </Typography>
        </Breadcrumbs>
        <Divider sx={{ my: 2 }} />
        <Typography variant="h2" align="center" color="primary">
          myHometown {community.city}
        </Typography>
        <Typography variant="h3" align="center" color="primary">
          <span style={{ textTransform: "capitalize" }}>
            {communityQuery.replace("-", " ")} Community
          </span>
        </Typography>
        <JsonViewer data={communityData} />
        <PhotoGallery
          photos={content.galleryPhotos}
          changePhoto={handleChangePhoto}
          variant="variant2"
          isEdit
        />
        <Grid container spacing={2} paddingY={3}>
          <Grid item xs={12}>
            <TextField
              variant="standard"
              value={content?.header || `What Is myHometown ${communityQuery}?`}
              onChange={(event) => handleHeaderChange(event)}
              multiline
              fullWidth
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: "2rem",
                  textAlign: "center",
                  color: (theme) => theme.palette.primary.main,
                  textTransform: "capitalize",
                  display: "flex",
                  justifyContent: "center", // Add this line
                  "& .Mui-focused": {
                    backgroundColor: "#f0f0f0",
                    borderRadius: "4px",
                  },
                },
              }}
              sx={{
                fontFamily: "inherit",
                fontSize: "2rem",
                border: "none",
                margin: 0,
                padding: "10px 16px",
                textAlign: "center",
                "& .MuiInputBase-input": {
                  textAlign: "center", // Add this line
                },
                "& .MuiInput-underline:before": {
                  borderBottom: "none",
                },
                "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                  borderBottom: "none",
                },
                "& .MuiInput-underline:after": {
                  borderBottom: "none",
                },
              }}
            />

            <TextField
              variant="standard"
              value={content?.paragraph1Text}
              onChange={(event) => handleParagraphChange(event, "paragraph1")}
              multiline
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: "1rem",
                  "& .Mui-focused": {
                    backgroundColor: "#f0f0f0", // Example of changing background color when focused
                    borderRadius: "4px",
                  },
                },
              }}
              fullWidth
              sx={{
                fontFamily: "inherit",
                fontSize: "1rem",
                border: "none",
                margin: 0,
                padding: "10px 16px",
                "& .MuiInput-underline:before": {
                  borderBottom: "none",
                },
                "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                  borderBottom: "none",
                },
                "& .MuiInput-underline:after": {
                  borderBottom: "none",
                },
                // Adding focused style here
              }}
            />
            <Divider />
            <TextField
              variant="standard"
              value={content?.paragraph2Text}
              onChange={(event) => handleParagraphChange(event, "paragraph2")}
              multiline
              InputProps={{
                disableUnderline: true,
              }}
              fullWidth
              sx={{
                fontFamily: "inherit",
                fontSize: "1rem",
                border: "none",
                margin: 0,
                padding: "10px 16px",
                "& .MuiInput-underline:before": {
                  borderBottom: "none",
                },
                "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                  borderBottom: "none",
                },
                "& .MuiInput-underline:after": {
                  borderBottom: "none",
                },
              }}
            />
          </Grid>
          <Grid item xs={12} display="flex" justifyContent="center">
            <Grid item xs={10} sm={8}>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                position="relative"
                sx={{
                  width: "100%",
                  height: "100%",
                  backgroundColor: "transparent",
                  border: "1px solid black",
                }}
              >
                <UploadImage setUrl={handleChangeMap} />
                {content?.mapUrl ? (
                  <img
                    src={content.mapUrl}
                    style={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                      border: "1px solid black",
                      boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
                    }}
                  />
                ) : (
                  <Typography variant="h4" component="h2" align="center">
                    Community map
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
          <Grid item xs={12} display="flex" justifyContent="center">
            <Divider sx={{ my: 5 }} />
          </Grid>

          <Divider sx={{ my: 5 }} />

          <Grid
            container
            item
            xs={12}
            display="flex"
            justifyContent="center"
            sx={{ position: "relative" }}
          >
            <Button
              onClick={
                // copy to clipboard
                () => {
                  navigator.clipboard.writeText(
                    `${window.location.href}#flyers`.replace(/edit\//g, ""),
                  );
                  toast.success("Link copied to clipboard");
                }
              }
              variant="text"
              sx={{ m: 0, position: "absolute", top: 0, right: 0 }}
            >
              <LinkIcon sx={{ mr: 1 }} />
            </Button>
            <MarketingItemEdit
              index={1}
              content={content}
              handleMarketingHeaderChange={handleMarketingHeaderChange}
              handleChangeMarketingImage={handleChangeMarketingImage}
              UploadImage={UploadImage}
              communityData={communityData}
              onDelete={handleDeleteMarketingItem}
              totalMarketingItems={marketingImageCount}
              showDeleteButton={true} // Can be deleted if more than 2 total
            />

            {/* Marketing Item 2 - Can be deleted when more than 2 total */}
            <MarketingItemEdit
              index={2}
              marginTop={6}
              content={content}
              handleMarketingHeaderChange={handleMarketingHeaderChange}
              handleChangeMarketingImage={handleChangeMarketingImage}
              UploadImage={UploadImage}
              communityData={communityData}
              onDelete={handleDeleteMarketingItem}
              totalMarketingItems={marketingImageCount}
              showDeleteButton={true} // Can be deleted if more than 2 total
            />

            <Box
              sx={{
                height: "40px",
                width: "100%",
                display: { xs: "none", md: "block" },
              }}
            />

            {/* Marketing Item 3 - Optional, can be deleted when more than 2 total */}
            {(content?.marketingImage3 || marketingImageCount >= 3) && (
              <MarketingItemEdit
                index={3}
                marginTop={6}
                content={content}
                handleMarketingHeaderChange={handleMarketingHeaderChange}
                handleChangeMarketingImage={handleChangeMarketingImage}
                UploadImage={UploadImage}
                communityData={communityData}
                onDelete={handleDeleteMarketingItem}
                totalMarketingItems={marketingImageCount}
                showDeleteButton={true} // This item can be deleted
              />
            )}

            {/* Marketing Item 4 - Optional, can be deleted when more than 2 total */}
            {(content?.marketingImage4 || marketingImageCount >= 4) && (
              <MarketingItemEdit
                index={4}
                marginTop={6}
                content={content}
                handleMarketingHeaderChange={handleMarketingHeaderChange}
                handleChangeMarketingImage={handleChangeMarketingImage}
                UploadImage={UploadImage}
                communityData={communityData}
                onDelete={handleDeleteMarketingItem}
                totalMarketingItems={marketingImageCount}
                showDeleteButton={true} // This item can be deleted
              />
            )}

            {/* Marketing Item 5 - Optional, can be deleted when more than 2 total */}
            {(content?.marketingImage5 || marketingImageCount >= 5) && (
              <MarketingItemEdit
                index={5}
                marginTop={6}
                content={content}
                handleMarketingHeaderChange={handleMarketingHeaderChange}
                handleChangeMarketingImage={handleChangeMarketingImage}
                UploadImage={UploadImage}
                communityData={communityData}
                onDelete={handleDeleteMarketingItem}
                totalMarketingItems={marketingImageCount}
                showDeleteButton={true} // This item can be deleted
              />
            )}

            {/* Marketing Item 6 - Optional, can be deleted when more than 2 total */}
            {(content?.marketingImage6 || marketingImageCount >= 6) && (
              <MarketingItemEdit
                index={6}
                marginTop={6}
                content={content}
                handleMarketingHeaderChange={handleMarketingHeaderChange}
                handleChangeMarketingImage={handleChangeMarketingImage}
                UploadImage={UploadImage}
                communityData={communityData}
                onDelete={handleDeleteMarketingItem}
                totalMarketingItems={marketingImageCount}
                showDeleteButton={true} // This item can be deleted
              />
            )}
          </Grid>

          {marketingImageCount < 6 && (
            <Grid item xs={12} display="flex" justifyContent="center">
              <Button
                variant="contained"
                color="primary"
                onClick={() => setMarketingImageCount(marketingImageCount + 1)}
              >
                Add Marketing Image
              </Button>
            </Grid>
          )}
        </Grid>
        {/* <Typography
          variant="h4"
          component="h2"
          textAlign="center"
          color="primary"
          gutterBottom
          sx={{ textTransform: "capitalize" }}
        >
          {communityQuery}&apos;s Community Statistics
        </Typography> */}
        {/* <StatsCounter stats={community.stats} isEdit /> */}
        <EventDialog_NewEdit
          show={isCreatingNewEvent || selectedEvent !== null}
          onClose={closeEventDialog}
          event={selectedEvent}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          isEdit={!isCreatingNewEvent}
          communityId={community._id}
        />
        <Grid item md={12}>
          <Divider sx={{ my: 5 }} />
        </Grid>
        <UpcomingEvents
          events={events}
          maxEvents={5}
          isEdit
          onSelect={onSelectEvent}
          onAdd={startCreatingNewEvent}
        />
        <Divider sx={{ my: 5 }} />

        <Grid item md={12} sx={{ justifyContent: "center", display: "flex" }}>
          <Button
            variant="outlined"
            onClick={() => toggleCalendarVisibility(!isCalendarVisible)}
            startIcon={isCalendarVisible ? <VisibilityOff /> : <Visibility />}
          >
            {isCalendarVisible
              ? "Hide Events Calendar"
              : "Show Events Calendar"}
          </Button>
        </Grid>

        {isCalendarVisible && (
          <>
            <EventsCalendar
              events={events}
              onSelectEvent={onSelectEvent}
              onSelectSlot={(slot) => setSelectedEvent(slot)}
              onAdd={startCreatingNewEvent}
              startCreatingNewEvent={startCreatingNewEvent}
              isEdit
            />
            <Divider sx={{ my: 5 }} />
          </>
        )}

        <JsonViewer data={communityData.classes} />
        <LoadedClassesProvider isEdit stagedRequests={stagedClassRequests}>
          <ClassesTreeView
            isEdit
            classes={communityData.classes}
            onCreateClassCategory={onCreateClassCategory}
            onCreateCategoryHeader={onCreateCategoryHeader}
            onCreateSubclass={onCreateSubclass}
            onDeleteClassCategory={onDeleteClassCategory}
            onDeleteSubclass={onDeleteSubclass}
            shiftDownClassCategory={shiftDownClassCategory}
            shiftUpClassCategory={shiftUpClassCategory}
            shiftUpSubclass={shiftUpSubclass}
            shiftDownSubclass={shiftDownSubclass}
            onUpdateClassCategory={onUpdateClassCategory}
            onUpdateSubclass={onUpdateSubclass}
            onUpdateSubclassField={onUpdateSubclassField}
            CategorySelectOptions={CategorySelectOptions}
          />
        </LoadedClassesProvider>
        <Divider sx={{ my: 5 }} />
        {!isHideVolunteerSection ? (
          <Grid item md={12} sx={{ justifyContent: "center", display: "flex" }}>
            <Button
              variant="outlined"
              onClick={() => toggleVolunteerSectionVisibility(true)}
              startIcon={<Visibility />}
            >
              Show Volunteer Section
            </Button>
          </Grid>
        ) : (
          <>
            <div style={{ position: "relative" }}>
              <Box
                sx={{
                  position: { md: "absolute" },
                  top: 0,
                  right: 0,
                  zIndex: 9999,
                  mr: 0,
                  mt: { md: 0, xs: 2 },
                  gap: 2,
                }}
              >
                <Button
                  variant="outlined"
                  onClick={() => setIsEditVolunteerForm(!isEditVolunteerForm)}
                  startIcon={!isEditVolunteerForm ? <Close /> : <Edit />}
                  sx={{ mr: 1 }}
                >
                  {!isEditVolunteerForm ? "Close" : "Edit"}
                </Button>

                <Button
                  variant="outlined"
                  onClick={() => toggleVolunteerSectionVisibility(false)}
                  startIcon={<VisibilityOff />}
                >
                  Hide Section
                </Button>
              </Box>

              {isEditVolunteerForm ? (
                <Grid
                  item
                  xs={8}
                  mt={4}
                  sx={{ mx: "auto" }}
                  display="flex"
                  flexDirection="column"
                  id="volunteer"
                >
                  <Button
                    variant="contained"
                    color="primary"
                    sx={{ mx: "auto", mb: 2, borderRadius: "8px", mt: 2, p: 0 }}
                    size="large"
                    fullWidth
                  >
                    <TextField
                      variant="standard"
                      value={
                        communityData.becomeVolunteerButtonText !== undefined
                          ? communityData.becomeVolunteerButtonText
                          : "Become A Volunteer"
                      }
                      onChange={(e) =>
                        setCommunityData({
                          ...communityData,
                          becomeVolunteerButtonText: e.target.value,
                        })
                      }
                      placeholder="Volunteer Button Text"
                      fullWidth
                      InputProps={{
                        disableUnderline: true,
                        sx: {
                          fontSize: "2rem",
                          textAlign: "center",
                          color: (theme) => theme.palette.primary.contrastText,
                          textTransform: "capitalize",
                          display: "flex",
                          justifyContent: "center",
                          background: "transparent",
                          "& .Mui-focused": {
                            backgroundColor: "#f0f0f0",
                            borderRadius: "4px",
                          },
                        },
                      }}
                      sx={{
                        fontFamily: "inherit",
                        fontSize: "2rem",
                        border: "none",
                        margin: 0,
                        padding: 0,
                        textAlign: "center",
                        background: "transparent",
                        "& .MuiInputBase-input": {
                          textAlign: "center",
                          background: "transparent",
                          color: (theme) => theme.palette.primary.contrastText,
                        },
                        "& .MuiInput-underline:before": {
                          borderBottom: "none",
                        },
                        "& .MuiInput-underline:hover:not(.Mui-disabled):before":
                          {
                            borderBottom: "none",
                          },
                        "& .MuiInput-underline:after": {
                          borderBottom: "none",
                        },
                      }}
                      inputProps={{ style: { textAlign: "center" } }}
                    />
                  </Button>
                  <TextField
                    variant="standard"
                    value={
                      communityData.volunteerHelperText ||
                      "Want to volunteer? Click here. We would love to have you as part of the myHometown family."
                    }
                    onChange={(e) =>
                      setCommunityData({
                        ...communityData,
                        volunteerHelperText: e.target.value,
                      })
                    }
                    multiline
                    fullWidth
                    InputProps={{
                      disableUnderline: true,
                      sx: {
                        fontSize: "larger",
                        textAlign: "center",
                      },
                    }}
                    sx={{
                      fontFamily: "inherit",
                      fontSize: "larger",
                      border: "none",
                      margin: 0,
                      padding: "10px 16px",
                      textAlign: "center",
                      "& .MuiInputBase-input": {
                        textAlign: "center",
                      },
                      "& .MuiInput-underline:before": {
                        borderBottom: "none",
                      },
                      "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                        borderBottom: "none",
                      },
                      "& .MuiInput-underline:after": {
                        borderBottom: "none",
                      },
                    }}
                    inputProps={{ style: { textAlign: "center" } }}
                  />
                </Grid>
              ) : (
                <VolunteerSignUps
                  isEdit
                  volunteerHeaderText={communityData.volunteerHeaderText}
                  volunteerHeaderImage={communityData.volunteerHeaderImage}
                  setVolunteerHeaderText={handleVolunteerSignUpHeaderChange}
                  setVolunteerHeaderImage={
                    handleVolunteerSignUpHeaderImageChange
                  }
                  signUpFormId={communityData.signUpFormId}
                  setSignUpFormId={handleSignUpFormIdChange}
                  onClose={() => {}}
                />
              )}
            </div>
          </>
        )}
      </Container>
    </>
  );
};

export default Page;
