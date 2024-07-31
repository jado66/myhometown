"use client";
import {
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Container,
  Divider,
  Grid,
  Typography,
  Button,
  Link,
  Box,
} from "@mui/material";
import ContentEditable from "react-contenteditable";
import { useEffect, useState, useRef } from "react";
import UpcomingEvents from "@/components/events/UpcomingEvents";
import { EventsCalendar } from "@/components/events/EventsCalendar";
import { EventDialog } from "@/components/events/EventDialog";
import useEvents from "@/hooks/use-events";

import Loading from "@/components/util/Loading";
import useCommunity from "@/hooks/use-community";
import BackButton from "@/components/BackButton";
import { communityTemplate } from "@/constants/templates/communityTemplate";
import PhotoGallery from "@/components/PhotoGallery";
import BrushIcon from "@mui/icons-material/Brush"; // Example icon - make sure to import actual icons you want to use
import TranslateIcon from "@mui/icons-material/Translate";
import { ClassesTreeView } from "@/components/events/ClassesTreeView";
import { MultiLineTypography } from "@/components/MultiLineTypography";

const Page = ({ params }) => {
  const { stateQuery, cityQuery, communityQuery } = params; //TODO change me to stateQuery... VsCode hates renaming folders

  const { community, hasLoaded } = useCommunity(
    communityQuery,
    cityQuery,
    stateQuery,
    communityTemplate
  );

  const { events, isLoading, error, deleteEvent, modifyEvent, updateEvent } =
    useEvents();

  const [selectedEvent, setSelectedEvent] = useState(null);

  const closeEventDialog = () => {
    setSelectedEvent(null);
  };

  const onSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  const handleParagraphChange = (e, name) => {
    const { value } = e.target;

    if (name === "paragraph1") {
      setParagraph1Text(value);
    } else {
      setParagraph2Text(value);
    }

    localStorage.setItem(name, value);
  };
  useEffect(() => {
    if (community && hasLoaded) {
      localStorage.setItem("lastCommunity", JSON.stringify(community));
    }
  }, [community, hasLoaded]);

  const alertNotEdit = () => {
    alert("this isn't edit");
  };

  if (!hasLoaded) {
    return (
      <div
        style={{
          flex: 1,
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
          height: "calc(100%-200px)",
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
      <EventDialog
        open={selectedEvent}
        onClose={closeEventDialog}
        event={selectedEvent}
      />

      <Container sx={{ paddingTop: 3, marginBottom: 2 }}>
        {/* <BackButton
          text={`Back to ${cityQuery.replaceAll("-", " ")}`}
          href={`../../../${stateQuery}/${cityQuery}`}
        /> */}

        <Typography
          variant="h2"
          align="center"
          sx={{ textTransform: "capitalize" }}
        >
          {communityQuery.replaceAll("-", " ")} Community
        </Typography>

        <PhotoGallery
          photos={community.content.galleryPhotos}
          variant="variant2"
        />

        <Grid container spacing={2} paddingY={3}>
          <Grid item xs={12}>
            <Typography
              variant="h4"
              align="center"
              color="primary"
              gutterBottom
            >
              {community.content.header}
            </Typography>

            <MultiLineTypography text={community.content.paragraph1Text} />

            <Divider />

            <MultiLineTypography text={community.content.paragraph2Text} />
          </Grid>
        </Grid>
        <Grid item xs={12} display="flex" justifyContent="center">
          <Grid item xs={10} sm={8} md={6}>
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
              <img
                src={community?.content?.mapUrl}
                style={{
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                }}
              />
            </Box>
          </Grid>
        </Grid>

        <Grid item xs={12} display="flex" justifyContent="center">
          <Divider sx={{ my: 5 }} />
        </Grid>

        <Grid
          item
          xs={12}
          display="flex"
          justifyContent="center"
          flexDirection="column"
        >
          {community?.content?.marketingHeader && (
            <Typography
              variant="h4"
              align="center"
              sx={{ textTransform: "capitalize", mb: 5, color: "#00357d" }}
            >
              {community.content?.marketingHeader}
            </Typography>
          )}

          {community?.content?.marketingImage1 && (
            <>
              <Grid item xs={12} display="flex" justifyContent="center">
                <Grid item xs={12} sm={6}>
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    position="relative"
                    sx={{
                      px: 0.5,
                      width: "100%",
                      height: "100%",
                      backgroundColor: "transparent",
                    }}
                  >
                    <img
                      src={community?.content?.marketingImage1}
                      style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    position="relative"
                    sx={{
                      px: 0.5,
                      width: "100%",
                      height: "100%",
                      minHeight: "100px",
                      backgroundColor: "transparent",
                    }}
                  >
                    <img
                      src={community?.content.marketingImage2}
                      style={{
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                      }}
                    />
                  </Box>
                </Grid>
              </Grid>
            </>
          )}
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 5 }} />
        </Grid>
        <UpcomingEvents
          events={community.events}
          maxEvents={5}
          isLoading={isLoading}
        />

        <Divider sx={{ my: 5 }} />

        <EventsCalendar
          events={community.events}
          onSelectEvent={onSelectEvent}
          isLoading={isLoading}
        />

        <Divider sx={{ my: 5 }} />

        <ClassesTreeView
          classes={community.classes}
          onCreateClassCategory={alertNotEdit}
          onCreateSubclass={alertNotEdit}
          onDeleteClassCategory={alertNotEdit}
          onDeleteSubclass={alertNotEdit}
          shiftDownClassCategory={alertNotEdit}
          shiftUpClassCategory={alertNotEdit}
          shiftUpSubclass={alertNotEdit}
          shiftDownSubclass={alertNotEdit}
        />
      </Container>
    </>
  );
};

export default Page;
