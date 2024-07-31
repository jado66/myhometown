import React from "react";
import { useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import { Grid } from "@mui/material";

const Headline = () => {
  const theme = useTheme();

  return (
    <Box paddingBottom={0}>
      <Box position="relative" zIndex={2}>
        <Typography
          sx={{
            textTransform: "uppercase",
            fontWeight: "medium",
            mt: 2,
          }}
          gutterBottom
          // color={'textSecondary'}
        >
          About us
        </Typography>
        <Box marginBottom={2}>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
            }}
          >
            Building communities{" "}
            <Typography
              color={"primary"}
              component={"span"}
              variant={"inherit"}
            >
              together.
            </Typography>
          </Typography>
        </Box>
        <Box marginBottom={4}>
          <Typography variant="h6" sx={{ maxWidth: "700px" }}>
            Cities Strong Foundation is directed by a dedicated group of
            business, church, and education leaders who are passionate about
            making our communities special places to live.
          </Typography>
        </Box>
        <Grid container>
          <Grid item xs={12} display="flex" justifyContent="center">
            <Box
              component="video"
              sx={{
                // boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
                height: { md: "463px", xs: "220px" },
                maxWidth: "84vw",
                mx: "auto",
              }}
              src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/videos/Donor+Final+5+narr.webm"
              title="Video 1"
              controls
              playsInline
            />
          </Grid>
        </Grid>
        {/* <Box display="flex" justifyContent={'center'}>
          <Box
            component={Button}
            variant="contained"
            color="primary"
            size="large"
          >
            Learn more
          </Box>
        </Box> */}
      </Box>
    </Box>
  );
};

export default Headline;
