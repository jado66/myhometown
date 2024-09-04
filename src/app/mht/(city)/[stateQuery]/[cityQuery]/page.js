"use client";
import {
  Box,
  CardMedia,
  Container,
  Divider,
  Grid,
  Typography,
} from "@mui/material";
import { useState } from "react";
import UpcomingEvents from "@/components/events/UpcomingEvents";
import { EventsCalendar } from "@/components/events/EventsCalendar";
import { EventDialog } from "@/components/events/EventDialog";
import useCity from "@/hooks/use-city";
import Loading from "@/components/util/Loading";
import PhotoGallery from "@/components/PhotoGallery";
import { cityTemplate } from "@/constants/templates/cityTemplate";
import { MultiLineTypography } from "@/components/MultiLineTypography";
import { StatsCounter } from "@/components/StatsCounter";
import { LightBox } from "@/components/LightBox";
import { ImageAccordion } from "@/components/ImageAccordion";
import { MyHometownHouse } from "@/assets/svg/logos/MyHometownHouse";
import CarouselComponent from "@/components/ui/Carousel";
import Link from "next/link";

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
            width: "100vw",
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
        <Typography variant="h2" align="center" sx={{ color: "black" }}>
          myHometown{" "}
          <span style={{ textTransform: "capitalize" }}>
            {cityName}
            {" - Utah"}
          </span>
        </Typography>

        <Grid container>
          <Grid item xs={10} sx={{ mx: "auto" }}>
            <Typography variant="h6" align="center" sx={{ color: "black" }}>
              myHometown Provo lifts neighborhoods to become places where
              neighbors want to invest their time, money, efforts, and have a
              desire to stay.
            </Typography>
          </Grid>
        </Grid>

        {/* <PhotoGallery photos={city.content.galleryPhotos} /> */}
        <CarouselComponent
          images={[
            "/myhometown/city-page/four people.webp",
            "/myhometown/city-page/russian.webp",
            "/myhometown/city-page/big grin.webp",
            "/myhometown/city-page/provo town hall.webp",
            "/myhometown/city-page/tutoring.webp",
          ]}
        />

        <Grid container spacing={2} paddingY={3}>
          <ImageDescriptionBlock
            index={0}
            imageSrc={"/myhometown/city-page/Party.webp"}
            content="We create opportunities to build camaraderie and strengthen friendships…"
          />
          <ImageDescriptionBlock
            index={1}
            imageSrc={"/myhometown/city-page/ESL class.webp"}
            content="…we support and enhance educational opportunities…"
          />
          <ImageDescriptionBlock
            index={2}
            imageSrc={"/myhometown/city-page/neighborhood-revitalization.webp"}
            content="…and improve the appearance of our neighborhoods."
          />
        </Grid>

        <Grid
          item
          xs={12}
          px={4}
          mb={4}
          display="flex"
          justifyContent="center"
          flexDirection="column"
        >
          <Typography variant="h5" textAlign="center" gutterBottom>
            Mayor Kaufusi on myHometown
          </Typography>

          <CardMedia
            component="video"
            poster="https://myhometown-bucket.s3.us-west-1.amazonaws.com/videos/Mayor+final+ss.webp"
            controls
            playsInline
            sx={{
              borderRadius: "12px",

              boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
              // height: { md: "485px", xs: "230px" },
            }}
            src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/videos/Provo+Mayor+Final.webm"
          />
        </Grid>

        <Divider sx={{ my: 4, mx: 4 }} />

        <Grid>
          <ImageWithAccordion
            imageSrc={"/myhometown/city-page/Dumpsters.webp"}
            title="What does Provo City do?"
            content={`Provo City actively supports myHometown by coordinating city resources and offering in-kind services such as supplying dumpsters, equipment, street cleaning, and tree removal. The
city also provides limited funding, including grants for specific projects.`}
            index={0}
          />

          <ImageWithAccordion
            imageSrc={"/myhometown/city-page/two men esl.webp"}
            title="What do volunteers do?"
            content={`Volunteers play a crucial role by staffing Community Resource Centers and organizing and participating in Days of Service.

Community Resource Center volunteers teach classes.

Days of service volunteers identify neighborhood needs and coordinate additional volunteers to complete neighborhood projects.
`}
            index={1}
          />

          <ImageWithAccordion
            imageSrc={"/myhometown/city-page/class women.webp"}
            title="What do neighbors do?"
            content={`Neighbors support community efforts by attending classes, encouraging their children to participate in tutoring sessions, volunteering at Days of Service and joining in social activities at the Community Resource Centers.  Neighbors can support myHometown Provo by asking, “How Can I Help?”`}
            index={2}
          />
          {/* <ImageWithAccordion
            imageSrc={"/myhometown/city-page/CRC reading.webp"}
            title="Community Resource Centers"
            content={`The Community Resource Center, or CRC, serves as a hub for the community,
by offering free educational classes and tutoring. Specific classes offered are
determined by neighborhood focus groups, ensuring they meet the needs and
interests of the community.`}
            index={3}
          />
          <ImageWithAccordion
            imageSrc={"/myhometown/city-page/grey hair weeder.webp"}
            title="Day of Service"
            content={`Volunteers join with community residents at large group events to re-landscape yards and parks, refurbish homes, address code violations, and more. It's not unusual to complete 10-15 projects in a single day and to repeat these Days of Service monthly throughout the spring and summer.`}
            index={4}
          /> */}
        </Grid>

        <Divider sx={{ my: 5 }} />

        <Typography
          variant="h4"
          component="h2"
          textAlign="center"
          sx={{ color: "black" }}
          gutterBottom
        >
          myHometown Communities in Provo
        </Typography>

        <Grid container>
          <Grid item xs={10} sx={{ mx: "auto" }}>
            <Typography variant="h6" align="center" sx={{ color: "black" }}>
              Click on one of the links below to see what's happening in your
              community
            </Typography>
          </Grid>
        </Grid>

        <Grid container spacing={5} padding={3}>
          {/* {city.communities &&
            city.communities.map((community, index) => (
              <CommunityCard
                key={community.name}
                community={community}
                city={cityQuery}
                gridProps={{ xs: 12, sm: communityCardSize }}
                index={index}
              />
            ))} */}
          <CommunityCard
            title="Pioneer Park"
            imageSrc="/myhometown/city-page/pioneer map.webp"
            href="./provo/pioneer-park"
            index={0}
          />
          <CommunityCard
            title="South Freedom"
            imageSrc="/myhometown/city-page/freedom.webp"
            href="./provo/south-freedom"
            index={1}
          />
          <CommunityCard
            title="Dixon"
            imageSrc="/myhometown/city-page/Dixon.webp"
            href="./provo/dixon"
            index={2}
          />
        </Grid>
      </Container>
    </>
  );
};
export default Page;

const CommunityCard = ({ imageSrc, title, href, index }) => {
  return (
    <Grid
      item
      xs={12}
      sm={6}
      sx={{ mx: "auto" }}
      display="flex"
      justifyContent="center"
      flexDirection="column"
    >
      <Typography variant="h5" textAlign="center" mb={2} mt={index > 1 ? 2 : 0}>
        {title}
      </Typography>
      <Link href={href}>
        <Grid item>
          <Box
            display="flex"
            flexDirection="column"
            justifyContent="center"
            alignItems="center"
            position="relative"
            sx={{
              width: "100%",
              height: "100%",
              backgroundColor: "transparent",
            }}
          >
            <Box
              component="img"
              src={imageSrc}
              style={{
                cursor: "pointer",
                width: "100%",
                height: "auto",
                objectFit: "cover",
                borderRadius: "12px",
                boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
              }}
            />
          </Box>
        </Grid>
      </Link>
    </Grid>
  );
};

const ImageDescriptionBlock = ({ index, content, imageSrc }) => {
  const descriptionContent = (
    <Grid
      item
      xs={12}
      sm={6}
      sx={{
        padding: 4,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="body1"
        sx={{
          color: "black",
          fontSize: "larger",
          mt: "auto",
          mb: "auto",
          fontSize: "larger",
        }}
      >
        {content}
      </Typography>
    </Grid>
  );

  const imageContent = (
    <Grid item xs={12} sm={6} sx={{ padding: 2, pt: { xs: 0, sm: 2 } }}>
      <Grid
        item
        xs={12}
        sx={{
          backgroundColor: "grey",
          height: "150px",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
          borderRadius: 3,
        }}
      >
        <Box
          component="img"
          src={imageSrc}
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
  );

  return (
    <>
      {index % 2 !== 0 ? (
        <>
          {imageContent}
          {descriptionContent}
        </>
      ) : (
        <>
          {descriptionContent}
          {imageContent}
        </>
      )}
    </>
  );
};

const ImageWithAccordion = ({
  title,
  bgColor,
  imageSrc,
  contentColor,
  content,
  index,
}) => {
  const bgColors = ["#a16faf", "#1b75bc", "#febc18", "#318d43", "#e45620"];
  const contentColors = ["#000", "#fff", "#000", "#000", "#000"];

  return (
    <Grid
      item
      xs={12}
      id="outer-card"
      sx={{
        m: 4,
        mt: 0,
        borderRadius: 3,
        p: "0 !important;",
        position: "relative",
        boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
      }}
    >
      <Grid
        item
        xs={12}
        sx={{
          backgroundColor: "grey",
          height: { sm: "375px", xs: "300px" },
          overflow: "hidden",
          position: "relative",
          borderRadius: 3,
        }}
      >
        <Box
          component="img"
          src={imageSrc}
          alt="Mental Health"
          sx={{
            borderRadius: 3,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            position: "absolute",
            bottom: "0%",
          }}
        />
      </Grid>
      <ImageAccordion
        title={title}
        content={content}
        bgColor={bgColor ? bgColor : bgColors[index]} //febc18 y - e45620 o - lb 1bc7bc - db 00357d - lp a16faf - lp 592569 - nc efefe7 - cg 63666a
        contentColor={contentColor ? contentColor : contentColors[index]}
        cornerIcon={<MyHometownHouse />}
        rounded
        right={index % 2 == 1}
      />
    </Grid>
  );
};
