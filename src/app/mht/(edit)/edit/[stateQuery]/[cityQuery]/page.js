"use client";
import {
  Card,
  Container,
  Divider,
  Grid,
  IconButton,
  TextField,
  Tooltip,
  Box,
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
import useCity from "@/hooks/use-city";
import Loading from "@/components/util/Loading";
import { useEdit } from "@/hooks/use-edit";
import PhotoGallery from "@/components/PhotoGallery";
import { cityTemplate } from "@/constants/templates/cityTemplate";
import { useHandleEvents } from "@/hooks/use-handle-events";
import RoleGuard from "@/guards/role-guard";
import { useUser } from "@/hooks/use-user";
import { Info } from "@mui/icons-material";
import UploadImage from "@/components/util/UploadImage";
import { CommunityCard } from "@/components/CommunityCard";
import { StatsCounter } from "@/components/StatsCounter";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";

const Page = ({ params }) => {
  const { user } = useUser();

  const { stateQuery, cityQuery } = params; //TODO change me to stateQuery... VsCode hates renaming folders

  const { city, hasLoaded } = useCity(cityQuery, stateQuery, cityTemplate);
  const { data: cityData, setData: setCityData, setEntityType } = useEdit();

  let events, content;

  if (cityData) {
    ({ events, content } = cityData);
  }

  useEffect(() => {
    if (city) {
      setCityData(city);
      setEntityType("city");
    }
  }, [city]);

  const [selectedEvent, setSelectedEvent] = useState(null);

  const [isCreatingNewEvent, setIsCreatingNewEvent] = useState(false);

  const startCreatingNewEvent = () => {
    setIsCreatingNewEvent(true);
  };

  const setEvents = (events) => {
    // Assume cityData is coming from useState or props
    setCityData((prevCityData) => ({
      ...prevCityData,
      events,
    }));
  };

  const modifyEvent = (modifiedEvent) => {
    const id = modifiedEvent.id;

    if (!id) {
      alert("no ID!!!!");
      return;
    }

    setCityData((prevCityData) => ({
      ...prevCityData,
      events: prevCityData.events.map((event) =>
        event.id === id ? modifiedEvent : event
      ),
    }));
  };

  const addEvent = (newEvent) => {
    const uniqueId = uuidv4();

    newEvent.id = uniqueId;

    setCityData((prevCityData) => ({
      ...prevCityData,
      events: [...prevCityData.events, newEvent],
    }));
  };

  const deleteEvent = (eventId) => {
    if (!eventId) {
      alert("No ID provided for deletion!");
      return;
    }

    setCityData((prevCityData) => ({
      ...prevCityData,
      events: prevCityData.events.filter((event) => event.id !== eventId),
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
      toast.success(
        "New Event Added - Make sure to save to sync your changes."
      );
    } else {
      toast.success("Event Modified - Make sure to save to sync your changes.");
      modifyEvent(event);
    }
    setSelectedEvent(null);
    setIsCreatingNewEvent(false);
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

  const handleChangeMap = (url) => {
    setCityData({
      ...cityData,
      content: {
        ...cityData.content,
        mapUrl: url,
      },
    });
  };

  const handleChangePhoto = (url, key) => {
    setCityData((prevState) => {
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

  const handleParagraphChange = (e, name) => {
    const { value } = e.target;

    if (name === "paragraph1") {
      setCityData({
        ...cityData,
        content: {
          ...cityData.content,
          paragraph1Text: value,
        },
      });
    } else {
      setCityData({
        ...cityData,
        content: {
          ...cityData.content,
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
          width: "100vh",
          padding: "5em",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <Loading size={100} />
      </div>
    );
  }

  if (hasLoaded && !city) {
    return (
      <div
        style={{
          height: "calc(100%-200px)",
          padding: "5em",
          justifyContent: "center",
          display: "flex",
        }}
      >
        <Typography variant="h2" align="center" sx={{ my: 3 }}>
          City not found
        </Typography>
      </div>
    );
  }

  const cityName = cityQuery.replaceAll("-", " ");

  const communityCardSize = city?.communities?.length
    ? 12 / city.communities.length
    : 12;

  console.log(city);

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
          onAdd={startCreatingNewEvent}
          startCreatingNewEvent={startCreatingNewEvent}
          isEdit
        />
      </Container>
    </>
  );
};
export default Page;

function onPasteAsPlainText(event) {
  event.preventDefault();
  var text = event.clipboardData.getData("text/plain");
  document.execCommand("insertHTML", false, text);
}
