import React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Container from "@/components/util/Container";
import { ImageAccordion } from "@/components/ImageAccordion";
import { Divider, Grid, Typography, Button } from "@mui/material";
import { styled } from "@mui/system";
import { MyHometownHouse } from "@/assets/svg/logos/MyHometownHouse";

const Home = () => {
  const theme = useTheme();
  return (
    <>
      <Grid
        item
        xs={12}
        style={{
          mx: -4,
          backgroundColor: "grey",
          height: "250px",
        }}
      ></Grid>
      <Box sx={{ px: 5 }}>
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
                title="Community Leadership"
                content="The myHometown initiative helps build community leadership and resilience."
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
                title="Camaraderie & Friendship"
                content="Description goes here."
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
          </Grid> */}
        </Box>
      </Box>
    </>
  );
};

export default Home;

const ButtonStyled = styled(Button)({
  borderRadius: "0px",
  textTransform: "uppercase",
  borderColor: "#188D4E",
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
    backgroundColor: "#188D4E",
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
