"use client";
import React from "react";
import { Card, Grid } from "@mui/material";
import BackButton from "@/components/BackButton";
import Directory from "./components/Directory";
import { useUser } from "@/hooks/use-user";

const DirectoryPage = () => {
  const { user } = useUser();

  if (!user) {
    return null;
  }

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
