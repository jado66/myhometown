"use client";
import React, { Suspense } from "react";
import { Card, Grid } from "@mui/material";
import BackButton from "@/components/BackButton";
import dynamic from "next/dynamic";
import { useUser } from "@/hooks/use-user";

// Dynamically import the Directory component
const Directory = dynamic(
  () => import("@/components/texting/directory/Directory"),
  {
    loading: () => <p>Loading directory...</p>,
    ssr: false, // Set to false if the component uses browser-only APIs
  }
);

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
