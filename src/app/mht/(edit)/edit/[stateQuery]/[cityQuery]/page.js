"use client";
import {
  CardMedia,
  Container,
  Divider,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";

import { useEffect } from "react";

import useCity from "@/hooks/use-city";
import Loading from "@/components/util/Loading";
import { useEdit } from "@/hooks/use-edit";
import { cityTemplate } from "@/constants/templates/cityTemplate";

import { useUser } from "@/hooks/use-user";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";

import CarouselComponent from "@/components/ui/Carousel";
import { ImageWithAccordion } from "@/components/MyHometown/PageComponents/ImageWithAccordion";
import { ImageDescriptionBlock } from "@/components/MyHometown/PageComponents/ImageDescriptionBlock";
import { CommunityCard } from "@/components/MyHometown/PageComponents/CommunityCard";
import StyledTextField from "@/components/MyHometown/PageComponents/StyledTextField";

const Page = ({ params }) => {
  const { user } = useUser();

  const { stateQuery, cityQuery } = params;

  const theme = useTheme();

  const { city, hasLoaded } = useCity(cityQuery, stateQuery, cityTemplate);
  const { data: cityData, setData: setCityData, setEntityType } = useEdit();

  const editTextByKey = (key, newText) => {
    setCityData((prevData) => ({
      ...prevData,
      content: {
        ...prevData.content,
        [key]: newText,
      },
    }));
  };

  const editCarouselImage = (index, newImageSrc) => {
    setCityData((prevData) => ({
      ...prevData,
      content: {
        ...prevData.content,
        carousalImages: prevData.content.carousalImages.map((img, i) =>
          i === index ? newImageSrc : img
        ),
      },
    }));
  };

  const addCarouselImage = (newImageSrc) => {
    setCityData((prevData) => ({
      ...prevData,
      content: {
        ...prevData.content,
        carousalImages: [...prevData.content.carousalImages, newImageSrc],
      },
    }));
  };

  const removeCarouselImage = (index) => {
    setCityData((prevData) => ({
      ...prevData,
      content: {
        ...prevData.content,
        carousalImages: prevData.content.carousalImages.filter(
          (_, i) => i !== index
        ),
      },
    }));
  };

  useEffect(() => {
    if (city) {
      setCityData(city);
      setEntityType("city");
    }
  }, [city]);

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

  if (hasLoaded && !cityData) {
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
        <pre>{JSON.stringify(cityData.content, null, 4)}</pre>

        <Typography variant="h2" align="center" sx={{ color: "black" }}>
          myHometown{" "}
          <span style={{ textTransform: "capitalize" }}>
            {cityName}
            {" - Utah"}
          </span>
        </Typography>

        <Grid container>
          <Grid item xs={10} sx={{ mx: "auto" }}>
            <StyledTextField
              variant="h6"
              sx={{ textAlign: "center", color: "black !important" }}
              value={cityData.content?.paragraph1Text}
              onChange={(newValue) => editTextByKey("paragraph1Text", newValue)}
            />
          </Grid>
        </Grid>

        <CarouselComponent
          images={cityData.content?.carousalImages}
          isEdit
          removeCarouselImage={removeCarouselImage}
          editCarouselImage={editCarouselImage}
          addCarouselImage={addCarouselImage}
        />

        <Grid container spacing={2} paddingY={3}>
          {cityData.content?.staggeredImages.map((image, index) => (
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
            {cityData.content?.video.title}
          </Typography>

          <CardMedia
            component="video"
            poster={cityData.content?.video.mediaThumbnail}
            controls
            playsInline
            sx={{
              borderRadius: "12px",
              boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
            }}
            src={cityData.content?.video.mediaSrc}
          />
        </Grid>

        <Divider sx={{ my: 4, mx: 4 }} />

        <Grid>
          {cityData.content?.imageAccordions.map((accordion, index) => (
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
          {cityData.content?.communitiesHeader}
        </Typography>

        <Grid container>
          <Grid item xs={10} sx={{ mx: "auto" }}>
            <Typography variant="h6" align="center" sx={{ color: "black" }}>
              {cityData.content?.communitiesSubheader}
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
