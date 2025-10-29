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
import { LoadedClassesProvider } from "@/contexts/LoadedClassesProvider";
import { useEvents } from "@/hooks/useEvents";
import MarketingItem from "@/components/community/MarketingItem";
import { VolunteerSignupForm } from "@/components/volunteers/VolunteerSignupForm";

// export const dynamic = "force-dynamic";
// export const revalidate = 0;

const Page = ({ params }) => {
  const { stateQuery, cityQuery, communityQuery } = params; //TODO change me to stateQuery... VsCode hates renaming folders
  const [selectedImage, setSelectedImage] = useState();

  const {
    community,
    hasLoaded,
    error: communityError,
  } = useCommunity(communityQuery, cityQuery, stateQuery, communityTemplate);

  const [showSignUp, setShowSignup] = useState(false);

  const { fetchEvents } = useEvents();
  const [events, setEvents] = useState([]);

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

  useEffect(() => {
    if (community) {
      if (!community._id) {
        return;
      }

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
    }
  }, [community]);

  useEffect(() => {
    // Check if the page has loaded and if there's a hash in the URL
    if (hasLoaded && typeof window !== "undefined") {
      // Get the hash from the URL (without the #)
      const hash = window.location.hash.replace("#", "");

      if (hash) {
        // Find the element with the matching ID

        // set timeout
        setTimeout(() => {
          const element = document.getElementById(hash);

          if (element) {
            const headerOffset = 66;
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition =
              elementPosition + window.pageYOffset - headerOffset;

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            });
          }
        }, 1500);
      }
    }
  }, [hasLoaded]);

  const alertNotEdit = () => {
    alert("this isn't edit");
  };

  const openImageDialog = (image) => {
    setSelectedImage(image);
  };

  const closeImageDialog = () => {
    setSelectedImage(null);
  };

  const isShowVolunteerSection = community.isVolunteerSectionVisible === true;

  const BreadcrumbSection = () => {
    return (
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
          style={{
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
    );
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

  // Handle specific error states
  if (communityError) {
    if (communityError.status === 404) {
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

    if (communityError.status === 403) {
      return (
        <>
          <Box
            sx={{
              mt: 3,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              width: "100%",
            }}
          >
            <BreadcrumbSection />
            <Divider sx={{ my: 2, width: "100%" }} />
          </Box>
          <MaintenanceMode />
        </>
      );
    }
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
        <BreadcrumbSection />

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
        <Grid item xs={12}>
          <Grid
            id="flyers"
            container
            spacing={2} // Adds spacing between items
            display="flex"
            justifyContent="center"
            flexDirection="row" // Ensure items are laid out in a row
            flexWrap="wrap" // Allow wrapping of items
          >
            {community?.content?.marketingImage1 && (
              <MarketingItem
                index={1}
                marginTop={6}
                content={community?.content}
                openImageDialog={openImageDialog}
                communityData={community}
              />
            )}

            {community?.content?.marketingImage2 && (
              <MarketingItem
                index={2}
                marginTop={6}
                content={community?.content}
                openImageDialog={openImageDialog}
                communityData={community}
              />
            )}

            {/* Spacer for medium and larger screens */}
            <Box
              sx={{
                height: "40px",
                width: "100%",
                display: { xs: "none", md: "block" },
              }}
            />

            {community?.content?.marketingImage3 && (
              <MarketingItem
                index={3}
                marginTop={6}
                content={community?.content}
                openImageDialog={openImageDialog}
                communityData={community}
              />
            )}

            {community?.content?.marketingImage4 && (
              <MarketingItem
                index={4}
                marginTop={6}
                content={community?.content}
                openImageDialog={openImageDialog}
                communityData={community}
              />
            )}
          </Grid>

          {/* Helper text for marketing images */}
          <Box sx={{ width: "100%", textAlign: "center", mt: 1 }}>
            <Typography variant="body2" color="text.secondary">
              Click any image for a larger view
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12}>
          <Divider sx={{ my: 5 }} />
        </Grid>
        <UpcomingEvents
          onSelect={onSelectEvent}
          events={events}
          maxEvents={5}
        />
        <Divider sx={{ my: 5 }} id="events" />
        <EventsCalendar events={events} onSelectEvent={onSelectEvent} />
        <Divider sx={{ my: 5 }} />

        <LoadedClassesProvider>
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
        </LoadedClassesProvider>

        <>
          <Divider sx={{ my: 5 }} />

          <div>
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
                  <Typography variant="h5">Become A Volunteer</Typography>
                </Button>
                <Typography
                  variant="body"
                  sx={{ fontSize: "larger", textAlign: "center" }}
                >
                  Want to volunteer? Click here. We would love to have you as
                  part of the family.
                </Typography>
              </Grid>
            ) : (
              <>
                <VolunteerSignupForm
                  communityId={community._id}
                  communityName={`${communityQuery.replaceAll(
                    "-",
                    " "
                  )} Community`}
                />
              </>
            )}
          </div>
        </>

        <Divider sx={{ my: 5 }} />
      </Container>
    </>
  );
};

export default Page;
