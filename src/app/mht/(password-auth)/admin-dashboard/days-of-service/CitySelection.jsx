"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

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
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import Link from "next/link";
import { Search } from "@mui/icons-material";
import CommunitySelect from "@/components/data-tables/selects/CommunitySelect";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { useUser } from "@/hooks/use-user";
import Loading from "@/components/util/Loading";
import { useCommunities } from "@/hooks/use-communities";
import BackButton from "@/components/BackButton";
import {
  authenticateCity,
  CityIdToPasswordHash,
  isAuthenticated,
} from "@/util/auth/simpleAuth";
import { ExpandMore } from "@mui/icons-material";
import { toast } from "react-toastify";

const CitySelectionPage = () => {
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [selectedCityName, setSelectedCityName] = useState("");
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [selectedCity, setSelectedCity] = useState(null);
  const [authError, setAuthError] = useState("");
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState();

  const city = searchParams.get("city");

  const [communities, setCommunities] = useState([]);
  const { user, isAdmin } = useUser();

  const router = useRouter();
  const {
    communities: allCommunities,
    fetchCommunitiesByCity,
    hasLoaded,
  } = useCommunities(null, true);

  // Group and filter communities by city
  const groupedCommunities = useMemo(() => {
    if (!communities || !Array.isArray(communities)) {
      return {};
    }

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

  // useEffect(() => {
  //   if (selectedCommunity) {
  //     router.push(`/classes/${selectedCommunity._id}`);
  //   }
  // }, [selectedCommunity]);

  useEffect(() => {
    const fetchCommunities = async () => {
      if (user && isAdmin) {
        setCommunities(allCommunities);
      } else {
        if (!city) {
          return;
        }

        const communities = await fetchCommunitiesByCity(city);

        setCommunities(communities || []);
      }
    };

    fetchCommunities();
  }, [allCommunities, user, city, authenticated]);

  const handleCityClick = (city) => {
    if (isAuthenticated(city, true)) {
      router.push(
        process.env.NEXT_PUBLIC_DOMAIN + `/admin-dashboard/classes/${city}`
      );
    } else {
      setSelectedCityName(city);

      setShowAuthDialog(true);
      setAuthError("");
    }
  };

  const handleAuthSubmit = () => {
    if (authenticateCity(selectedCityName, password)) {
      setShowAuthDialog(false);
      setPassword("");
      setAuthenticated(city);

      router.push(
        process.env.NEXT_PUBLIC_DOMAIN +
          `/admin-dashboard/days-of-service/${selectedCityName}`
      );
    } else {
      setAuthError("Incorrect password");
      setPassword("");
    }
  };

  if (!hasLoaded) {
    <Loading />;
  }

  return (
    <>
      <Box sx={{ p: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Select a Community to View Days Of Service
        </Typography>

        {/* <JsonViewer data={{ user, groupedCommunities, authenticated }} /> */}

        {/* {!isAdmin && (
          <Button
            variant="contained"
            // get rid of the url params
            onClick={() =>
              router.push(
                process.env.NEXT_PUBLIC_DOMAIN + `/admin-dashboard/classes`
              )
            }
          >
            Back
          </Button>
        )} */}

        <>
          {/* 
            City Cards with ?cityId = link

          */}
          <Typography variant="h5" sx={{ mb: 2 }}>
            Select a City
          </Typography>
          <Grid container spacing={2}>
            {Object.keys(CityIdToPasswordHash).map((city) => (
              <Grid item xs={12} sm={6} md={4} lg={3} xl={2.4} key={city}>
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
                  onClick={() => handleCityClick(city)}
                >
                  <CardContent>
                    <Typography variant="h6" align="center">
                      {city}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>

        {isAdmin && (
          <>
            <Divider sx={{ my: 4 }} />
            <Accordion>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Typography variant="h6">City Passwords</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <>
                  {/* foreach key in a object */}
                  {Object.keys(CityIdToPasswordHash).map((city) => (
                    <Typography key={city}>
                      {city}:{" "}
                      <Typography
                        component="span"
                        sx={{
                          color: "#318d43",
                          fontWeight: "bold",
                          cursor: "pointer",
                        }}
                        // copy password to clipboard
                        onClick={() => {
                          navigator.clipboard.writeText(
                            CityIdToPasswordHash[city]
                          );
                          toast.success("Password copied to clipboard");
                        }}
                      >
                        {" "}
                        {CityIdToPasswordHash[city]}
                      </Typography>
                    </Typography>
                  ))}
                </>
              </AccordionDetails>
            </Accordion>
          </>
        )}
        <Dialog open={showAuthDialog} onClose={() => setShowAuthDialog(false)}>
          <DialogTitle>Enter City Password For {selectedCityName}</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Password"
              type="password"
              fullWidth
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={!!authError}
              helperText={authError}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  handleAuthSubmit();
                }
              }}
            />
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => {
                setShowAuthDialog(false);
                setPassword("");
                setAuthError("");
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleAuthSubmit} variant="contained">
              Submit
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

const CommunityCard = ({ community, handleCommunityClick }) => (
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
    onClick={() => handleCommunityClick(community)}
  >
    <CardContent>
      <Typography variant="h6" align="center">
        {community.name}
      </Typography>
    </CardContent>
  </Card>
);

export default CitySelectionPage;
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
