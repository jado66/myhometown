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

  // Call the useCities function with the community parameter to fetch the data
  const paragraph1Ref = useRef();
  const paragraph2Ref = useRef();

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

  if (!hasLoaded) {
    return (
      <>
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
      </>
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
        <BackButton
          text={`Back to ${cityQuery.replaceAll("-", " ")}`}
          href={`../../../${stateQuery}/${cityQuery}`}
        />

        <Typography
          variant="h2"
          align="center"
          sx={{ textTransform: "capitalize" }}
        >
          {communityQuery.replaceAll("-", " ")} Community
        </Typography>

        <PhotoGallery photos={community.content.galleryPhotos} />

        <Grid container spacing={2} paddingY={3}>
          <Grid item xs={12}>
            <Typography
              variant="h3"
              align="center"
              color="primary"
              gutterBottom
            >
              What Is myHometown
            </Typography>

            <MultiLineTypography text={community.content.paragraph1Text} />

            <Divider />

            <MultiLineTypography text={community.content.paragraph2Text} />
          </Grid>
        </Grid>
        <Grid container spacing={2} paddingY={3}>
          <Grid item xs={12}>
            <Card
              sx={{
                height: "300px",
                alignContent: "center",
                justifyContent: "center",
              }}
            >
              <Typography variant="h4" component="h2" align="center">
                Community map
              </Typography>
            </Card>
          </Grid>
        </Grid>

        <Divider sx={{ my: 5 }} />

        <UpcomingEvents events={events} maxEvents={5} isLoading={isLoading} />

        <Divider sx={{ my: 5 }} />

        <EventsCalendar
          events={events}
          onSelectEvent={onSelectEvent}
          isLoading={isLoading}
        />

        <Divider sx={{ my: 5 }} />

        <ClassesTreeView classes={mockClassesData} />
      </Container>
    </>
  );
};

export default Page;

const mockClassesData = [
  {
    icon: <BrushIcon />,
    title: "Art Classes",
    id: 1,
    classes: [
      {
        icon: <BrushIcon />,
        id: 2,
        title: "Watercolor Painting",
        googleFormID: "1SkvcoXcd8VbeKUg8gPGGgOMYjdYGZ-BA7jWEfAq4Lkc",
      },
      {
        icon: <BrushIcon />,
        id: 3,
        title: "Oil Painting",
        googleFormID: "1SkvcoXcd8VbeKUg8gPGGgOMYjdYGZ-BA7jWEfAq4Lkc",
      },
    ],
  },
  {
    icon: <TranslateIcon />,
    title: "Language Classes",
    id: 4,
    classes: [
      {
        icon: <TranslateIcon />,
        title: "English for Beginners",
        id: 5,
        googleFormID: "1SkvcoXcd8VbeKUg8gPGGgOMYjdYGZ-BA7jWEfAq4Lkc",
      },
      {
        icon: <TranslateIcon />,
        id: 6,
        title: "Advanced Spanish",
        googleFormID: "1vw4oEsH0Zaca7PX_tzxsuLt0vtf33jihVB8dxpriaf8",
      },
    ],
  },
];
