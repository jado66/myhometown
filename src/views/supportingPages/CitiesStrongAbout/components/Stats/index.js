import { Box, Divider, Grid, Typography } from "@mui/material";
import CountUp from "react-countup";
import VisibilitySensor from "react-visibility-sensor";

const Stats = ({ viewPortEntered, setViewPortVisibility, stats }) => {
  return (
    <Box>
      {/* <Divider sx = {{width:"100%", mb:4}} /> */}
      <Divider
        sx={{ width: "100%", borderWidth: 3, mb: 4, borderColor: "black" }}
      />

      <Box marginBottom={4}>
        <Typography
          fontWeight={700}
          sx={{ mt: 4 }}
          variant={"h3"}
          align={"center"}
        >
          Our Accomplishments
        </Typography>
        <Box
          component={Typography}
          //   fontWeight={700}
          variant={"h4"}
          align={"center"}
        >
          2023
        </Box>
      </Box>

      <Grid
        container
        spacing={2}
        padding={3}
        display="flex"
        justifyContent="center"
        sx={{ pb: "0 !important" }}
      >
        <Grid item md={4} xs={6}>
          <Typography
            variant="h3"
            align={"center"}
            gutterBottom
            sx={{
              fontWeight: "medium",
            }}
          >
            <VisibilitySensor
              onChange={(isVisible) => setViewPortVisibility(isVisible)}
              delayedCall
            >
              <CountUp
                redraw={false}
                end={viewPortEntered ? stats.volunteerHours : 0}
                start={0}
              />
            </VisibilitySensor>
          </Typography>

          <Typography align={"center"} component="p">
            Volunteer Hours
          </Typography>
        </Grid>
        <Grid item md={4} xs={6} sx={{ mx: "auto" }}>
          <Typography
            variant="h3"
            align={"center"}
            gutterBottom
            sx={{
              fontWeight: "medium",
            }}
          >
            <VisibilitySensor
              onChange={(isVisible) => setViewPortVisibility(isVisible)}
              delayedCall
            >
              <CountUp
                redraw={false}
                end={viewPortEntered ? stats.numTeachersVolunteers : 0}
                start={0}
              />
            </VisibilitySensor>
          </Typography>

          <Typography align={"center"} component="p">
            Volunteers
          </Typography>
        </Grid>
        <Grid item md={4} xs={6} sx={{ mt: { xs: 3, md: 0 } }}>
          <Typography
            variant="h3"
            align={"center"}
            gutterBottom
            sx={{
              fontWeight: "medium",
            }}
          >
            <VisibilitySensor
              onChange={(isVisible) => setViewPortVisibility(isVisible)}
              delayedCall
            >
              <CountUp
                redraw={false}
                end={viewPortEntered ? stats.serviceProjects : 0}
                start={0}
              />
            </VisibilitySensor>
          </Typography>

          <Typography align={"center"} component="p">
            Projects Completed
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Stats;
