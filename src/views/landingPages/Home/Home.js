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
import { MyHometownHouse } from "@/assets/svg/logos/MyHometownHouse";
import CommunityResourceContent from "../MHT/CommunityResourceCenter";
import DaysOfServiceContent from "../MHT/DaysOfService";
import LoadingImage from "@/components/util/LoadingImage";

const Home = () => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));

  return (
    <>
      <ResponsiveVideoBanner
        src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/uploads/834c2c3b-38ae-4e87-9a1d-8b4f9ced2d1c-Banner+2+MHT+3440X1000+w+text.m4v"
        noMusic
        noTop
      />
      <Box sx={{ width: "100%" }}>
        <Typography
          variant="h3"
          textAlign={"center"}
          color="black"
          sx={{
            mt: 3,
            mb: { md: 1, xs: 3 },
            mx: "auto",
            fontWeight: 700,
          }}
        >
          Feel the love in
          <Typography color={"primary"} component={"span"} variant={"inherit"}>
            {" "}
            myHometown
          </Typography>
        </Typography>
      </Box>
      {/* <Grid
        item
        xs={12}
        display="flex"
        justifyContent="space-evenly"
        sx={{ px: { md: 1, xs: 3 } }}
      >
        <Typography
          sx={{ color: "black", fontWeight: "bold" }}
          textAlign="center"
        >
          Lives Lifted
        </Typography>
        <Typography
          sx={{ color: "black", fontWeight: "bold" }}
          textAlign="center"
        >
          Landscapes Renewed
        </Typography>
        <Typography
          sx={{ color: "black", fontWeight: "bold" }}
          textAlign="center"
        >
          Homes Repaired
        </Typography>
        <Typography
          sx={{ color: "black", fontWeight: "bold" }}
          textAlign="center"
        >
          Education Enhanced
        </Typography>
      </Grid> */}
      {isMd ? (
        <>
          <Grid
            item
            xs={12}
            sm={6}
            sx={{ padding: 4, display: "flex", flexDirection: "column" }}
          >
            <Typography
              variant="body1"
              sx={{ color: "black", fontSize: "larger" }}
            >
              At myHometown, we revitalize aging neighborhoods by refurbishing
              homes and buildings, renewing landscapes, and adding new
              educational opportunities through Community Resource Centers.
            </Typography>
            <Divider sx={{ my: 3 }} />
            <Typography
              variant="body1"
              sx={{ color: "black", fontSize: "larger" }}
            >
              We lift the lives of residents and attract individuals and
              families who want to move in, stay and contribute to the long-term
              viability of the community.
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
              <LoadingImage
                src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/MHT+landing+page+photos/Photos+1/IMG_0246.jpeg"
                alt="Mental Health"
                sx={{
                  borderRadius: 3,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  objectPosition: "center",
                  top: "0",
                  left: "0px",
                }}
              />
            </Grid>
          </Grid>
        </>
      ) : (
        <>
          <Grid
            item
            xs={12}
            sm={6}
            sx={{ padding: 4, display: "flex", flexDirection: "column" }}
          >
            <Typography
              variant="body1"
              sx={{ color: "black", fontSize: "larger" }}
            >
              At myHometown, we revitalize aging neighborhoods by refurbishing
              homes and buildings, renewing landscapes, and adding new
              educational opportunities through Community Resource Centers.
            </Typography>
          </Grid>

          <Grid item xs={12} sm={6} sx={{ padding: 4, py: { xs: 0, sm: 4 } }}>
            <Grid
              item
              xs={12}
              sx={{
                height: "350px",
                overflow: "hidden",
                position: "relative",
                boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
                borderRadius: 3,
              }}
            >
              <LoadingImage
                src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/MHT+landing+page+photos/Photos+1/IMG_0246.jpeg"
                alt="Mental Health"
                sx={{
                  borderRadius: 3,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  position: "absolute",
                  objectPosition: "center",
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
            sx={{ padding: 4, display: "flex", flexDirection: "column" }}
          >
            <Typography
              variant="body1"
              sx={{ color: "black", fontSize: "larger" }}
            >
              We lift the lives of residents and attract individuals and
              families who want to move in, stay and contribute to the long-term
              viability of the community.
            </Typography>
          </Grid>
        </>
      )}
      <Grid
        item
        xs={12}
        sx={{
          m: 4,
          mt: 0,
          borderRadius: 3,
          height: { sm: "375px", xs: "300px" },

          position: "relative",
          boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
        }}
      >
        <Grid
          item
          xs={12}
          sx={{
            height: { sm: "375px", xs: "300px" },

            overflow: "hidden",
            position: "relative",
            borderRadius: 3,
          }}
        >
          <LoadingImage
            src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/MHT+landing+page+photos/private-foundation-vs-public-charity.webp"
            alt="Mental Health"
            height="100%"
            sx={{
              borderRadius: 3,
              width: "100%",
              height: "100%",
              objectFit: "cover",
              position: "absolute",
            }}
          />
        </Grid>
        <ImageAccordion
          title="A Cooperative Partnership"
          content={`We thrive through a cooperative partnership with faith groups, local
governments, non-profit organizations, educational institutions and
community-minded businesses.`}
          bgColor="#a16faf" //febc18 y - e45620 o - lb 1bc7bc - db 00357d - lp a16faf - lp 592569 - nc efefe7 - cg 63666a
          contentColor="#ffffff"
          cornerIcon={<MyHometownHouse />}
          rounded
        />
      </Grid>
      <Grid
        item
        xs={12}
        sx={{
          m: 4,
          borderRadius: 3,

          mt: 0,
          position: "relative",
          boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
        }}
      >
        <Grid
          item
          xs={12}
          sx={{
            height: { sm: "375px", xs: "300px" },
            overflow: "hidden",
            position: "relative",
            borderRadius: 3,
          }}
        >
          <LoadingImage
            src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/MHT+landing+page+photos/Photos+1/iStock-1164938630.jpg"
            alt="Mental Health"
            height="100%"
            sx={{
              borderRadius: 3,
              width: "100%",
              height: {
                xs: "100%",
                lg: "140%", // Increase height on large screens to prevent cropping
              },
              objectFit: "cover",
              position: "absolute",
              bottom: {
                xs: "0%",
                lg: "-40%",
              },
              top: {
                xs: "0%",
                lg: "auto", // Remove top constraint on large screens
              },
            }}
          />
          {/* <Box
            component="img"
            src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/MHT+landing+page+photos/Photos+1/iStock-1164938630.jpg"
            // src="mht\city-page\happy volunteers.jpeg"
            alt="Kids Learning"
            sx={{
              borderRadius: 3,
              width: "100%",
              height: {
                xs: "100%",
                lg: "140%", // Increase height on large screens to prevent cropping
              },
              objectFit: "cover",
              position: "absolute",
              bottom: {
                xs: "0%",
                lg: "-40%",
              },
              top: {
                xs: "0%",
                lg: "auto", // Remove top constraint on large screens
              },
            }}
          /> */}
        </Grid>

        <ImageAccordion
          title="How We Make a Difference"
          content="We help people come together in a way that results in neighbors
helping neighbors. They quickly discover the benefits of working
together and what it means to build a sense of community."
          bgColor="#318D43"
          contentColor="#ffffff"
          cornerIcon={<MyHometownHouse />}
          rounded
          right
        />
      </Grid>
    </>
  );
};

{
  /* <Box sx={{ px: 5 }}>
<Box position={"relative"}>
  <Grid
    container
    sx={{
      mx: "auto",
    }}
  >
    <Grid item xs={12} sx={{ pX: 0, mb: 4 }}>
      <Divider sx={{ borderWidth: 1, borderColor: "#707070", mt: 5 }} />
    </Grid>

    <Grid
      item
      xs={12}
      md={12}
      sx={{
        pt: 0,
        display: "flex",
        flexDirection: "column",
        mb: 2,
      }}
    >
      <Typography variant="h5" sx={{ flexGrow: 1 }}>
        In myHometown we partner with city governments, residents, local
        churches, non-profit organizations, and corporations.
      </Typography>
    </Grid>

    <Grid item xs={12} sx={{ mb: 4, mt: 0, position: "relative" }}>
      <Grid
        item
        xs={12}
        sx={{
          backgroundColor: "grey",
          height: "375px",
          borderRadius: 3,
          boxShadow: " rgba(0, 0, 0, 0.35) 0px 5px 15px",
        }}
      />
      <ImageAccordion
        title="A Cooperative Partnership"
        content="My Hometown is a cooperative partnership of faith groups, local governments, non-profit organizations, educational institutions, community-minded businesses, and others."
        bgColor="#a16faf" //febc18 y - e45620 o - lb 1bc7bc - db 00357d - lp a16faf - lp 592569 - nc efefe7 - cg 63666a
        contentColor="#ffffff"
        cornerIcon={<MyHometownHouse />}
        rounded
      />
    </Grid>
    <Grid item xs={12} sx={{ mb: 4, mt: 0, position: "relative" }}>
      <Grid
        item
        xs={12}
        sx={{
          backgroundColor: "grey",
          height: "375px",
          borderRadius: 3,
          boxShadow: " rgba(0, 0, 0, 0.35) 0px 5px 15px",
        }}
      />
      <ImageAccordion
        title="How We Make a Difference"
        content="We help people come together in a way that results in neighbors helping neighbors.  They quickly discover the benefits of working together and what it means to build a sense of community."
        bgColor="#e45620" //febc18 y - e45620 o - lb 1bc7bc - db 00357d - lp a16faf - lp 592569 - nc efefe7 - cg 63666a
        contentColor="#ffffff"
        cornerIcon={<MyHometownHouse />}
        right
        rounded
      />
    </Grid>
    <Grid item xs={12} sx={{ mb: 4, mt: 0, position: "relative" }}>
      <Grid
        item
        xs={12}
        sx={{
          backgroundColor: "grey",
          height: "375px",
          borderRadius: 3,
          boxShadow: " rgba(0, 0, 0, 0.35) 0px 5px 15px",
        }}
      />
      <ImageAccordion
        title="Revitalizing Neighborhoods"
        content="Description or content about Neighborhood Revitalization goes here."
        bgColor="#00357d"
        contentColor="#ffffff"
        cornerIcon={<MyHometownHouse />}
        rounded
      />
    </Grid>
  </Grid>

  {/* <Grid xs={12} display="flex" justifyContent="center">
    <ButtonStyled variant="outlined">
      Become a myHometown Community
    </ButtonStyled>
  </Grid> */
}
// </Box>
// </Box> */}

export default Home;

const ButtonStyled = styled(Button)({
  borderRadius: "0px",
  textTransform: "uppercase",
  borderColor: "#318D43",
  borderWidth: "2px",
  borderRight: "none",
  // backgroundColor: 'white',
  color: "black",
  fontWeight: "bold",
  position: "relative",
  paddingRight: "20px",
  height: "40px",
  textTransform: "uppercase",
  mx: "auto",
  mb: 4,
  "&:hover": {
    borderRightWidth: "0px !important",
    backgroundColor: "white",
    borderWidth: "2px",
    color: "#5c5c5c",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    top: "-2px",
    bottom: "-2px",
    right: "-17px",
    width: "17px",
    backgroundColor: "#318D43",
    clipPath: `polygon(
      0 0,
      calc(100% - 2px) 50%,
      0 100%,
      0 calc(100% - 2px),
      calc(100% - 4px) 50%,
      0 2px
    )`,
    pointerEvents: "none",
  },
});
