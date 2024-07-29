"use client";
import { Card, Container, Divider, Grid, Typography } from "@mui/material";
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

const communityDataContentTemplate = {
  paragraph1Text: faker.lorem.paragraph(),
  paragraph2Text: faker.lorem.paragraph(),
};

const Page = ({ params }) => {
  const { stateQuery, communityQuery } = params;

  const { community, hasLoaded } = useCommunity(
    communityQuery,
    stateQuery,
    communityTemplate
  );

  const {
    data: communityData,
    setData: setCommunityData,
    setEntityType,
  } = useEdit();

  const { content, events } = communityData;

  useEffect(() => {
    if (community) {
      setCommunityData({
        content: { ...communityDataContentTemplate },
        ...community,
      });
      setEntityType("community");
    }
  }, [community]);

  const paragraph1Ref = useRef();
  const paragraph2Ref = useRef();

  const [selectedEvent, setSelectedEvent] = useState(null);

  const [isCreatingNewEvent, setIsCreatingNewEvent] = useState(false);

  const startCreatingNewEvent = () => {
    setIsCreatingNewEvent(true);
  };

  const setEvents = (events) => {
    // this is cityData.events
    setCommunityData({
      ...communityData,
      events,
    });
  };

  const { deleteEvent, modifyEvent, addEvent } = useHandleEvents(setEvents);

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
          myHometown{" "}
          <span style={{ textTransform: "capitalize" }}>
            {cityName}
            {" - Utah"}
          </span>
        </Typography>

        <PhotoGallery
          photos={city.content.galleryPhotos}
          changePhoto={handleChangePhoto}
          isEdit
        />

        <Grid container spacing={2} paddingY={3}>
          <Grid item xs={12}>
            <Typography
              variant="h3"
              align="center"
              color="primary"
              gutterBottom
            >
              What Is myHometown{" "}
              <span style={{ textTransform: "capitalize" }}>{cityName}</span>?
            </Typography>

            <TextField
              variant="standard"
              defaultValue={content?.paragraph1Text}
              onChange={(event) => handleParagraphChange(event, "paragraph1")}
              multiline
              InputProps={{
                disableUnderline: true,
                sx: { fontSize: "1rem" },
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
            <Divider />
            <TextField
              variant="standard"
              defaultValue={cityData.content?.paragraph2Text}
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
                  {cityData.content?.mapUrl ? (
                    <img
                      src={cityData.content.mapUrl}
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
          {cityName}&apos;s Communities
        </Typography>

        <Grid container spacing={2} paddingY={3}>
          {city.communities &&
            city.communities.map((community, index) => (
              <CommunityCard
                key={community.name}
                community={community}
                city={cityQuery}
                gridProps={{ xs: 12, sm: communityCardSize }}
                index={index}
              />
            ))}
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
          {cityName}&apos;s Community Statistics
        </Typography>

        <StatsCounter stats={city.stats} isEdit />

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

        {/* <pre>{JSON.stringify(cityData.events, null, 4)}</pre> */}

        <UpcomingEvents
          events={cityData.events}
          maxEvents={5}
          isEdit
          onSelect={onSelectEvent}
          onAdd={startCreatingNewEvent}
        />

        <Divider sx={{ my: 5 }} />

        {/* <pre>{JSON.stringify(cityData, null, 4)}</pre> */}

        <EventsCalendar
          events={events}
          onSelectEvent={onSelectEvent}
          onSelectSlot={(slot) => setSelectedEvent(slot)}
          isEdit
        />
      </Container>
    </>
  );
};

export default Page;
