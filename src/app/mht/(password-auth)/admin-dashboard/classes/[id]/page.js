"use client";
import { Suspense, useEffect, useState } from "react";
import AccessCodeDialog from "./access-code-dialog";
import ClassList from "./class-list";
import { Container, Typography } from "@mui/material";
import useCommunities from "@/hooks/use-communities";

export default function ClassPage({ params }) {
  const { getCommunity, loading, error } = useCommunities();
  const [community, setCommunity] = useState(null);

  useEffect(() => {
    const fetchCommunity = async () => {
      const community = await getCommunity(params.id);
      if (community) {
        // Handle the community data
        setCommunity(community);
      }
    };

    fetchCommunity();
  }, [params.id]);

  return (
    <Container maxWidth="xl">
      <Typography variant="h4" component="h1" gutterBottom>
        {community?.name} Community Classes
      </Typography>
      <Suspense fallback={<div>Loading...</div>}>
        <ClassList communityId={params.id} />
      </Suspense>
    </Container>
  );
}
