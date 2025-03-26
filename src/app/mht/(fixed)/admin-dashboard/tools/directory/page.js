"use client";
import React from "react";
import { Card, Grid } from "@mui/material";
import BackButton from "@/components/BackButton";
import Directory from "./components/Directory";
import { useUser } from "@/hooks/use-user";
import JsonViewer from "@/components/util/debug/DebugOutput";

const DirectoryPage = () => {
  const { user } = useUser();
  // const { data: userCommunities } = useUserCommunities(user?.id);
  // const { data: userCities } = useUserCities(user?.id);

  return (
    <Grid container item sm={12} display="flex">
      <BackButton top="0px" text="Back to Admin Dashboard" />
      <Card
        sx={{
          width: "100%",
          m: 3,
          p: 3,
          display: "flex",
          flexDirection: "column",
          boxShadow: "none",
          overflowX: "auto",
        }}
      >
        <JsonViewer data={{ user }} />
        <Directory
          userId={user?.id}
          userCommunities={user?.communities_details}
          userCities={user?.cities_details}
        />
      </Card>
    </Grid>
  );
};

export default DirectoryPage;
