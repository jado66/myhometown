"use client";

import React, { useState, useEffect } from "react";
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Chip,
  Avatar,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  Grid,
  useMediaQuery,
  useTheme,
  Alert,
  CircularProgress,
  Switch,
  FormControlLabel,
  Button,
  TextareaAutosize,
} from "@mui/material";
import {
  Search,
  Email,
  Phone,
  LocationOn,
  PersonAdd,
  Refresh,
  Download,
  CheckCircle,
  CheckCircleOutline,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";
import { useVolunteerSignups } from "@/hooks/use-volunteer-signups";
import { useUser } from "@/hooks/use-user";
import moment from "moment";

const VolunteerSignupsTable = ({ communityFilter = null }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(25);
  const [showContacted, setShowContacted] = useState(false);
  const [updatingContact, setUpdatingContact] = useState(null);
  const { user } = useUser();

  // Local state for notes editing
  const [notesState, setNotesState] = useState({});

  const {
    signups: allSignups,
    loading,
    error,
    pagination,
    refetch,
    changePage,
    changeLimit,
  } = useVolunteerSignups(communityFilter, searchTerm, user);

  // Filter signups based on contacted status
  const signups = showContacted
    ? allSignups
    : allSignups.filter((signup) => !signup.is_contacted);

  // Initialize notes state when signups change
  useEffect(() => {
    setNotesState((prevState) => {
      const newState = { ...prevState };
      (allSignups || []).forEach((signup) => {
        // Only initialize if this signup doesn't exist in state yet
        if (!(signup.id in newState)) {
          newState[signup.id] = signup.notes || "";
        }
      });
      return newState;
    });
  }, [allSignups]);

  // Save notes to backend
  const saveNotes = React.useCallback(async (signupId, notes) => {
    try {
      const response = await fetch("/api/volunteer-signup/notes", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: signupId, notes }),
      });
      if (!response.ok) throw new Error("Failed to update notes");
      // Don't refetch - local state is already updated optimistically
    } catch (error) {
      // Optionally show error
      console.error("Error updating notes:", error);
    }
  }, []);

  // Debounced version
  const debouncedSaveNotes = React.useMemo(() => {
    let timeout;
    return (signupId, notes) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => {
        saveNotes(signupId, notes);
      }, 600);
    };
  }, [saveNotes]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    changePage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
    changeLimit(newRowsPerPage);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleMarkAsContacted = async (signupId, isContacted) => {
    setUpdatingContact(signupId);
    try {
      const response = await fetch("/api/volunteer-signup/contact", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id: signupId,
          is_contacted: !isContacted,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update contact status");
      }

      // Refresh the data
      refetch();
    } catch (error) {
      console.error("Error updating contact status:", error);
      // You could add a toast notification here
    } finally {
      setUpdatingContact(null);
    }
  };

  const formatDate = (dateString) => {
    try {
      return moment(dateString).format("MMM DD, YYYY");
    } catch {
      return "Invalid date";
    }
  };

  const formatPhone = (phone) => {
    if (!phone) return "N/A";
    // Format as (XXX) XXX-XXXX if it's a 10-digit number
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
        6,
      )}`;
    }
    return phone;
  };

  const getInitials = (firstName, lastName) => {
    return `${firstName?.charAt(0) || ""}${
      lastName?.charAt(0) || ""
    }`.toUpperCase();
  };

  const handleExportCSV = () => {
    const csvData = signups.map((signup) => ({
      "First Name": signup.first_name,
      "Last Name": signup.last_name,
      Email: signup.email,
      Phone: signup.contact_number || "",
      "Street Address": signup.street_address || "",
      City: signup.address_city || "",
      State: signup.address_state || "",
      "Zip Code": signup.zip_code || "",
      Community: signup.communities?.name || "N/A",
      "City/State": signup.communities?.cities
        ? `${signup.communities.cities.name}, ${signup.communities.cities.state}`
        : "N/A",
      "Signup Date": formatDate(signup.created_at),
      Notes: signup.notes || "",
    }));

    const headers = Object.keys(csvData[0] || {});
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        headers
          .map((header) => {
            const value = row[header] || "";
            // Escape commas and quotes
            if (value.includes(",") || value.includes('"')) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          })
          .join(","),
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `volunteer_signups_${new Date()
      .toISOString()
      .slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  if (loading && signups.length === 0) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="200px"
      >
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        Error loading volunteer signups: {error}
        <IconButton onClick={refetch} size="small" sx={{ ml: 1 }}>
          <Refresh />
        </IconButton>
      </Alert>
    );
  }

  const MobileCard = ({ signup }) => (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box display="flex" alignItems="center" mb={2}>
          <Avatar sx={{ mr: 2, bgcolor: "#1976d2" }}>
            {signup.profile_picture_url ? (
              <img
                src={signup.profile_picture_url}
                alt={`${signup.first_name} ${signup.last_name}`}
                style={{ width: "100%", height: "100%" }}
              />
            ) : (
              getInitials(signup.first_name, signup.last_name)
            )}
          </Avatar>
          <Box>
            <Typography variant="h6" component="div">
              {signup.first_name} {signup.last_name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Signed up {formatDate(signup.created_at)}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <Email sx={{ mr: 1, color: "text.secondary", fontSize: 16 }} />
              <Typography variant="body2">{signup.email}</Typography>
            </Box>
          </Grid>

          {signup.contact_number && (
            <Grid item xs={12}>
              <Box display="flex" alignItems="center">
                <Phone sx={{ mr: 1, color: "text.secondary", fontSize: 16 }} />
                <Typography variant="body2">
                  {formatPhone(signup.contact_number)}
                </Typography>
              </Box>
            </Grid>
          )}

          <Grid item xs={12}>
            <Box display="flex" alignItems="center">
              <LocationOn
                sx={{ mr: 1, color: "text.secondary", fontSize: 16 }}
              />
              <Typography variant="body2">
                {[signup.address_city, signup.address_state]
                  .filter(Boolean)
                  .join(", ") || "N/A"}
              </Typography>
            </Box>
          </Grid>

          {signup.communities && (
            <Grid item xs={12}>
              <Chip
                label={signup.communities.name}
                size="small"
                color="primary"
                variant="outlined"
              />
              {signup.communities.cities && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ ml: 1 }}
                >
                  {signup.communities.cities.name},{" "}
                  {signup.communities.cities.state}
                </Typography>
              )}
            </Grid>
          )}

          <Grid item xs={12}>
            <Box
              display="flex"
              justifyContent="space-between"
              alignItems="center"
              mt={1}
            >
              <Chip
                label={signup.is_contacted ? "Contacted" : "Not Contacted"}
                size="small"
                color={signup.is_contacted ? "success" : "default"}
                icon={
                  signup.is_contacted ? <CheckCircle /> : <CheckCircleOutline />
                }
              />
              <Button
                size="small"
                variant={signup.is_contacted ? "outlined" : "contained"}
                onClick={() =>
                  handleMarkAsContacted(signup.id, signup.is_contacted)
                }
                disabled={updatingContact === signup.id}
                startIcon={
                  signup.is_contacted ? <VisibilityOff /> : <CheckCircle />
                }
                sx={{
                  color: signup.is_contacted ? "text.secondary" : "white",
                  backgroundColor: signup.is_contacted
                    ? "transparent"
                    : "primary.main",
                  "&:hover": {
                    backgroundColor: signup.is_contacted
                      ? "action.hover"
                      : "primary.dark",
                  },
                }}
              >
                {updatingContact === signup.id
                  ? "Updating..."
                  : signup.is_contacted
                    ? "Mark Uncontacted"
                    : "Mark Contacted"}
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      {/* Header */}
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Typography variant="h5" component="h2" fontWeight="bold">
          Volunteer Signups
        </Typography>
        <Box display="flex" gap={1} alignItems="center">
          <FormControlLabel
            control={
              <Switch
                checked={showContacted}
                onChange={(e) => setShowContacted(e.target.checked)}
                color="primary"
              />
            }
            label="Show Contacted"
          />
          <Tooltip title="Refresh">
            <IconButton onClick={refetch} disabled={loading}>
              <Refresh />
            </IconButton>
          </Tooltip>
          <Button
            variant="outlined"
            startIcon={<Download />}
            onClick={handleExportCSV}
            disabled={signups.length === 0}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Search */}
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search by name or email..."
        value={searchTerm}
        onChange={handleSearchChange}
        sx={{ mb: 3 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <Search />
            </InputAdornment>
          ),
        }}
      />

      {/* Stats */}
      <Box mb={3}>
        <Typography variant="body2" color="text.secondary">
          {showContacted
            ? `${signups.length} signups (${
                allSignups.filter((s) => s.is_contacted).length
              } contacted, ${
                allSignups.filter((s) => !s.is_contacted).length
              } uncontacted)`
            : `${signups.length} uncontacted signups (${
                allSignups.filter((s) => s.is_contacted).length
              } contacted hidden)`}
        </Typography>
      </Box>

      {signups.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: "center" }}>
          <PersonAdd sx={{ fontSize: 48, color: "text.secondary", mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            No volunteer signups found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm
              ? "Try adjusting your search criteria."
              : "No volunteers have signed up yet."}
          </Typography>
        </Paper>
      ) : isMobile ? (
        // Mobile view - Cards
        <Box>
          {signups.map((signup) => (
            <MobileCard key={signup.id} signup={signup} />
          ))}
        </Box>
      ) : (
        // Desktop view - Table
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Volunteer</TableCell>
                <TableCell>Contact</TableCell>
                <TableCell>Location</TableCell>
                <TableCell>Community</TableCell>
                <TableCell>Signup Date</TableCell>

                <TableCell>Actions</TableCell>
                <TableCell>Notes</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {signups.map((signup) => (
                <TableRow key={signup.id} hover>
                  {/* ...existing code... */}
                  <TableCell>
                    <Box display="flex" alignItems="center">
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {signup.first_name} {signup.last_name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {signup.email}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box>
                      <Typography variant="body2">
                        {formatPhone(signup.contact_number)}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {signup.street_address && (
                        <Box>{signup.street_address}</Box>
                      )}
                      <Box>
                        {[
                          signup.address_city,
                          signup.address_state,
                          signup.zip_code,
                        ]
                          .filter(Boolean)
                          .join(", ") || "N/A"}
                      </Box>
                    </Typography>
                  </TableCell>

                  <TableCell>
                    {signup.communities ? (
                      <Box>
                        <Chip
                          label={signup.communities.name}
                          size="small"
                          color="primary"
                          variant="outlined"
                        />
                        {signup.communities.cities && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                            sx={{ mt: 0.5 }}
                          >
                            {signup.communities.cities.name},{" "}
                            {signup.communities.cities.state}
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        N/A
                      </Typography>
                    )}
                  </TableCell>

                  <TableCell>
                    <Typography variant="body2">
                      {formatDate(signup.created_at)}
                    </Typography>
                  </TableCell>

                  <TableCell>
                    <Button
                      size="small"
                      variant={signup.is_contacted ? "outlined" : "contained"}
                      onClick={() =>
                        handleMarkAsContacted(signup.id, signup.is_contacted)
                      }
                      disabled={updatingContact === signup.id}
                      startIcon={
                        signup.is_contacted ? (
                          <VisibilityOff />
                        ) : (
                          <CheckCircle />
                        )
                      }
                      sx={{
                        color: signup.is_contacted ? "text.secondary" : "white",
                        backgroundColor: signup.is_contacted
                          ? "transparent"
                          : "primary.main",
                        "&:hover": {
                          backgroundColor: signup.is_contacted
                            ? "action.hover"
                            : "primary.dark",
                        },
                      }}
                    >
                      {updatingContact === signup.id
                        ? "Updating..."
                        : signup.is_contacted
                          ? "Mark Uncontacted"
                          : "Mark Contacted"}
                    </Button>
                  </TableCell>
                  <TableCell>
                    <TextareaAutosize
                      variant="outlined"
                      size="small"
                      fullWidth
                      rows={1}
                      value={notesState[signup.id] ?? ""}
                      placeholder="Add notes..."
                      onChange={(e) => {
                        const value = e.target.value;
                        setNotesState((prev) => ({
                          ...prev,
                          [signup.id]: value,
                        }));
                        debouncedSaveNotes(signup.id, value);
                      }}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Pagination */}
      {signups.length > 0 && (
        <TablePagination
          component="div"
          count={pagination.total || 0}
          page={page}
          onPageChange={handleChangePage}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          rowsPerPageOptions={[10, 25, 50, 100]}
          sx={{ mt: 2 }}
        />
      )}
    </Box>
  );
};

export default VolunteerSignupsTable;
