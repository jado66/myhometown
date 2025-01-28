"use client";
import { Suspense, useEffect, useState } from "react";
import ClassList from "./ClassList";
import { Container, Typography } from "@mui/material";
import useCommunities from "@/hooks/use-communities";
import { Box, TextField, InputAdornment } from "@mui/material";
import { Search } from "@mui/icons-material";
import { useLocalStorage } from "@/hooks/use-local-storage";

export default function ClassPage({ params }) {
  const { getCommunity, loading, error } = useCommunities();
  const [community, setCommunity] = useState(null);
  const [searchTerm, setSearchTerm] = useLocalStorage("classSearch", "");

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

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Container maxWidth="xl">
      <Typography
        variant="h4"
        component="h1"
        gutterBottom
        sx={{ my: 3, pt: 4 }}
      >
        {community?.name} Community Classes
      </Typography>
      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          placeholder="Search classes..."
          value={searchTerm}
          onChange={handleSearch}
          sx={{
            // colored background if there is a value in the search field
            backgroundColor: searchTerm ? "#d4e7fa" : "white",
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <Search />
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Suspense fallback={<div>Loading...</div>}>
        <ClassList communityId={params.id} searchTerm={searchTerm} />
      </Suspense>
    </Container>
  );
}
