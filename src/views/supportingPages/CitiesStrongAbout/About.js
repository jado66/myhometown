import React, { useState } from "react";
import Box from "@mui/material/Box";
import Container from "@/components/util/Container";
import { Headline, Team } from "./components";
import { useTheme } from "@mui/material";
import Stats from "./components/Stats";
import Values from "./components/Values";

const CitiesStrongAbout = () => {
  const [viewPortEntered, setViewPortEntered] = useState(false);
  const setViewPortVisibility = (isVisible) => {
    if (viewPortEntered) {
      return;
    }
    setViewPortEntered(isVisible);
  };

  const stats = {
    volunteerHours: 33843 + 65458,
    numTeachersVolunteers: 1125 + 608 + 12400,
    serviceProjects: 1302,
  };

  const theme = useTheme();

  return (
    <Container
      maxWidth="xl"
      sx={{
        mx: "auto",
        pb: "0 !important",
        pt: "50px !important",
      }}
    >
      {" "}
      <Container paddingTop={"0 !important"}>
        <Headline />
      </Container>
      {/* <Container paddingTop={"0 !important"}>
        <Values />
      </Container> */}
      <Container paddingTop={"0 !important"}>
        <Team />
      </Container>
      <Container paddingY={"0 !important"} paddingBottom={"0 !important"}>
        <Stats
          viewPortEntered={viewPortEntered}
          setViewPortVisibility={setViewPortVisibility}
          stats={stats}
        />
      </Container>
    </Container>
  );
};

export default CitiesStrongAbout;
