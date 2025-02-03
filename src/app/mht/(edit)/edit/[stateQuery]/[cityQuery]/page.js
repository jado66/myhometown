"use client";
import {
  Breadcrumbs,
  Button,
  CardMedia,
  Container,
  Divider,
  Grid,
  Typography,
  useTheme,
} from "@mui/material";

import { useEffect } from "react";

import { useCity } from "@/hooks/use-city";
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
import Link from "next/link";
import UnsavedChangesAlert from "@/components/util/UnsavedChangesAlert";

const Page = ({ params }) => {
  const { user } = useUser();

  const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";

  const { stateQuery, cityQuery } = params;

  const theme = useTheme();

  const { city, hasLoaded } = useCity(
    cityQuery,
    stateQuery,
    cityTemplate,
    true
  );
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

  const editStaggeredImage = (index, newUrl) => {
    setCityData((prevData) => ({
      ...prevData,
      content: {
        ...prevData.content,
        staggeredImages: prevData.content.staggeredImages.map(
          (staggeredImage, i) =>
            i === index
              ? { ...staggeredImage, imageSrc: newUrl }
              : staggeredImage
        ),
      },
    }));
  };

  const editStaggeredImageText = (index, newText) => {
    setCityData((prevData) => ({
      ...prevData,
      content: {
        ...prevData.content,
        staggeredImages: prevData.content.staggeredImages.map(
          (staggeredImage, i) =>
            i === index
              ? { ...staggeredImage, content: newText }
              : staggeredImage
        ),
      },
    }));
  };

  const addNewStaggeredImage = () => {
    setCityData((prevData) => {
      const lastItem =
        prevData.content.staggeredImages[
          prevData.content.staggeredImages.length - 1
        ];
      const newItem = { ...lastItem };

      return {
        ...prevData,
        content: {
          ...prevData.content,
          staggeredImages: [...prevData.content.staggeredImages, newItem],
        },
      };
    });
  };

  const removeLastStaggeredImage = () => {
    if (cityData.content?.staggeredImages.length === 1) {
      return;
    }

    setCityData((prevData) => {
      const updatedStaggeredImages = prevData.content.staggeredImages.slice(
        0,
        -1
      );

      return {
        ...prevData,
        content: {
          ...prevData.content,
          staggeredImages: updatedStaggeredImages,
        },
      };
    });
  };

  const editVideoTitle = (newTitle) => {
    setCityData((prevData) => ({
      ...prevData,
      content: {
        ...prevData.content,
        video: { ...prevData.content.video, title: newTitle },
      },
    }));
  };

  const editAccordionImage = (index, newUrl) => {
    setCityData((prevData) => ({
      ...prevData,
      content: {
        ...prevData.content,
        imageAccordions: prevData.content.imageAccordions.map((accordion, i) =>
          i === index ? { ...accordion, imageSrc: newUrl } : accordion
        ),
      },
    }));
  };

  const editAccordionTitle = (index, newTitle) => {
    setCityData((prevData) => ({
      ...prevData,
      content: {
        ...prevData.content,
        imageAccordions: prevData.content.imageAccordions.map(
          (imageAccordion, i) =>
            i === index
              ? { ...imageAccordion, title: newTitle }
              : imageAccordion
        ),
      },
    }));
  };

  const editAccordionContent = (index, newContent) => {
    setCityData((prevData) => ({
      ...prevData,
      content: {
        ...prevData.content,
        imageAccordions: prevData.content.imageAccordions.map(
          (imageAccordion, i) =>
            i === index
              ? { ...imageAccordion, content: newContent }
              : imageAccordion
        ),
      },
    }));
  };

  const addNewAccordion = () => {
    setCityData((prevData) => {
      const lastItem =
        prevData.content.imageAccordions[
          prevData.content.imageAccordions.length - 1
        ];
      const newItem = { ...lastItem };

      return {
        ...prevData,
        content: {
          ...prevData.content,
          imageAccordions: [...prevData.content.imageAccordions, newItem],
        },
      };
    });
  };

  const removeLastAccordion = () => {
    if (cityData.content?.imageAccordions.length === 1) {
      return;
    }

    setCityData((prevData) => {
      const updatedAccordions = prevData.content.imageAccordions.slice(0, -1);

      return {
        ...prevData,
        content: {
          ...prevData.content,
          imageAccordions: updatedAccordions,
        },
      };
    });
  };

  const editCommunityImage = (index, newUrl) => {
    setCityData((prevData) => ({
      ...prevData,
      communities: prevData.communities.map((community, i) =>
        i === index ? { ...community, imageSrc: newUrl } : community
      ),
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
      <UnsavedChangesAlert hasUnsavedChanges={false} />

      <Container sx={{ paddingTop: 3, marginBottom: 2 }}>
        <Breadcrumbs
          separator="-"
          aria-label="breadcrumb"
          sx={{ mx: "auto", width: "fit-content" }}
        >
          <Link
            color="inherit"
            href={rootUrl + "/admin-dashboard"}
            sx={{ display: "flex", alignItems: "center" }}
          >
            Admin Dashboard
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
            {cityQuery.toLowerCase().endsWith("city")
              ? cityQuery.replaceAll("-", " ")
              : `${cityQuery.replaceAll("-", " ")} City`}
          </Typography>
        </Breadcrumbs>
        <Divider sx={{ my: 2 }} />

        <Typography variant="h2" align="center" sx={{ color: "black" }}>
          myHometown{" "}
          <span style={{ textTransform: "capitalize" }}>{cityName}</span>
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
              isEdit
              key={index}
              index={index}
              imageSrc={image.imageSrc}
              content={image.content}
              setImageSrc={editStaggeredImage}
              editText={editStaggeredImageText}
            />
          ))}
          <Grid item xs={12} display="flex" justifyContent="center">
            <Button
              onClick={addNewStaggeredImage}
              variant="outlined"
              sx={{ mr: 1 }}
            >
              Add New Staggered Image Section
            </Button>
            <Button
              onClick={removeLastStaggeredImage}
              variant="outlined"
              disabled={cityData.content?.staggeredImages.length === 1}
            >
              Remove Last Section
            </Button>
          </Grid>
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
          <StyledTextField
            variant="h5"
            sx={{ textAlign: "center", mb: 1 }}
            value={cityData.content?.video.title}
            onChange={(newValue) => editVideoTitle(newValue)}
          />

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
              editImageSrc={editAccordionImage}
              editContent={editAccordionContent}
              editTitle={editAccordionTitle}
              index={index}
              isEdit
            />
          ))}
          <Grid item xs={12} display="flex" justifyContent="center">
            <Button onClick={addNewAccordion} variant="outlined" sx={{ mr: 1 }}>
              Add New Image Accordion
            </Button>
            <Button
              onClick={removeLastAccordion}
              disabled={cityData.content?.imageAccordions.length === 1}
              variant="outlined"
            >
              Remove Last
            </Button>
          </Grid>
        </Grid>

        <Divider sx={{ my: 5 }} />
        <StyledTextField
          variant="h4"
          sx={{ textAlign: "center", color: "black !important" }}
          value={cityData.content?.communitiesHeader}
          onChange={(newValue) => editTextByKey("communitiesHeader", newValue)}
        />

        <Grid container>
          <Grid item xs={10} sx={{ mx: "auto" }}>
            <StyledTextField
              variant="h6"
              sx={{ textAlign: "center", color: "black !important" }}
              value={cityData.content?.communitiesSubheader}
              onChange={(newValue) =>
                editTextByKey("communitiesSubheader", newValue)
              }
            />
          </Grid>
        </Grid>

        <Grid container spacing={5} padding={3}>
          {cityData?.communities &&
            cityData?.communities.map((community, index) => (
              <CommunityCard
                isEdit
                setUrl={(newUrl) => editCommunityImage(index, newUrl)}
                key={index}
                title={community.title + " Community "}
                imageSrc={
                  community.imageSrc ||
                  "/myhometown/city-page/city-placeholder.jpg"
                }
                href={community.href}
                index={index}
              />
            ))}
        </Grid>
        {/* <Grid container spacing={5} padding={3}>
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
        </Grid> */}
      </Container>
    </>
  );
};
export default Page;
