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
  Breadcrumbs,
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
import { VolunteerSignUps } from "@/components/VolunteerSignUps";
import { LightBox } from "@/components/LightBox";
import { MaintenanceMode } from "@/views/supportingPages";

const Page = ({ params }) => {
  const { stateQuery, cityQuery, communityQuery } = params; //TODO change me to stateQuery... VsCode hates renaming folders
  const [selectedImage, setSelectedImage] = useState();

  const { community, hasLoaded } = useCommunity(
    communityQuery,
    cityQuery,
    stateQuery,
    communityTemplate
  );

  const [showSignUp, setShowSignup] = useState(false);

  const { events, isLoading, error, deleteEvent, modifyEvent, updateEvent } =
    useEvents();

  const [selectedEvent, setSelectedEvent] = useState(null);

  const closeEventDialog = () => {
    setSelectedEvent(null);
  };

  const onSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  useEffect(() => {
    if (community && hasLoaded) {
      localStorage.setItem("lastCommunity", JSON.stringify(community));
    }
  }, [community, hasLoaded]);

  const alertNotEdit = () => {
    alert("this isn't edit");
  };

  const openImageDialog = (image) => {
    setSelectedImage(image);
  };

  const closeImageDialog = () => {
    setSelectedImage(null);
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
    return <MaintenanceMode />;
  }

  return (
    <>
      <LightBox closeImageDialog={closeImageDialog} image={selectedImage} />

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

        <Breadcrumbs
          separator="-"
          aria-label="breadcrumb"
          sx={{ mx: "auto", width: "fit-content" }}
        >
          <Link
            color="inherit"
            href="/"
            sx={{ display: "flex", alignItems: "center" }}
          >
            Home
          </Link>

          <Link
            color="inherit"
            href={`../${cityQuery}`}
            sx={{
              display: "flex",
              alignItems: "center",
              textTransform: "capitalize",
            }}
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
          <Grid item xs={10} sm={10} md={8}>
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
                onClick={() => openImageDialog(community?.content?.mapUrl)}
                src={community?.content?.mapUrl}
                style={{
                  cursor: "pointer",
                  width: "100%",
                  height: "auto",
                  objectFit: "cover",
                  border: "1px solid black",
                  boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
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
          {community?.content?.marketingImage1 && (
            <>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  {community?.content?.marketingHeader && (
                    <Typography
                      variant="h4"
                      align="center"
                      sx={{
                        textTransform: "capitalize",
                        mb: 2,
                        color: "#00357d",
                      }}
                    >
                      {community.content?.marketingHeader}
                    </Typography>
                  )}
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    position="relative"
                    sx={{
                      width: "100%",
                      backgroundColor: "transparent",
                    }}
                  >
                    <Box
                      component="img"
                      src={community.content.marketingImage1}
                      sx={{
                        cursor: "pointer",
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                        boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
                        borderRadius: 4,
                      }}
                      onClick={() =>
                        openImageDialog(community.content.marketingImage1)
                      }
                    />
                  </Box>
                </Grid>

                <Grid item xs={12} md={6}>
                  {community?.content?.marketingHeader2 && (
                    <Typography
                      variant="h4"
                      align="center"
                      sx={{
                        textTransform: "capitalize",
                        mt: { md: 0, xs: 6 },
                        mb: 2,
                        color: "#00357d",
                      }}
                    >
                      {community.content?.marketingHeader2}
                    </Typography>
                  )}
                  <Box
                    display="flex"
                    justifyContent="center"
                    alignItems="center"
                    position="relative"
                    sx={{
                      width: "100%",
                      minHeight: "100px",
                      backgroundColor: "transparent",
                    }}
                  >
                    <Box
                      component="img"
                      src={community.content.marketingImage2}
                      sx={{
                        cursor: "pointer",
                        width: "100%",
                        height: "auto",
                        objectFit: "cover",
                        boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
                        borderRadius: 4,
                      }}
                      onClick={() =>
                        openImageDialog(community.content.marketingImage2)
                      }
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
          onSelect={onSelectEvent}
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
        <Divider sx={{ my: 5 }} />

        {!showSignUp ? (
          <Grid
            item
            xs={6}
            mt={4}
            sx={{ mx: "auto" }}
            display="flex"
            flexDirection="column"
            id="volunteer"
          >
            <Button
              variant="contained"
              onClick={() => setShowSignup(true)}
              sx={{ mx: "auto", mb: 2, borderRadius: "8px" }}
              size="large"
              fullWidth
            >
              <Typography variant="h5">Become a Volunteer</Typography>
            </Button>
            <Typography
              variant="body"
              sx={{ fontSize: "larger", textAlign: "center" }}
            >
              Want to volunteer? Click here. We would love to have you as part
              of the family.
            </Typography>
          </Grid>
        ) : (
          <>
            <VolunteerSignUps
              volunteerHeaderText={community.volunteerHeaderText}
              volunteerHeaderImage={community.volunteerHeaderImage}
              setVolunteerHeaderText={alertNotEdit}
              signUpFormId={community.signUpFormId}
              setSignUpFormId={alertNotEdit}
              onClose={() => setShowSignup(false)}
              sx={{ backgroundColor: "#1b75bc !important;" }}
            />
          </>
        )}
        <Divider sx={{ my: 5 }} />
      </Container>
    </>
  );
};

export default Page;

const ImageDescriptionBlock = () => {
  return (
    <>
      <Grid
        item
        xs={12}
        sm={6}
        sx={{ padding: 4, display: "flex", flexDirection: "column" }}
      >
        <Typography variant="body1" sx={{ color: "black", fontSize: "larger" }}>
          At myHometown, we revitalize aging neighborhoods by refurbishing homes
          and buildings, renewing landscapes, and adding new educational
          opportunities through Community Resource Centers.
        </Typography>
        <Divider sx={{ my: 3 }} />
        <Typography variant="body1" sx={{ color: "black", fontSize: "larger" }}>
          We lift the lives of residents and attract individuals and families
          who want to move in, stay and contribute to the long-term viability of
          the community.
        </Typography>
      </Grid>

      <Grid item xs={12} sm={6} sx={{ padding: 4, pt: { xs: 0, sm: 4 } }}>
        <Grid
          item
          xs={12}
          sx={{
            backgroundColor: "grey",
            height: "350px",
            overflow: "hidden",
            position: "relative",
            boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
            borderRadius: 3,
          }}
        >
          <Box
            component="img"
            src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/MHT+landing+page+photos/Photos+1/IMG_0246.jpeg"
            alt="Mental Health"
            // Lazy load the image
            sx={{
              borderRadius: 3,
              width: "100%",
              height: "100%",
              objectFit: "cover", // Ensures the image covers the entire area
              position: "absolute",
              objectPosition: "center", // Centers the image horizontally
              top: "0",
              left: "0px",
            }}
          />
        </Grid>
      </Grid>
    </>
  );
};
