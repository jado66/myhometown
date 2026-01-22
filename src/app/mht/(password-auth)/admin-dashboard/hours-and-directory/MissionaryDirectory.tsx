"use client";
import React, { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Container,
  AppBar,
  Toolbar,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Grid,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  useMediaQuery,
  useTheme,
  Button,
} from "@mui/material";
import {
  Search,
  Person,
  Phone,
  Email,
  ContentCopy,
  People,
  Logout,
  Download,
} from "@mui/icons-material";
import { useCommunitiesSupabase } from "@/hooks/use-communities-supabase";
import { useCitiesSupabase } from "@/hooks/use-cities-supabase";
import Loading from "@/components/util/Loading";
import { toast } from "react-toastify";
import { supabase } from "@/util/supabase";

interface Missionary {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  contact_number?: string;
  assignment_status: string;
  assignment_level?: string;
  city_id?: string;
  community_id?: string;
  title?: string;
  position_detail?: string;
  person_type?: string;
  profile_picture_url?: string;
}

interface City {
  id: string;
  name: string;
  state: string;
}

interface Community {
  id: string;
  name: string;
  city_id: string;
}

interface MissionaryDirectoryProps {
  email?: string;
}

export default function MissionaryDirectory({
  email,
}: MissionaryDirectoryProps) {
  const router = useRouter();
  const { cities } = useCitiesSupabase(null);
  const { communities } = useCommunitiesSupabase(null);
  const [missionaries, setMissionaries] = useState<Missionary[] | null>(null);
  const [allCommunities, setAllCommunities] = useState<Community[]>([]);
  const [allCities, setAllCities] = useState<City[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedCommunity, setSelectedCommunity] = useState<string>("all");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);

  // Logged in missionary from email param
  const [loggedInMissionary, setLoggedInMissionary] =
    useState<Missionary | null>(null);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const cityList = (allCities.length > 0 ? allCities : cities || []) as City[];
  const communityList = (allCommunities || []) as Community[];

  // Fetch communities and cities from Supabase
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [communitiesResult, citiesResult] = await Promise.all([
          supabase.from("communities").select("*"),
          supabase.from("cities").select("*"),
        ]);

        if (communitiesResult.error) {
          console.error("Error fetching communities:", communitiesResult.error);
        } else {
          setAllCommunities(communitiesResult.data || []);
        }

        if (citiesResult.error) {
          console.error("Error fetching cities:", citiesResult.error);
        } else {
          setAllCities(citiesResult.data || []);
        }
      } catch (err) {
        console.error("Failed to fetch data:", err);
      }
    };

    fetchData();
  }, []);

  // Fetch logged in missionary info when email is provided
  useEffect(() => {
    if (email) {
      fetchLoggedInMissionary();
    }
  }, [email]);

  // Cleanup: clear session when component unmounts
  useEffect(() => {
    return () => {
      setLoggedInMissionary(null);
      setMissionaries(null);
    };
  }, []);

  // Fetch missionaries for email-logged-in user
  useEffect(() => {
    if (loggedInMissionary) {
      fetchMissionariesForEmailUser();
    }
  }, [loggedInMissionary]);

  const fetchLoggedInMissionary = async () => {
    try {
      const response = await fetch("/api/missionary/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email?.toLowerCase() }),
        cache: "no-store",
      });

      const result = await response.json();

      if (result.success && result.missionary) {
        setLoggedInMissionary(result.missionary);
      } else {
        // If login fails, redirect back to login page
        const rootUrl =
          process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";
        router.push(rootUrl + "/admin-dashboard/directory");
      }
    } catch (error) {
      console.error("Failed to verify missionary:", error);
      const rootUrl =
        process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";
      router.push(rootUrl + "/admin-dashboard/directory");
    }
  };

  const fetchMissionariesForEmailUser = async () => {
    try {
      // For email-logged-in users, fetch based on their assignment level
      let fetchParams: any = { user: null, excludeEmail: true };

      if (loggedInMissionary?.assignment_level === "state") {
        // State missionaries see all missionaries (no filtering by community/city)
        fetchParams = { user: null, excludeEmail: true };
      } else if (loggedInMissionary?.assignment_level === "city") {
        // City missionaries see their city missionaries and all child communities
        fetchParams = {
          user: null,
          cityId: loggedInMissionary?.city_id,
          excludeEmail: true,
        };
      } else {
        // Community missionaries see only their community
        fetchParams = {
          user: null,
          communityId: loggedInMissionary?.community_id,
          excludeEmail: true,
        };
      }

      const response = await fetch("/api/database/missionaries", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(fetchParams),
        cache: "no-store",
      });
      if (!response.ok) {
        throw new Error("Failed to fetch missionaries");
      }
      const data = await response.json();
      setMissionaries(data.missionaries || []);
    } catch (error) {
      setMissionaries([]);
      console.error("Error fetching missionaries:", error);
    }
  };

  const handleLogout = () => {
    const rootUrl = process.env.NEXT_PUBLIC_ENVIRONMENT === "dev" ? "/mht" : "";
    router.push(rootUrl + "/admin-dashboard/directory");
  };

  // Get the community name for display
  const getCommunityName = (missionary: Missionary): string => {
    if (
      missionary.assignment_level === "community" &&
      missionary.community_id
    ) {
      const community = communityList.find(
        (c) => c.id === missionary.community_id,
      );
      return community?.name || "—";
    }
    if (missionary.assignment_level === "city" && missionary.city_id) {
      const city = cityList.find((c) => c.id === missionary.city_id);
      return city ? `${city.name} (City)` : "—";
    }
    if (missionary.assignment_level === "state") {
      return "State Level";
    }
    return "—";
  };

  // Get city name for a missionary
  const getCityName = (missionary: Missionary): string => {
    if (!missionary.city_id) return "—";
    // Try to use embedded city data first
    if ((missionary as any).cities?.name) {
      return (missionary as any).cities.name;
    }
    // Fall back to lookup
    const city = cityList.find((c) => c.id === missionary.city_id);
    return city?.name || "—";
  };

  // Get community name for a missionary
  const getCommName = (missionary: Missionary): string => {
    if (!missionary.community_id) return "—";
    // Try to use embedded community data first
    if ((missionary as any).communities?.name) {
      return (missionary as any).communities.name;
    }
    // Fall back to lookup
    const community = communityList.find(
      (c) => c.id === missionary.community_id,
    );
    return community?.name || "—";
  };

  // Filter missionaries: only show active ones in directory
  const scopedMissionaries = useMemo(() => {
    let missionaryList = missionaries || [];

    if (loggedInMissionary && email) {
      if (loggedInMissionary.assignment_level === "community") {
        missionaryList = missionaryList.filter(
          (m) => m.community_id === loggedInMissionary.community_id,
        );
      } else if (loggedInMissionary.assignment_level === "city") {
        const childCommunityIds = communityList
          .filter((c) => c.city_id === loggedInMissionary.city_id)
          .map((c) => c.id);

        missionaryList = missionaryList.filter(
          (m) =>
            m.city_id === loggedInMissionary.city_id ||
            childCommunityIds.includes(m.community_id || ""),
        );
      }
    }

    return missionaryList;
  }, [missionaries, loggedInMissionary, email, communityList]);

  // Filter missionaries: only show active ones in directory
  const filteredMissionaries = useMemo(() => {
    const searchLower = searchTerm.toLowerCase();
    const selectedTypeLower = selectedType.toLowerCase();

    return scopedMissionaries
      .filter((m) => {
        if (m.assignment_status?.toLowerCase() !== "active") return false;

        if (selectedCity !== "all" && m.city_id !== selectedCity) return false;
        if (
          selectedCommunity !== "all" &&
          m.community_id !== selectedCommunity
        ) {
          return false;
        }

        if (selectedType !== "all") {
          const type = (m.person_type || "").toLowerCase();
          if (type !== selectedTypeLower) return false;
        }

        const fullName = `${m.first_name} ${m.last_name}`.toLowerCase();
        return (
          fullName.includes(searchLower) ||
          m.first_name?.toLowerCase().includes(searchLower) ||
          m.last_name?.toLowerCase().includes(searchLower) ||
          m.email?.toLowerCase().includes(searchLower) ||
          (m.title || "").toLowerCase().includes(searchLower) ||
          (m.position_detail || "").toLowerCase().includes(searchLower) ||
          (m.notes || "").toLowerCase().includes(searchLower)
        );
      })
      .sort((a, b) => {
        const lastNameA = (a.last_name || "").toLowerCase();
        const lastNameB = (b.last_name || "").toLowerCase();
        return lastNameA.localeCompare(lastNameB);
      });
  }, [
    scopedMissionaries,
    searchTerm,
    selectedCity,
    selectedCommunity,
    selectedType,
  ]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
  }, [searchTerm, selectedCity, selectedCommunity, selectedType]);

  const paginatedMissionaries = filteredMissionaries.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage,
  );

  const handleChangePage = (_: any, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard`);
  };

  const formatPhoneNumber = (phone: string | undefined): string => {
    if (!phone) return "—";
    // Simple US phone formatting
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6,
      )}`;
    }
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return `(${cleaned.slice(1, 4)}) ${cleaned.slice(4, 7)}-${cleaned.slice(
        7,
      )}`;
    }
    return phone;
  };

  const exportToCSV = () => {
    // Prepare CSV headers
    const headers = [
      "First Name",
      "Last Name",
      "Phone",
      "Position",
      "Position Detail",
      "City",
      "Community",
      "Assignment Status",
      "Person Type",
    ];

    // Prepare CSV rows
    const rows = filteredMissionaries.map((missionary) => [
      missionary.first_name || "",
      missionary.last_name || "",
      missionary.contact_number || "",
      missionary.title || "",
      missionary.position_detail || "",
      getCityName(missionary),
      getCommName(missionary),
      missionary.assignment_status || "",
      missionary.person_type || "",
      missionary.notes || "",
    ]);

    // Combine headers and rows
    const csvContent = [
      headers.join(","),
      ...rows.map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","),
      ),
    ].join("\n");

    // Create blob and download
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `missionary-directory-${new Date().toISOString().split("T")[0]}.csv`,
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("Directory exported to CSV");
  };

  // Get unique communities for filter dropdown based on what missionaries are assigned to
  // Build from both embedded data and lookup lists
  const availableCommunities = useMemo(() => {
    const citiesMap = new Map<
      string,
      { id: string; name: string; state?: string }
    >();
    const communitiesMap = new Map<string, { id: string; name: string }>();

    // For email-logged-in users, restrict based on their role
    if (email && loggedInMissionary) {
      if (loggedInMissionary.assignment_level === "community") {
        // Community-level: only their community
        if (loggedInMissionary.community_id) {
          const community = communityList.find(
            (c) => c.id === loggedInMissionary.community_id,
          );
          if (community) {
            communitiesMap.set(community.id, community);
          }
        }
        // Also add their city
        if (loggedInMissionary.city_id) {
          const city = cityList.find(
            (c) => c.id === loggedInMissionary.city_id,
          );
          if (city) {
            citiesMap.set(city.id, city);
          }
        }
      } else if (loggedInMissionary.assignment_level === "city") {
        // City-level: their city and all communities in that city
        // First try to find city in cityList
        const city = cityList.find((c) => c.id === loggedInMissionary.city_id);
        if (city) {
          citiesMap.set(city.id, city);
        } else if (loggedInMissionary.city_id) {
          // Fallback: build city from missionaries data
          const missionaryWithCity = (missionaries || []).find(
            (m) => m.city_id === loggedInMissionary.city_id,
          );
          if (missionaryWithCity && (missionaryWithCity as any).cities) {
            citiesMap.set(
              loggedInMissionary.city_id,
              (missionaryWithCity as any).cities,
            );
          }
        }

        // Add all communities in their city
        const filtered = communityList.filter(
          (c) => c.city_id === loggedInMissionary.city_id,
        );

        filtered.forEach((community) => {
          if (community.id && community.name) {
            communitiesMap.set(community.id, community);
          }
        });
      } else if (loggedInMissionary.assignment_level === "state") {
        // State-level: all communities and cities
        cityList.forEach((city) => {
          if (city.id && city.name) {
            citiesMap.set(city.id, city);
          }
        });

        communityList.forEach((community) => {
          if (community.id && community.name) {
            communitiesMap.set(community.id, community);
          }
        });
      }
    }

    return {
      communities: Array.from(communitiesMap.values()),
      cities: Array.from(citiesMap.values()),
    };
  }, [communityList, cityList, loggedInMissionary, email, missionaries]);

  const availableTypes = useMemo(() => {
    const typeSet = new Set<string>();

    scopedMissionaries.forEach((m) => {
      if (m.assignment_status?.toLowerCase() !== "active") return;
      if (m.person_type) {
        typeSet.add(m.person_type);
      }
    });

    return Array.from(typeSet).sort((a, b) => a.localeCompare(b));
  }, [scopedMissionaries]);

  const formatTypeLabel = (type: string) =>
    type
      .split(" ")
      .map((word) =>
        word.length > 0
          ? word[0].toUpperCase() + word.slice(1).toLowerCase()
          : "",
      )
      .join(" ");

  // Determine if we should show the community/city filter dropdown based on assignment level
  const shouldShowCommunityFilter = useMemo(() => {
    // For email-logged-in users, hide the filter based on their assignment level
    if (loggedInMissionary?.assignment_level === "community") {
      // Community missionaries see only their community - no filtering
      return false;
    }
    if (loggedInMissionary?.assignment_level === "city") {
      // City missionaries can filter between city and child communities
      return true;
    }
    if (loggedInMissionary?.assignment_level === "state") {
      // State missionaries can see all and filter by community/city
      return true;
    }

    return false;
  }, [loggedInMissionary]);

  const isLoading = !loggedInMissionary || missionaries === null;

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "60vh",
        }}
      >
        <Loading />
      </Box>
    );
  }

  // Mobile card view component
  const MobileCard = ({ missionary }: { missionary: Missionary }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
          <Avatar
            src={missionary.profile_picture_url || undefined}
            sx={{ width: 48, height: 48, mr: 2, bgcolor: "primary.main" }}
          >
            {missionary.first_name?.[0]}
            {missionary.last_name?.[0]}
          </Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold">
              {missionary.first_name} {missionary.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {missionary.title || "—"}
            </Typography>
            {missionary.position_detail && (
              <Typography variant="caption" color="text.secondary">
                {missionary.position_detail}
              </Typography>
            )}
          </Box>
        </Box>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Phone fontSize="small" color="action" />
            <Typography variant="body2">
              {formatPhoneNumber(missionary.contact_number)}
            </Typography>
            {missionary.contact_number && (
              <IconButton
                size="small"
                onClick={() =>
                  copyToClipboard(missionary.contact_number!, "Phone")
                }
              >
                <ContentCopy fontSize="small" />
              </IconButton>
            )}
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Email fontSize="small" color="action" />
            <Typography variant="body2" sx={{ wordBreak: "break-all" }}>
              {missionary.email}
            </Typography>
            <IconButton
              size="small"
              onClick={() => copyToClipboard(missionary.email, "Email")}
            >
              <ContentCopy fontSize="small" />
            </IconButton>
          </Box>

          <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
            <Chip
              label={getCommunityName(missionary)}
              size="small"
              variant="outlined"
              color="primary"
            />
            <Typography variant="body2" sx={{ textTransform: "capitalize" }}>
              {missionary.person_type || "—"}
            </Typography>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Grid
      item
      sm={12}
      display="flex"
      sx={{
        backgroundColor: "#f5f5f5",
        flexGrow: 1,

        overflowY: "auto",
        py: 5,
      }}
    >
      <Container
        sx={{
          flexGrow: 1,

          py: 5,
        }}
      >
        {/* Header */}
        <AppBar position="static" color="default" elevation={1}>
          <Toolbar>
            <People sx={{ mr: 2, color: "primary.main" }} />
            <Box sx={{ flexGrow: 1 }}>
              <Typography variant="h6" component="h1" fontWeight="bold">
                Missionary &amp; Volunteer Directory
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {loggedInMissionary?.assignment_level === "community"
                  ? "Viewing directory for your community"
                  : loggedInMissionary?.assignment_level === "city"
                    ? "Viewing directory for your city and communities"
                    : loggedInMissionary?.assignment_level === "state"
                      ? "Viewing directory for all regions"
                      : "Contact information for active missionaries and volunteers"}
              </Typography>
            </Box>
            <Button
              variant="contained"
              color="primary"
              startIcon={<Download />}
              onClick={exportToCSV}
              size="small"
              sx={{ mr: 1 }}
            >
              Export CSV
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<Logout />}
              onClick={handleLogout}
              size="small"
            >
              Logout
            </Button>
          </Toolbar>
        </AppBar>

        <Container maxWidth="xl" sx={{ py: 4 }}>
          <Paper elevation={2} sx={{ p: 3 }}>
            {/* Search and Filter Controls */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={shouldShowCommunityFilter ? 3 : 6}>
                <TextField
                  fullWidth
                  placeholder="Search by name, email, or position..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search />
                      </InputAdornment>
                    ),
                  }}
                />
              </Grid>
              {availableTypes.length > 0 && (
                <Grid item xs={12} md={shouldShowCommunityFilter ? 3 : 6}>
                  <FormControl fullWidth>
                    <InputLabel>Filter by Type</InputLabel>
                    <Select
                      value={selectedType}
                      label="Filter by Type"
                      onChange={(e) => setSelectedType(e.target.value)}
                      renderValue={(value) =>
                        value === "all"
                          ? "All Types"
                          : formatTypeLabel(
                              availableTypes.find(
                                (type) =>
                                  type.toLowerCase() ===
                                  String(value).toLowerCase(),
                              ) || String(value),
                            )
                      }
                    >
                      <MenuItem value="all">All Types</MenuItem>
                      {availableTypes.map((type) => (
                        <MenuItem
                          key={type}
                          value={type.toLowerCase()}
                          sx={{ textTransform: "capitalize" }}
                        >
                          {formatTypeLabel(type)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
              {shouldShowCommunityFilter && (
                <>
                  {availableCommunities.cities.length > 1 && (
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Filter by City</InputLabel>
                        <Select
                          value={selectedCity}
                          label="Filter by City"
                          onChange={(e) => setSelectedCity(e.target.value)}
                        >
                          <MenuItem value="all">All Cities</MenuItem>
                          {availableCommunities.cities.map((city) => (
                            <MenuItem key={city.id} value={city.id}>
                              {city.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                  {availableCommunities.communities.length > 1 && (
                    <Grid item xs={12} md={3}>
                      <FormControl fullWidth>
                        <InputLabel>Filter by Community</InputLabel>
                        <Select
                          value={selectedCommunity}
                          label="Filter by Community"
                          onChange={(e) => setSelectedCommunity(e.target.value)}
                        >
                          <MenuItem value="all">All Communities</MenuItem>
                          {availableCommunities.communities.map((community) => (
                            <MenuItem key={community.id} value={community.id}>
                              {community.name}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  )}
                </>
              )}
            </Grid>

            {/* Directory Table (Desktop) or Cards (Mobile) */}
            {isMobile ? (
              <Box>
                {paginatedMissionaries.map((missionary) => (
                  <MobileCard key={missionary.id} missionary={missionary} />
                ))}
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow sx={{ backgroundColor: "#f9f9f9" }}>
                      <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Phone</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>Type</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>City</TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Community
                      </TableCell>
                      <TableCell sx={{ fontWeight: "bold" }}>
                        Position
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedMissionaries.map((missionary) => (
                      <TableRow
                        key={missionary.id}
                        hover
                        sx={{ "&:hover": { backgroundColor: "#f5f5f5" } }}
                      >
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 2,
                            }}
                          >
                            <Avatar
                              src={missionary.profile_picture_url || undefined}
                              sx={{
                                width: 36,
                                height: 36,
                                bgcolor: "primary.main",
                              }}
                            >
                              {missionary.first_name?.[0]}
                              {missionary.last_name?.[0]}
                            </Avatar>
                            <Typography variant="body2" fontWeight="medium">
                              {missionary.first_name} {missionary.last_name}
                            </Typography>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Typography variant="body2">
                              {formatPhoneNumber(missionary.contact_number)}
                            </Typography>
                            {missionary.contact_number && (
                              <Tooltip title="Copy phone">
                                <IconButton
                                  size="small"
                                  onClick={() =>
                                    copyToClipboard(
                                      missionary.contact_number!,
                                      "Phone",
                                    )
                                  }
                                >
                                  <ContentCopy fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )}
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="body2"
                            sx={{ textTransform: "capitalize" }}
                          >
                            {missionary.person_type || "—"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {getCityName(missionary)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {getCommName(missionary)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box>
                            <Typography variant="body2" fontWeight="medium">
                              {missionary.title || "—"}
                            </Typography>
                            {missionary.position_detail && (
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                {missionary.position_detail}
                              </Typography>
                            )}
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {/* Pagination */}
            {filteredMissionaries.length > 0 && (
              <TablePagination
                component="div"
                count={filteredMissionaries.length}
                page={page}
                onPageChange={handleChangePage}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                rowsPerPageOptions={[10, 25, 50, 100]}
              />
            )}

            {/* Empty State */}
            {filteredMissionaries.length === 0 && (
              <Box sx={{ textAlign: "center", py: 6 }}>
                <Person sx={{ fontSize: 64, color: "text.secondary", mb: 2 }} />
                <Typography variant="h6" gutterBottom>
                  No missionaries or volunteers found
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Try adjusting your search or filter criteria.
                </Typography>
              </Box>
            )}
          </Paper>
        </Container>
      </Container>
    </Grid>
  );
}
