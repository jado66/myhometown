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

  const modifyEvent = (modifiedEvent) => {
    const id = modifiedEvent.id;

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
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: "2rem",
                  textAlign: "center",
                  color: (theme) => theme.palette.primary.main,
                  textTransform: "capitalize",
                  "& .Mui-focused": {
                    backgroundColor: "#f0f0f0",
                    borderRadius: "4px",
                  },
                },
              }}
              fullWidth
              sx={{
                fontFamily: "inherit",
                fontSize: "2rem",
                border: "none",
                margin: 0,
                padding: "10px 16px",
                textAlign: "center",
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
            <Grid item xs={10} sm={8} md={6}>
              <RoleGuard
                roles={["admin"]}
                user={user}
                alternateContent={
                  <Tooltip
                    title="Only an Admin can modify this."
                    placement="top"
                    arrow
                  >
                    <Info
                      style={{
                        position: "absolute",
                        top: 0,
                        right: 0,
                        margin: "0.5em",
                      }}
                    />
                  </Tooltip>
                }
              >
                <Box
                  display="flex"
                  justifyContent="center"
                  alignItems="center"
                  position="relative"
                  sx={{
                    width: "100%",
                    height: "100%",
                    backgroundColor: "transparent",
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
                      }}
                    />
                  ) : (
                    <Typography variant="h4" component="h2" align="center">
                      Community map
                    </Typography>
                  )}
                </Box>
              </RoleGuard>
            </Grid>
          </Grid>
        </Grid>

        <Divider sx={{ my: 5 }} />

        <Typography
          variant="h4"
          component="h2"
          textAlign="center"
          color="primary"
          gutterBottom
          sx={{ textTransform: "capitalize" }}
        >
          {communityQuery}&apos;s Community Statistics
        </Typography>

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
          isEdit
        />
      </Container>
    </>
  );
};

export default Page;
