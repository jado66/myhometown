"use client";

import React, { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Card,
  CardContent,
  Typography,
  InputAdornment,
  Grid,
  Divider,
} from "@mui/material";
import Link from "next/link";
import { Search } from "@mui/icons-material";
import useCommunities from "@/hooks/use-communities";
import CommunitySelect from "@/components/data-tables/selects/CommunitySelect";

const CommunitySelectionPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [entryCode, setEntryCode] = useState("");
  const [showCodeDialog, setShowCodeDialog] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState(null);

  const router = useRouter();
  const { communities, hasLoaded } = useCommunities(null, true);

  // Group and filter communities by city
  const groupedCommunities = useMemo(() => {
    const filtered = communities.filter(
      (community) =>
        community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        community.city.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return filtered.reduce((acc, community) => {
      const city = community.city || "Other";
      if (!acc[city]) {
        acc[city] = [];
      }
      acc[city].push(community);
      return acc;
    }, {});
  }, [communities, searchTerm]);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <>
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Select a Community to View Classes
        </Typography>
        <Box sx={{ mb: 4 }}>
          <CommunitySelect
            value={selectedCommunity}
            onChange={setSelectedCommunity}
            fullWidth
          />
        </Box>

        {hasLoaded &&
          Object.entries(groupedCommunities).map(([city, cityCommunities]) => (
            <Box key={city} sx={{ mb: 4 }}>
              <Typography
                variant="h5"
                sx={{
                  mb: 2,
                  pb: 1,
                  borderBottom: "1px solid",
                  borderColor: "divider",
                }}
              >
                {city.endsWith("City") ? city : `${city} City`}
              </Typography>
              <Grid container spacing={2}>
                {cityCommunities.map((community) => (
                  <Grid
                    item
                    xs={12}
                    sm={6}
                    md={4}
                    lg={3}
                    xl={2.4}
                    key={community._id}
                  >
                    <CommunityCard community={community} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
      </Box>
    </>
  );
};

export default CommunitySelectionPage;

const CommunityCard = ({ community }) => (
  <Link href={`./classes/${community._id}`} style={{ textDecoration: "none" }}>
    <Card
      sx={{
        cursor: "pointer",
        transition: "all 0.3s",
        "&:hover": {
          transform: "scale(1.05)",
        },
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        borderRadius: "8px",
        border: "1px solid #ccc",
      }}
    >
      <CardContent>
        <Typography variant="h6" align="center">
          {community.name} Classes
        </Typography>
      </CardContent>
    </Card>
  </Link>
);
{
  /* <Dialog open={showCodeDialog} onClose={() => setShowCodeDialog(false)}>
  <DialogTitle>Enter Access Code</DialogTitle>
  <DialogContent>
    <TextField
      autoFocus
      margin="dense"
      label="Access Code"
      type="password"
      fullWidth
      value={entryCode}
      onChange={(e) => setEntryCode(e.target.value)}
    />
  </DialogContent>
  <DialogActions>
    <Button onClick={() => setShowCodeDialog(false)}>Cancel</Button>
    <Button onClick={handleCodeSubmit} variant="contained">
      Submit
    </Button>
  </DialogActions>
</Dialog> */
}

// const handleCodeSubmit = () => {
//   if (entryCode === "1234") {
//     router.push(`/classes/${selectedCommunity._id}`);
//   } else {
//     setEntryCode("");
//     setShowCodeDialog(false);
//     router.push("/classes");
//   }
// };
