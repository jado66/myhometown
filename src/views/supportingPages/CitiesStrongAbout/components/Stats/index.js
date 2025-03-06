import { Box, Divider, Grid, Typography } from "@mui/material";
import CountUp from "react-countup";
import VisibilitySensor from "react-visibility-sensor";

const stats = {
  volunteerHours: 201733,
  volunteers: 19035,
  students: 6785,
  projects: 671,
  immigrationCases: 439,
  familiesHelped: 110,
};

const Stats = ({ viewPortEntered, setViewPortVisibility }) => {
  return (
    <Box>
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
        <Box component={Typography} variant={"h4"} align={"center"}>
          2024
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
            Service Hours
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
                end={viewPortEntered ? stats.volunteers : 0}
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
                end={viewPortEntered ? stats.projects : 0}
                start={0}
              />
            </VisibilitySensor>
          </Typography>

          <Typography align={"center"} component="p">
            Neighborhood Revitalization Projects
          </Typography>
        </Grid>

        {/* New stats added below */}
        <Grid item md={4} xs={6} sx={{ mt: 3 }}>
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
                end={viewPortEntered ? stats.students : 0}
                start={0}
              />
            </VisibilitySensor>
          </Typography>

          <Typography align={"center"} component="p">
            Participating Students
          </Typography>
        </Grid>
        <Grid item md={4} xs={6} sx={{ mt: 3 }}>
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
                end={viewPortEntered ? stats.immigrationCases : 0}
                start={0}
              />
            </VisibilitySensor>
          </Typography>

          <Typography align={"center"} component="p">
            Immigration Cases Filed
          </Typography>
        </Grid>
        <Grid item md={4} xs={6} sx={{ mt: 3 }}>
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
                end={viewPortEntered ? stats.familiesHelped : 0}
                start={0}
              />
            </VisibilitySensor>
          </Typography>

          <Typography align={"center"} component="p">
            Families Helped with Emergency Housing
          </Typography>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Stats;
