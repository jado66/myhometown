"use client";
import {
  Box,
  CardMedia,
  Container,
  Divider,
  Grid,
  Typography,
} from "@mui/material";

import useCity from "@/hooks/use-city";
import Loading from "@/components/util/Loading";
import { cityTemplate } from "@/constants/templates/cityTemplate";
import CarouselComponent from "@/components/ui/Carousel";
import { ImageWithAccordion } from "@/components/MyHometown/PageComponents/ImageWithAccordion";
import { ImageDescriptionBlock } from "@/components/MyHometown/PageComponents/ImageDescriptionBlock";
import { CommunityCard } from "@/components/MyHometown/PageComponents/CommunityCard";

const Page = ({ params }) => {
  const { stateQuery, cityQuery } = params;

  const { city, hasLoaded } = useCity(cityQuery, stateQuery, cityTemplate);

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

  // const communityCardSize = city?.communities?.length
  //   ? 12 / city.communities.length
  //   : 12;

  console.log(city);

  return (
    <>
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
              {city.content.paragraph1Text}
            </Typography>
          </Grid>
        </Grid>

        <CarouselComponent images={city.content.carousalImages} />

        <Grid container spacing={2} paddingY={3}>
          {city.content.staggeredImages.map((image, index) => (
            <ImageDescriptionBlock
              key={index}
              index={index}
              imageSrc={image.imageSrc}
              content={image.content}
            />
          ))}
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
            {city.content.video.title}
          </Typography>

          <CardMedia
            component="video"
            poster={city.content.video.mediaThumbnail}
            controls
            playsInline
            sx={{
              borderRadius: "12px",
              boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
            }}
            src={city.content.video.mediaSrc}
          />
        </Grid>

        <Divider sx={{ my: 4, mx: 4 }} />

        <Grid>
          {city.content.imageAccordions.map((accordion, index) => (
            <ImageWithAccordion
              key={index}
              imageSrc={accordion.imageSrc}
              title={accordion.title}
              content={accordion.content}
              index={index}
            />
          ))}
        </Grid>

        <Divider sx={{ my: 5 }} />

        <Typography
          variant="h4"
          component="h2"
          textAlign="center"
          sx={{ color: "black" }}
          gutterBottom
        >
          {city.content.communitiesHeader}
        </Typography>

        <Grid container>
          <Grid item xs={10} sx={{ mx: "auto" }}>
            <Typography variant="h6" align="center" sx={{ color: "black" }}>
              {city.content.communitiesSubheader}
            </Typography>
          </Grid>
        </Grid>

        <Grid container spacing={5} padding={3}>
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
