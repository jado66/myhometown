"use client";

import { useState, useMemo, useEffect } from "react";
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
  IconButton,
} from "@mui/material";

import { useUser } from "@/hooks/use-user";
import Loading from "@/components/util/Loading";
import {
  authenticateCommunity,
  CityIdToPasswordHash,
  CommunityIdToPasswordHash,
  isAuthenticated,
} from "@/util/auth/simpleAuth";
import { ExpandMore, Visibility, VisibilityOff } from "@mui/icons-material";
import { toast } from "react-toastify";
import { useCommunitiesSupabase } from "@/hooks/use-communities-supabase";
import JsonViewer from "../util/debug/DebugOutput";
import PermissionGuard from "@/guards/permission-guard";

const CommunitySelectionPage = ({ type = "classes" }) => {
  const searchParams = useSearchParams();

  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCommunity, setSelectedCommunity] = useState(null);
  const [selectedCommunityName, setSelectedCommunityName] = useState("");
  const [showAuthDialog, setShowAuthDialog] = useState(false);
  const [authError, setAuthError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [authenticated, setAuthenticated] = useState();

  const city = searchParams.get("city");

  const { user, isAdmin } = useUser();

  const route = type === "classes" ? "classes" : "days-of-service";

  const router = useRouter();
  const {
    communities: allCommunities,
    fetchCommunitiesByCity,
    hasLoaded,
  } = useCommunitiesSupabase(null, true); // returns ALL communities because forDropDownCommunityMenu = true

  // If non-admin and a city is chosen, we'll narrow client-side (or could refetch by city)
  const displayCommunities = useMemo(() => {
    if (!allCommunities || allCommunities.length === 0) return [];
    if (!city || isAdmin) return allCommunities;
    const normalized = city.replace(/-/g, " ").toLowerCase();
    return allCommunities.filter(
      (c) => (c.city || c.city_name || "").toLowerCase() === normalized,
    );
  }, [allCommunities, city, isAdmin]);

  // Group and filter communities by city
  const groupedCommunities = useMemo(() => {
    if (!displayCommunities || !Array.isArray(displayCommunities)) return {};
    const term = searchTerm.toLowerCase();
    const filtered = displayCommunities.filter((community) => {
      const name = community.name?.toLowerCase() || "";
      const cityVal = (
        community.city ||
        community.city_name ||
        ""
      ).toLowerCase();
      return name.includes(term) || cityVal.includes(term);
    });
    return filtered.reduce((acc, community) => {
      const cityKey = community.city || community.city_name || "Other";
      if (!acc[cityKey]) acc[cityKey] = [];
      acc[cityKey].push(community);
      return acc;
    }, {});
  }, [displayCommunities, searchTerm]);
  // Trigger auth-based refresh if needed (keep dependency for future logic)
  useEffect(() => {}, [authenticated]);

  const handleCityClick = (city) => {
    router.push(
      process.env.NEXT_PUBLIC_DOMAIN +
        `/admin-dashboard/${route}?city=${city
          .toLowerCase()
          .replaceAll(" ", "-")}`,
      undefined,
      { shallow: true },
    );
  };

  const handleCommunityClick = (community) => {
    const isDaysOfService = type === "days-of-service";

    const legacyId = community._id || community.id;

    // Check if user has permission and is assigned to this community
    const hasPermission = isDaysOfService
      ? user?.permissions?.dos_admin
      : user?.permissions?.classes_admin;

    const isAssignedToCommunity = user?.communities?.includes(legacyId);

    const canSkipAuth = hasPermission && isAssignedToCommunity;

    if (isAuthenticated(legacyId, false, isDaysOfService) || canSkipAuth) {
      router.push(
        process.env.NEXT_PUBLIC_DOMAIN +
          `/admin-dashboard/${route}/${legacyId}`,
      );
    } else {
      setSelectedCommunity(community);
      setSelectedCommunityName(community.name);

      setShowAuthDialog(true);
      setAuthError("");
    }
  };

  const handleAuthSubmit = () => {
    const isDaysOfService = type === "days-of-service";

    const legacyId = selectedCommunity._id || selectedCommunity.id;
    if (authenticateCommunity(legacyId, password, isDaysOfService)) {
      setShowAuthDialog(false);
      setPassword("");
      setAuthenticated(city);

      router.push(
        process.env.NEXT_PUBLIC_DOMAIN +
          `/admin-dashboard/${route}/${legacyId}`,
      );
    } else {
      setAuthError("Incorrect password");
      setPassword("");
    }
  };

  const goToGlobalReports = () => {
    const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";
    router.push(rootUrl + "/admin-dashboard/classes/global-reports");
  };

  if (!hasLoaded) return <Loading />;

  return (
    <>
      <Box sx={{ p: 4 }}>
        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{ textTransform: "capitalize" }}
        >
          Select a Community to Manage{" "}
          {type === "classes" ? "Classes" : "Days of Service"}
        </Typography>

        <JsonViewer data={{ user, groupedCommunities, authenticated }} />

        {(groupedCommunities && Object.keys(groupedCommunities).length) > 0 ? (
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
                    key={community._id || community.id}
                  >
                    <CommunityCard
                      community={community}
                      handleCommunityClick={handleCommunityClick}
                      type={type}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))
        ) : (
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
        )}

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
                  {Object.keys(CommunityIdToPasswordHash).map((community) => {
                    const password =
                      type === "days-of-service"
                        ? "d-" + CommunityIdToPasswordHash[community].password
                        : CommunityIdToPasswordHash[community].password;

                    return (
                      <Typography key={city}>
                        {CommunityIdToPasswordHash[community].name}:{" "}
                        <Typography
                          component="span"
                          sx={{
                            color: "#318d43",
                            fontWeight: "bold",
                            cursor: "pointer",
                          }}
                          // copy password to clipboard
                          onClick={() => {
                            navigator.clipboard.writeText(password);
                            toast.success("Password copied to clipboard");
                          }}
                        >
                          {" "}
                          {password}
                        </Typography>
                      </Typography>
                    );
                  })}
                </>
              </AccordionDetails>
            </Accordion>
          </>
        )}
        <Dialog open={showAuthDialog} onClose={() => setShowAuthDialog(false)}>
          <DialogTitle>
            Enter Community Password For {selectedCommunityName}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Password"
              type={showPassword ? "text" : "password"}
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
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPassword((prev) => !prev)}
                      edge="end"
                    >
                      {
                        // Show/hide password icon
                        showPassword ? <VisibilityOff /> : <Visibility />
                      }
                    </IconButton>
                  </InputAdornment>
                ),
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

const CommunityCard = ({ community, handleCommunityClick, type }) => (
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
      <Typography
        variant="h6"
        align="center"
        sx={{ textTransform: "capitalize" }}
      >
        {community.name} {type === "classes" && "Classes"}
      </Typography>
    </CardContent>
  </Card>
);

export default CommunitySelectionPage;
