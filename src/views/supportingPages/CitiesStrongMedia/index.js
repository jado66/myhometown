import React from "react";
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Grid,
  Card,
  CardContent,
  CardMedia,
  Box,
  Divider,
} from "@mui/material";
import MyHometownLogo from "@/assets/svg/logos/MyHometown";

const CitiesStrongMediaPage = () => {
  return (
    <Container
      maxWidth="xl"
      sx={{ mx: "auto", padding: "40px !important", pt: "50px !important" }}
    >
      {/* Featured Stories */}
      <Grid item xs={12} display="flex" justifyContent="center">
        <Box
          height={"100%"}
          width={"100%"}
          display={"flex"}
          justifyContent={"center"}
          alignItems={"center"}
        >
          <Box height={"100%"} width={"100%"} mx="auto" maxHeight={600}>
            <Typography
              sx={{
                textTransform: "uppercase",
                fontWeight: "medium",
                mt: 2,
              }}
              gutterBottom
            >
              Our Media
            </Typography>
            <Typography
              variant="h2"
              sx={{
                fontWeight: 700,
              }}
            >
              Who is Cities Strong?
            </Typography>
            <Box>
              <Typography variant="h6" mb={3}>
                See below to find out who we are, what we do, and how we do it.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Grid>
      {/* MHT Dashboard\public\ */}

      <Grid container>
        <Grid item xs={12}>
          <Card>
            <CardMedia
              component="iframe"
              sx={{
                boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
                height: { md: "485px", xs: "230px" },
              }}
              src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/videos/Donor+Final+100624.mp4"
              title="Video 1"
            />
          </Card>
        </Grid>
      </Grid>

      <Grid container sx={{ mt: 3, justifyContent: "center" }}>
        <Typography variant="h5">
          A word from Cities Strong Foundation CEO
        </Typography>
        <Grid item xs={12}>
          <Card>
            <CardMedia
              component="iframe"
              sx={{
                boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
                height: { md: "485px", xs: "230px" },
              }}
              src="/cities-strong/ScottSorensenInterview.mp4"
              title="Video 1"
            />
          </Card>
        </Grid>
      </Grid>

      <Divider sx={{ borderWidth: 3, borderColor: "black", mt: 4 }} />

      <Typography
        variant="h4"
        component="h5"
        gutterBottom
        sx={{ marginTop: 4, mb: 3, textAlign: "center" }}
      >
        What city leaders are saying about <br /> <MyHometownLogo type="full" />
      </Typography>
      <Grid container spacing={4}>
        <Grid
          item
          xs={12}
          display="flex"
          justifyContent="center"
          flexDirection="column"
        >
          <Typography variant="h5" textAlign="center">
            Salt Lake City - Mayor
          </Typography>
          <CardMedia
            component="iframe"
            sx={{
              boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
              height: { md: "485px", xs: "230px" },
            }}
            src="https://drive.google.com/file/d/1mVhOwAvNOtJlmCAimxGkeJE6FBh6k5JN/preview"
          />
        </Grid>
        <Grid
          item
          xs={12}
          display="flex"
          justifyContent="center"
          flexDirection="column"
        >
          <Typography variant="h5" textAlign="center">
            Provo - Mayor
          </Typography>
          <CardMedia
            component="iframe"
            sx={{
              boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
              height: { md: "485px", xs: "230px" },
            }}
            src="https://drive.google.com/file/d/18rjyp7DkBpJuuDPCxPZ5Iljphy8YBuBW/preview"
          />
        </Grid>
        <Grid
          item
          xs={12}
          display="flex"
          justifyContent="center"
          flexDirection="column"
        >
          <Typography variant="h5" textAlign="center">
            West Valley City - City Manager
          </Typography>
          <CardMedia
            component="iframe"
            sx={{
              boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
              height: { md: "485px", xs: "230px" },
            }}
            src="https://drive.google.com/file/d/1UIjnSOzEqF-tBVrvIFYH6StHoSSEWS7H/preview"
          />
        </Grid>
      </Grid>
    </Container>
  );
};

export default CitiesStrongMediaPage;
