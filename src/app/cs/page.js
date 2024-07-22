"use client";
import React, { useState } from "react";
import {
  useTheme,
  Accordion,
  Alert,
  Typography,
  Button,
  Grid,
  Divider,
  Fade,
  Box,
} from "@mui/material";
import Image from "next/image";
import useMediaQuery from "@mui/material/useMediaQuery";

import { styled } from "@mui/system";
import ProviderWrapper from "@/contexts/ProviderWrapper";
import { CitiesStrongLayout } from "@/layout";
import { ImageAccordion } from "@/components/ImageAccordion";
import { default as VisibilitySensor } from "react-visibility-sensor";

const Page = () => {
  const [showInfoAlert, setShowInfoAlert] = useState(true);

  const [isVisible, setIsVisible] = useState({
    0: false,
    1: false,
    2: false,
    3: false,
  });

  const setViewPortVisibility = (index, visibility) => {
    if (!visibility) return;

    setIsVisible((p) => ({ ...p, [index]: visibility }));
  };

  const theme = useTheme();

  return (
    <ProviderWrapper theme="alt">
      <CitiesStrongLayout>
        {/* <ContainerStyled maxWidth = "sm" id = 'main-container' > */}

        <>
          <Grid
            id="box"
            item
            xs={12}
            sx={{
              backgroundColor: "grey",
              height: {
                sm: "280px",
                xs: "150px",
                display: "flex",
                alignItems: "start",
              },
              overflow: "hidden",
              position: "relative",
            }}
          >
            {/* component="iframe"
              sx={{
                boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
                height: { md: "485px", xs: "230px" },
              }}
              src="/cities-strong/ScottSorensenInterview.mp4"
              title="Video 1" */}
            <Box
              component="iframe"
              sx={{
                boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
                height: { md: "312px", xs: "230px" },
                width: "100%",
              }}
              src="/cities-strong/BannerCSF.mp4"
              title="Video 1"
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            sx={{ padding: 4, display: "flex", flexDirection: "column" }}
          >
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              Our Name is our mission. We build strong cities through a culture
              of love and service.
            </Typography>
            <ButtonStyled
              variant="outlined"
              sx={{ mr: "auto", mt: 3 }}
              href="/about"
            >
              Learn More
            </ButtonStyled>
            <Divider sx={{ borderWidth: 3, borderColor: "black", mt: 4 }} />
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
              }}
            >
              <img
                src="/cities-strong/homepage/mother-daughter.webp"
                alt="Mental Health"
                // Lazy load the image
                style={{
                  width: "100%",
                  height: "100%",
                  objectFit: "cover", // Ensures the image covers the entire area
                  position: "absolute",
                  objectPosition: "right", // Shifts the image to the left
                  top: "0",
                  left: "0px",
                }}
              />
            </Grid>

            <Divider
              sx={{
                display: { xs: "none", md: "block" },
                borderWidth: 3,
                borderColor: "black",
                mt: 4,
              }}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={6}
            sx={{
              padding: 4,
              pt: 0,
              display: "flex",
              flexDirection: "column",
              height: { sm: "220px" },
            }}
          >
            <Typography variant="h5" sx={{ flexGrow: 1 }}>
              We do it by supporting community programs that revitalize
              neighborhoods, inspire education, and lift lives.
            </Typography>
            {/* <ButtonStyled variant='outlined'  sx = {{mr:'auto', mt:3}}
                href = '/about'
              >
                Learn More
              </ButtonStyled> */}
            <Divider
              sx={{
                borderWidth: 1.5,
                mx: 2,
                borderColor: "black",
                mt: 4,
                display: { xs: "block", sm: "none" },
              }}
            />
          </Grid>

          <VisibilitySensor
            onChange={(isVisible) => setViewPortVisibility(0, isVisible)}
            delayedCall
          >
            <Grid
              item
              xs={12}
              sm={6}
              sx={{
                padding: 4,
                pt: 0,
                display: "flex",
                flexDirection: "column",
                height: { sm: "220px" },
              }}
            >
              <Typography variant="h5" sx={{ flexGrow: 1 }}>
                Our vision is to see beautiful, thriving communities full of
                happiness, peace, and personal growth.
              </Typography>
              {/* <ButtonStyled variant='outlined'  sx = {{mr:'auto', mt:3}}
                href = '/about'
              >
                Learn More
              </ButtonStyled> */}
            </Grid>
          </VisibilitySensor>

          <VisibilitySensor
            onChange={(isVisible) => setViewPortVisibility(1, isVisible)}
            delayedCall
          >
            <Fade timeout={500} in={isVisible[0]}>
              <Grid
                item
                xs={12}
                sx={{
                  m: 4,
                  mt: 0,
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
                  }}
                >
                  <Box
                    component="img"
                    src="/cities-strong/homepage/neighborhood-revitalization.webp"
                    alt="Mental Health"
                    sx={{
                      width: { sm: "100%", xs: "auto" },
                      minWidth: "100%",
                      height: "auto",
                      position: "absolute",
                      bottom: "-20%",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  />
                </Grid>
                <ImageAccordion
                  title="Neighborhood Revitalization"
                  content={`We support My Hometown's neighbor helping neighbor programs including Days of Service and Community Resource Centers.`}
                />
              </Grid>
            </Fade>
          </VisibilitySensor>

          <VisibilitySensor
            onChange={(isVisible) => setViewPortVisibility(2, isVisible)}
            delayedCall
          >
            <Fade timeout={500} in={isVisible[1]}>
              <Grid
                item
                xs={12}
                sx={{
                  m: 4,
                  mt: 0,
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
                  }}
                >
                  <Box
                    component="img"
                    src="/cities-strong/homepage/kids-learning.webp"
                    alt="Kids Learning"
                    sx={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      position: "absolute",
                      bottom: "0%",
                    }}
                  />
                </Grid>

                <ImageAccordion
                  title="Enhancing Public Education"
                  content="We partner with schools to enhance literacy, leadership and academic achievement that will help students succeed in life."
                  bgColor="#188D4E"
                  contentColor="#ffffff"
                  right
                />
              </Grid>
            </Fade>
          </VisibilitySensor>

          <VisibilitySensor
            onChange={(isVisible) => setViewPortVisibility(3, isVisible)}
            delayedCall
          >
            <Fade timeout={500} in={isVisible[2]}>
              <Grid
                item
                xs={12}
                sx={{
                  m: 4,
                  mt: 0,
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
                  }}
                >
                  <Box
                    component="img"
                    src="/cities-strong/homepage/Family-Seated-on-Bench.webp"
                    alt="Mental Health"
                    sx={{
                      minWidth: "100%",
                      height: "auto",
                      position: "absolute",
                      left: "50%",
                      transform: "translateX(-50%)",
                    }}
                  />
                </Grid>
                <ImageAccordion
                  title="Legal Immigration Assistance"
                  content="We help provide legal immigration assistance with relevant information and resources that will empower candidates to achieve their goals."
                  bgColor="#DC5331"
                  contentColor="#ffffff"
                />
              </Grid>
            </Fade>
          </VisibilitySensor>

          <Fade timeout={500} in={isVisible[3]}>
            <Grid
              item
              xs={12}
              sx={{
                m: 4,
                mt: 0,
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
                }}
              >
                <Box
                  component="img"
                  src="/cities-strong/homepage/college-kids-seated.webp"
                  alt="Mental Health"
                  sx={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                    position: "absolute",
                    bottom: "0%",
                  }}
                />
              </Grid>

              <ImageAccordion
                title="Mental Health Assistance"
                content="We help provide mental health programs, including a hotline and training for parents so they can talk with their pre-teen and teenage children."
                bgColor="#286AA4"
                contentColor="#ffffff"
                right
              />
            </Grid>
          </Fade>

          <Grid marginBottom={4} px={5} xs={12}>
            <Divider sx={{ borderWidth: 3, borderColor: "black", mt: 4 }} />
          </Grid>

          <Grid marginBottom={4} px={5}>
            <Typography
              fontWeight={700}
              sx={{ mt: 4 }}
              variant={"h3"}
              align={"center"}
            >
              Cities Served
            </Typography>
            <Grid
              xs={12}
              sm={8}
              sx={{ mx: "auto" }}
              component={Typography}
              variant={"h6"}
              align={"center"}
            >
              Cities Strong has made a difference for fourteen communities in
              cities across the Wasatch Front.
            </Grid>
          </Grid>

          <Grid container px={2} display="flex" justifyContent="center">
            <CityImage title="Ogden" src="/cities-strong/cities/ogden.jpeg" />

            <CityImage title="Provo" src="/cities-strong/cities/provo.webp" />

            <CityImage title="Orem" src="/cities-strong/cities/orem.webp" />

            <CityImage
              title="Salt Lake City"
              src="/cities-strong/cities/salt-lake.jpeg"
            />

            <CityImage
              title="West Valley City"
              src="/cities-strong/cities/orem.jpeg"
            />
          </Grid>
        </>
        {/* </ContainerStyled> */}
      </CitiesStrongLayout>
    </ProviderWrapper>
  );
};

export default Page;

const ButtonStyled = styled(Button)({
  borderRadius: "0px",
  textTransform: "capitalize",
  borderColor: "black",
  borderWidth: "2px",
  color: "black",
  fontWeight: "bold",
});

const CityImage = ({ src, title, sx }) => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <Grid
      item
      xs={6}
      md={4}
      sx={{ padding: 4, px: { xs: 1, md: 2 }, pt: { xs: 2, md: 4 }, pb: 2 }}
    >
      <Grid
        sx={{ mx: "auto" }}
        component={Typography}
        variant={isMd ? "h5" : "h6"}
        fontWeight={700}
        gutterBottom
        align={"center"}
      >
        {title}
      </Grid>

      <Grid
        item
        xs={12}
        sx={{
          backgroundColor: "grey",
          height: { md: "225px", xs: "150px" },
          overflow: "hidden",
          position: "relative",
          boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
        }}
      >
        <Box
          component="img"
          src={src}
          alt={title}
          loading="lazy"
          sx={{
            height: "100%",
            objectFit: "cover", // Ensures the image covers the entire area
            position: "absolute",
            objectPosition: "right", // Shifts the image to the left
            left: "0px",
            ...sx,
          }}
        />
      </Grid>
    </Grid>
  );
};
