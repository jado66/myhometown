import { Button, Grid, Typography } from "@mui/material";
import Link from "next/link";
import { useState } from "react";
import CountUp from "react-countup";
import VisibilitySensor from "react-visibility-sensor";

export const StatsCounter = ({ stats, isEdit = false }) => {
  const [viewPortEntered, setViewPortEntered] = useState(false);
  const setViewPortVisibility = (isVisible) => {
    if (viewPortEntered) {
      return;
    }

    setViewPortEntered(isVisible);
  };

  if (!stats || JSON.stringify(stats) == JSON.stringify({})) {
    if (isEdit) {
      return (
        <>
          <Typography variant="h4">No Stats</Typography>
          <Link>Update Stats Here</Link>
        </>
      );
    } else {
      return null;
    }
  }

  return (
    <Grid container spacing={2} paddingY={3}>
      <Grid item md={4}>
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

        <Typography color="text.secondary" align={"center"} component="p">
          Volunteer Hours
        </Typography>
      </Grid>
      <Grid item md={4}>
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

        <Typography color="text.secondary" align={"center"} component="p">
          Volunteers
        </Typography>
      </Grid>
      <Grid item md={4}>
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

        <Typography color="text.secondary" align={"center"} component="p">
          Projects Completed
        </Typography>
      </Grid>
      {isEdit && (
        <Grid item xs={12} display="flex" justifyContent="center">
          <Button
            variant="outlined"
            href="/admin-dashboard/citiesb"
            sx={{ mt: 2 }}
          >
            Update Stats
          </Button>
        </Grid>
      )}
    </Grid>
  );
};
