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
import useMediaQuery from "@mui/material/useMediaQuery";

import { styled } from "@mui/system";
import ProviderWrapper from "@/contexts/ProviderWrapper";
import { CitiesStrongLayout } from "@/layout";
import { ImageAccordion } from "@/components/ImageAccordion";
import { default as VisibilitySensor } from "react-visibility-sensor";
import { ResponsiveVideoBanner } from "@/components/util/ResponsiveVideoBanner";
import LoadingImage from "@/components/util/LoadingImage";

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
          <ResponsiveVideoBanner src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/videos/Banner CSF music 3440X1000 1.webm" />

          <Grid item xs={12}>
            <Typography
              variant="h3"
              sx={{ mt: 6, mb: 2, fontWeight: "bold" }}
              align="center"
            >
              Cities Strong Foundation
            </Typography>
          </Grid>
          <Grid
            item
            xs={12}
            sm={6}
            sx={{ padding: 4, display: "flex", flexDirection: "column" }}
          >
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              Cities Strong Foundation is a public charity that supports
              community-driven efforts to improve the lives of individuals and
              families. These initiatives strengthen families, enhance community
              engagement, and ultimately contribute to stronger, more resilient
              cities.
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} sx={{ padding: 4, pt: { xs: 0, sm: 4 } }}>
            <LoadingImage
              src="/cities-strong/homepage/mother-daughter.webp"
              alt="A Mother and Daughter"
            />
          </Grid>

          <Grid
            item
            xs={12}
            sx={{
              padding: 4,
              pt: 0,
              display: "flex",
              flexDirection: "column",
              height: { sm: "220px" },
            }}
          >
            <Typography variant="h4" sx={{ flexGrow: 1 }}>
              Cities Strong Foundation is a public charity that supports
              community-driven efforts to improve the lives of individuals and
              families. These initiatives strengthen families, enhance community
              engagement, and ultimately contribute to stronger, more resilient
              cities.
            </Typography>
            {/* <ButtonStyled variant='outlined'  sx = {{mr:'auto', mt:3}}
                href = '/about'
              >
                Learn More
              </ButtonStyled> */}
          </Grid>

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
                  content={`We support myHometown's efforts to foster neighbor-helping-neighbor programs. This includes the Days of Service program, which provides a variety of neighborhood improvement projects, and Community Resource Centers that provide spaces and facilitators for learning, gathering, and socializing.`}
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
                  content="We support myHometown and their work with schools to improve literacy and learning skills by providing dedicated tutors.  We also support the acclaimed Leader In Me® program, which empowers students by fostering a culture of learning and leadership throughout the school."
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
                  content="Partnering with the Good Samaritan Foundation, we provide legal immigration assistance, emergency housing, and case management support to help immigrant families successfully navigate the immigration process and become productive members of the community."
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
                content="We provide mental health support through programs like EveryDay Strong for parents and School Pulse for students. EveryDay Strong empowers parents to guide their children, while School Pulse delivers inspiring messages directly to students via email and text."
                bgColor="#286AA4"
                contentColor="#ffffff"
                right
              />
            </Grid>
          </Fade>

          <Box
            sx={{
              py: 4,
              position: "relative",
              boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
            }}
          ></Box>
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
      xs={12}
      sm={6}
      md={4}
      sx={{
        padding: 2,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typography
        variant={isMd ? "h5" : "h6"}
        fontWeight={700}
        gutterBottom
        align="center"
      >
        {title}
      </Typography>
      <Box
        sx={{
          width: "100%",
          paddingTop: "75%", // 4:3 aspect ratio
          position: "relative",
          overflow: "hidden",
          boxShadow: "0px 4px 8px rgba(0, 0, 0, 0.15)",
        }}
      >
        <LoadingImage
          src={src}
          alt={title}
          boxSx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%", // This will now work because it's absolutely positioned
          }}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            ...sx,
          }}
        />
      </Box>
    </Grid>
  );
};
