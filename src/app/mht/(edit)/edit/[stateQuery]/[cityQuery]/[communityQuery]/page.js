"use client";
import {
  Box,
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
import { EventDialog } from "@/components/events/EventDialog";
import { EventDialog_NewEdit } from "@/components/events/EventDialog_NewEdit";
import useEvents from "@/hooks/use-events";
import useCommunity from "@/hooks/use-community";
import Loading from "@/components/util/Loading";
import { useEdit } from "@/hooks/use-edit";
import { useHandleEvents } from "@/hooks/use-handle-events";
import { communityTemplate } from "@/constants/templates/communityTemplate";
import PhotoGallery from "@/components/PhotoGallery";
import RoleGuard from "@/guards/role-guard";
import { useUser } from "@/hooks/use-user";
import { Info } from "@mui/icons-material";
import UploadImage from "@/components/util/UploadImage";
import { StatsCounter } from "@/components/StatsCounter";
import { v4 as uuidv4 } from "uuid";
import { VolunteerSignUps } from "@/components/VolunteerSignUps";
import { LightBox } from "@/components/LightBox";
import { ClassesTreeView } from "@/components/events/ClassesTreeView";

const communityDataContentTemplate = {
  paragraph1Text: faker.lorem.paragraph(),
  paragraph2Text: faker.lorem.paragraph(),
};

const Page = ({ params }) => {
  const { stateQuery, cityQuery, communityQuery } = params;
  const { user } = useUser();

  const { community, hasLoaded } = useCommunity(
    communityQuery,
    cityQuery,
    stateQuery,
    communityTemplate
  );

  const {
    data: communityData,
    setData: setCommunityData,
    setEntityType,
  } = useEdit();

  let events, content;

  if (communityData) {
    ({ events, content } = communityData);
  }

  useEffect(() => {
    if (community) {
      setCommunityData({
        content: { ...communityDataContentTemplate },
        ...community,
      });
      setEntityType("community");
    }
  }, [community]);

  const [selectedEvent, setSelectedEvent] = useState(null);

  const [isCreatingNewEvent, setIsCreatingNewEvent] = useState(false);

  const startCreatingNewEvent = () => {
    setIsCreatingNewEvent(true);
  };

  const setEvents = (events) => {
    // this is events
    setCommunityData({
      ...communityData,
      events,
    });
  };

  const modifyEvent = (id, modifiedEvent) => {
    if (!id) {
      alert("no ID!!!!");
      return;
    }

    setCommunityData((prevCommunityData) => ({
      ...prevCommunityData,
      events: prevCommunityData.events.map((event) =>
        event.id === id ? modifiedEvent : event
      ),
    }));
  };

  const addEvent = (newEvent) => {
    const uniqueId = uuidv4();

    newEvent.id = uniqueId;

    setCommunityData((prevCommunityData) => ({
      ...prevCommunityData,
      events: [...prevCommunityData.events, newEvent],
    }));
  };

  const deleteEvent = (eventId) => {
    if (!eventId) {
      alert("No ID provided for deletion!");
      return;
    }

    setCommunityData((prevCommunityData) => ({
      ...prevCommunityData,
      events: prevCommunityData.events.filter((event) => event.id !== eventId),
    }));
  };
  const closeEventDialog = () => {
    setSelectedEvent(null);
    setIsCreatingNewEvent(false);
  };

  const onSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const handleSaveEvent = (event) => {
    if (isCreatingNewEvent) {
      addEvent(event);
    } else {
      modifyEvent(event.id, event);
    }
    setSelectedEvent(null);
    setIsCreatingNewEvent(false);
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
      toast.success("Event Deleted - Make sure to save to sync your changes.");
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

  const onCreateSubclass = (classCategoryId, iconName, title, googleFormID) => {
    const id = uuidv4();

    const newSubclass = {
      icon: iconName,
      title: title,
      id: id,
      googleFormID: googleFormID,
    };

    setCommunityData((prevState) => {
      // Find the index of the class category where the new subclass should be added
      const updatedClasses = prevState.classes.map((classCategory) => {
        if (classCategory.id === classCategoryId) {
          return {
            ...classCategory,
            classes: [...classCategory.classes, newSubclass],
          };
        }
        return classCategory;
      });

      return {
        ...prevState,
        classes: updatedClasses,
      };
    });
  };

  const onDeleteSubclass = (classCategoryId, subclassId) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this subclass?"
    );

    if (shouldDelete) {
      setCommunityData((prevState) => {
        const updatedClasses = prevState.classes.map((classCategory) => {
          if (classCategory.id === classCategoryId) {
            return {
              ...classCategory,
              classes: classCategory.classes.filter(
                (subclass) => subclass.id !== subclassId
              ),
            };
          }
          return classCategory;
        });

        return {
          ...prevState,
          classes: updatedClasses,
        };
      });
    }
  };

  const onDeleteClassCategory = (classCategoryId) => {
    const shouldDelete = window.confirm(
      "Are you sure you want to delete this class category?"
    );

    if (shouldDelete) {
      setCommunityData((prevState) => {
        const updatedClasses = prevState.classes.filter(
          (classCategory) => classCategory.id !== classCategoryId
        );

        return {
          ...prevState,
          classes: updatedClasses,
        };
      });
    }
  };

  const handleMarketingHeaderChange = (e, name) => {
    const { value } = e.target;
    setCommunityData({
      ...communityData,
      content: {
        ...communityData.content,
        marketingHeader: value,
      },
    });
  };

  const handleVolunteerSignUpHeaderChange = (e, name) => {
    const { value } = e.target;
    setCommunityData({
      ...communityData,
      volunteerHeaderText: value,
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
        (classCategory) => classCategory.id === classCategoryId
      );
      if (index > 0) {
        const updatedClasses = swapArrayElements(
          prevState.classes,
          index,
          index - 1
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
        (classCategory) => classCategory.id === classCategoryId
      );
      if (index < prevState.classes.length - 1) {
        const updatedClasses = swapArrayElements(
          prevState.classes,
          index,
          index + 1
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
    alert(JSON.stringify({ classCategoryId, subclassId }));
    setCommunityData((prevState) => {
      const updatedClasses = prevState.classes.map((classCategory) => {
        if (classCategory.id === classCategoryId) {
          const index = classCategory.classes.findIndex(
            (subclass) => subclass.id === subclassId
          );
          if (index > 0) {
            return {
              ...classCategory,
              classes: swapArrayElements(
                classCategory.classes,
                index,
                index - 1
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
            (subclass) => subclass.id === subclassId
          );
          if (index < classCategory.classes.length - 1) {
            return {
              ...classCategory,
              classes: swapArrayElements(
                classCategory.classes,
                index,
                index + 1
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

  const onUpdateClassCategory = (categoryId, newTitle, newIcon) => {
    setCommunityData((prevState) => {
      const updatedClasses = prevState.classes.map((category) => {
        if (category.id === categoryId) {
          return {
            ...category,
            title: newTitle,
            icon: newIcon,
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

  const onUpdateSubclass = (categoryId, subclassId, data) => {
    setCommunityData((prevState) => {
      const updatedClasses = prevState.classes.map((category) => {
        if (category.id === categoryId) {
          const updatedSubclasses = category.classes.map((subclass) => {
            if (subclass.id === subclassId) {
              return {
                ...subclass,
                ...data,
              };
            }
            return subclass;
          });

          return {
            ...category,
            classes: updatedSubclasses,
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

  return (
    <>
      <Container sx={{ paddingTop: 3, marginBottom: 2 }}>
        <Typography variant="h2" align="center" color="primary">
          myHometown Orem
        </Typography>

        <Typography variant="h3" align="center" color="primary">
          <span style={{ textTransform: "capitalize" }}>
            {communityQuery.replace("-", " ")} Community
          </span>
        </Typography>

        {/* <pre>{JSON.stringify(communityData, null, 4)}</pre> */}

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

          <TextField
            variant="standard"
            value={content?.marketingHeader || "Your Flyer Title"}
            onChange={(event) => handleMarketingHeaderChange(event)}
            multiline
            InputProps={{
              disableUnderline: true,
              style: {
                fontSize: "2rem",
                textAlign: "center",
                color: "#00357d",
                textTransform: "capitalize",
              },
            }}
            fullWidth
            sx={{
              fontFamily: "inherit",
              fontSize: "2rem",
              border: "none",
              margin: 0,
              padding: "10px 16px",
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
              "& .Mui-focused": {
                backgroundColor: "#f0f0f0",
                borderRadius: "4px",
              },
            }}
          />

          <Divider sx={{ my: 5 }} />

          <Grid item xs={12} display="flex" justifyContent="center">
            <Grid item xs={12} sm={6}>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                position="relative"
                sx={{
                  px: 1,
                  width: "100%",
                  height: "100%",
                  backgroundColor: "transparent",
                }}
              >
                <UploadImage
                  setUrl={(url) => handleChangeMarketingImage(url, 1)}
                />
                {communityData.content?.marketingImage1 ? (
                  <Box
                    component="img"
                    src={communityData.content.marketingImage1}
                    sx={{
                      width: "100%",
                      height: "auto",
                      objectFit: "cover",
                      boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
                      borderRadius: 4,
                    }}
                    onClick={() =>
                      openImageDialog(communityData.content.marketingImage1)
                    }
                  />
                ) : (
                  <Typography variant="h4" component="h2" align="center">
                    Marketing Image 1
                  </Typography>
                )}
              </Box>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Box
                display="flex"
                justifyContent="center"
                alignItems="center"
                position="relative"
                sx={{
                  px: 1,
                  width: "100%",
                  height: "100%",
                  minHeight: "100px",
                  backgroundColor: "transparent",
                }}
              >
                <UploadImage
                  setUrl={(url) => handleChangeMarketingImage(url, 2)}
                />
                {communityData.content?.marketingImage2 ? (
                  <Box
                    component="img"
                    src={communityData.content.marketingImage2}
                    sx={{
                      width: "100%",
                      borderRadius: 4,
                      height: "auto",
                      boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
                      objectFit: "cover",
                    }}
                    onClick={() =>
                      openImageDialog(communityData.content.marketingImage2)
                    }
                  />
                ) : (
                  <Typography variant="h4" component="h2" align="center">
                    Marketing Image 2
                  </Typography>
                )}
              </Box>
            </Grid>
          </Grid>
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
        />
        <Grid item md={12}>
          <Divider sx={{ my: 5 }} />
        </Grid>

        {/* <pre>{JSON.stringify(events, null, 4)}</pre> */}

        <UpcomingEvents
          events={communityData.events}
          maxEvents={5}
          isEdit
          onSelect={onSelectEvent}
          onAdd={startCreatingNewEvent}
        />

        <Divider sx={{ my: 5 }} />

        {/* <pre>{JSON.stringify(cityData, null, 4)}</pre> */}

        <EventsCalendar
          events={communityData.events}
          onSelectEvent={onSelectEvent}
          onSelectSlot={(slot) => setSelectedEvent(slot)}
          onAdd={startCreatingNewEvent}
          startCreatingNewEvent={startCreatingNewEvent}
          isEdit
        />
        <Divider sx={{ my: 5 }} />

        <ClassesTreeView
          isEdit
          classes={communityData.classes}
          onCreateClassCategory={onCreateClassCategory}
          onCreateSubclass={onCreateSubclass}
          onDeleteClassCategory={onDeleteClassCategory}
          onDeleteSubclass={onDeleteSubclass}
          shiftDownClassCategory={shiftDownClassCategory}
          shiftUpClassCategory={shiftUpClassCategory}
          shiftUpSubclass={shiftUpSubclass}
          shiftDownSubclass={shiftDownSubclass}
          onUpdateClassCategory={onUpdateClassCategory}
          onUpdateSubclass={onUpdateSubclass}
        />
        <Divider sx={{ my: 5 }} />

        <VolunteerSignUps
          isEdit
          volunteerHeaderText={communityData.volunteerHeaderText}
          setVolunteerHeaderText={handleVolunteerSignUpHeaderChange}
          signUpFormId={communityData.signUpFormId}
          setSignUpFormId={handleSignUpFormIdChange}
          onClose={() => {}}
        />
      </Container>
    </>
  );
};

export default Page;
