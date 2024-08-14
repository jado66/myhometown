"use client";
import { Container, Divider, Grid, Typography } from "@mui/material";
import { useState } from "react";
import UpcomingEvents from "@/components/events/UpcomingEvents";
import { EventsCalendar } from "@/components/events/EventsCalendar";
import { EventDialog } from "@/components/events/EventDialog";
import useCity from "@/hooks/use-city";
import Loading from "@/components/util/Loading";
import PhotoGallery from "@/components/PhotoGallery";
import { cityTemplate } from "@/constants/templates/cityTemplate";
import { CommunityCard } from "@/components/CommunityCard";
import { MultiLineTypography } from "@/components/MultiLineTypography";
import { StatsCounter } from "@/components/StatsCounter";
import { LightBox } from "@/components/LightBox";

const Page = ({ params }) => {
  const { stateQuery, cityQuery } = params; //TODO change me to stateQuery... VsCode hates renaming folders

  const { city, hasLoaded } = useCity(cityQuery, stateQuery, cityTemplate);

  const [selectedEvent, setSelectedEvent] = useState(null);

  const closeEventDialog = () => {
    setSelectedEvent(null);
  };

  const onSelectEvent = (event) => {
    setSelectedEvent(event);
  };

  if (!hasLoaded) {
    return (
      <>
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
      </>
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
      <EventDialog
        open={selectedEvent}
        onClose={closeEventDialog}
        event={selectedEvent}
      />

      <Container sx={{ paddingTop: 3, marginBottom: 2 }}>
        <Typography variant="h2" align="center" color="primary">
          myHometown{" "}
          <span style={{ textTransform: "capitalize" }}>
            {cityName}
            {" - Utah"}
          </span>
        </Typography>

        <PhotoGallery photos={city.content.galleryPhotos} />

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

            <MultiLineTypography text={city.content.paragraph1Text} />

            <Divider />

            <MultiLineTypography text={city.content.paragraph2Text} />
          </Grid>
          <Grid item xs={12} display="flex" justifyContent="center">
            <Grid item md={6} sm={8} xs={10}>
              <img
                src={city.content?.mapUrl}
                style={{ width: "100%", height: "auto", objectFit: "cover" }}
              />
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

        <StatsCounter stats={city.stats} />

        {city.events?.length !== 0 && (
          <>
            <Grid item md={12}>
              <Divider sx={{ my: 5 }} />
            </Grid>
            <UpcomingEvents events={city.events} maxEvents={5} />

            <Divider sx={{ my: 5 }} />

            <EventsCalendar
              events={city.events}
              onSelectEvent={onSelectEvent}
            />
          </>
        )}
      </Container>
    </>
  );
};
export default Page;
