"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Grid,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Divider,
} from "@mui/material";
import { useCommunities } from "@/hooks/use-communities";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { FormResponseTable } from "@/components/FormResponseTable";
// FormResponsesDialog.jsx

import { Close } from "@mui/icons-material";

const CityIdToPasswordHash = {
  provo: "Provo6940!",
  orem: "Orem1723!",
  ogden: "Ogden8324!",
  "salt-lake-city": "SLC4676!",
  "west-valley-city": "WVC6961!",
};

const CommunitySelectionPage = ({ params }) => {
  const router = useRouter();
  const [showResponsesDialog, setShowResponsesDialog] = useState(false);

  const cityName = params.city;

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [communities, setCommunities] = useState([]);
  const { fetchCommunitiesByCity } = useCommunities();
  // Get city from URL path instead of search params

  // Group and filter communities by city
  const filteredCommunities = useMemo(() => {
    if (!communities || !Array.isArray(communities)) {
      return [];
    }

    // First filter by city if we have a city parameter
    let filtered = communities;

    // Then filter by search term if one exists
    if (searchTerm) {
      filtered = filtered.filter(
        (community) =>
          community.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          community.city.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  }, [communities, cityName, searchTerm]);

  useEffect(() => {
    if (!cityName) {
      return;
    }

    const fetchCommunities = async () => {
      try {
        const data = await fetchCommunitiesByCity(cityName);
        setCommunities(data);
      } catch (error) {
        console.error("Error fetching communities:", error);
        setCommunities([]);
      }
    };

    fetchCommunities();
  }, [cityName]);

  const handleCommunityClick = (community) => {
    setSelectedCommunity(community);
    setShowResponsesDialog(true);
  };

  const communityVolunteerFormLink = (community) => {
    return (
      process.env.NEXT_PUBLIC_DOMAIN +
      `/edit/utah/${cityName}/${community.name
        .toLowerCase()
        .replaceAll(/\s/g, "-")}/days-of-service`
    );
  };

  return (
    <Box sx={{ p: 4 }}>
      <Typography
        variant="h4"
        gutterBottom
        sx={{ textTransform: "capitalize" }}
      >
        {cityName ? `${cityName} Communities` : "All Communities"}
      </Typography>

      <JsonViewer data={filteredCommunities} />

      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search communities..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        sx={{ mb: 4 }}
      />

      <Divider sx={{ mb: 4, width: "100%" }} />

      <Typography variant="h6" gutterBottom>
        Days Of Service Volunteer Forms
      </Typography>

      <Grid container spacing={3}>
        {filteredCommunities.map((community) => {
          if (community.volunteerSignUpId) {
            return (
              <Grid item xs={12} md={4} key={community._id}>
                <Card
                  onClick={() => handleCommunityClick(community)}
                  sx={{
                    cursor: "pointer",
                    "&:hover": {
                      boxShadow: 6,
                    },
                  }}
                >
                  <CardContent>
                    <Typography variant="h6">
                      {community.name} Community
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Click to view volunteer responses
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            );
          } else {
            return (
              <Grid item xs={12} md={4} key={community._id}>
                <Card>
                  <CardContent>
                    <Typography variant="h6">
                      {community.name} Community
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      No volunteer form found
                    </Typography>
                    <Button
                      href={communityVolunteerFormLink(community)}
                      variant="contained"
                      color="primary"
                      sx={{ mt: 2 }}
                    >
                      Create Volunteer Form
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            );
          }
        })}
      </Grid>
      <FormResponsesDialog
        open={showResponsesDialog}
        onClose={() => setShowResponsesDialog(false)}
        formId={selectedCommunity?.volunteerSignUpId}
        communityName={selectedCommunity?.name}
      />
    </Box>
  );
};

export default CommunitySelectionPage;
const FormResponsesDialog = ({ open, onClose, formId, communityName }) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {communityName} - Volunteer Responses
          </Typography>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent>
        <FormResponseTable formId={formId} />
      </DialogContent>
    </Dialog>
  );
};
