// Calculate release date based on start_date and duration (e.g., '12 months')
const getReleaseDate = (missionary: any) => {
  if (!missionary.start_date || !missionary.duration) return null;
  const monthsMatch = missionary.duration.match(/(\d+)/);
  if (!monthsMatch) return null;
  const months = parseInt(monthsMatch[1], 10);
  if (isNaN(months)) return null;
  const start = new Date(missionary.start_date);
  start.setMonth(start.getMonth() + months);
  return start.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Avatar,
  Typography,
  Chip,
  IconButton,
  Box,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  Grid,
  Tooltip,
  Divider,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  MoreVert as MoreVertIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  Report as ReportIcon,
  Warning,
  Schedule as ScheduleIcon,
  CalendarToday as CalendarTodayIcon,
  Help,
} from "@mui/icons-material";

interface MissionaryListViewProps {
  missionaries: any[];
  cities: any[];
  communities: any[];
  hours?: any[]; // Add hours prop
  onEdit: (missionary: any) => void;
  onDelete: (missionary: any) => void;
  isUpcomingView?: boolean;
  onProfilePictureClick?: (url: string | null, name: string | null) => void;
}

export const MissionaryListView: React.FC<MissionaryListViewProps> = ({
  missionaries = [],
  cities = [],
  communities = [],
  hours = [], // Default to empty array
  onEdit,
  onDelete,
  isUpcomingView = false,
  onProfilePictureClick,
}) => {
  // Address helpers
  const buildFullAddress = (m: any) => {
    const street = m.street_address?.trim();
    const city = m.address_city?.trim();
    const state = m.address_state?.trim();
    const zip = m.zip_code?.trim();
    if (street && city && state && zip)
      return `${street}, ${city}, ${state} ${zip}`;
    const parts = [street, city, state, zip].filter(Boolean);
    return parts.length ? parts.join(", ") : "Address not set";
  };

  const getMissingAddressParts = (m: any): string[] => {
    const missing: string[] = [];
    if (!m.street_address) missing.push("Street Address");
    if (!m.address_city) missing.push("City");
    if (!m.address_state) missing.push("State");
    if (!m.zip_code) missing.push("Zip Code");
    return missing;
  };
  // Calculate hours for a specific missionary
  const getHoursData = (missionaryId: string) => {
    console.log("List - Hours data:", hours); // Debug log
    console.log("List - Looking for missionary ID:", missionaryId); // Debug log

    const missionaryHours = hours.filter((h) => {
      console.log("List - Comparing:", h.missionary_id, "with", missionaryId); // Debug log
      return h.missionary_id === missionaryId;
    });

    console.log("List - Filtered hours for missionary:", missionaryHours); // Debug log

    // Calculate total hours
    const totalHours = missionaryHours.reduce((sum, h) => {
      const hoursValue = h.total_hours || 0;
      return sum + hoursValue;
    }, 0);

    // Calculate current month hours
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-based (0 = January, 9 = October)

    const currentMonthHours = missionaryHours
      .filter((h) => {
        if (!h.period_start_date) return false;
        // Parse the date string (format: "2025-10-01")
        const periodStart = new Date(h.period_start_date + "T00:00:00.000Z");
        const periodYear = periodStart.getUTCFullYear();
        const periodMonth = periodStart.getUTCMonth();
        return periodYear === currentYear && periodMonth === currentMonth;
      })
      .reduce((sum, h) => sum + (h.total_hours || 0), 0);

    const hasEntries = missionaryHours.length > 0;

    console.log(
      "List - Total hours:",
      totalHours,
      "Current month:",
      currentMonthHours,
      "Has entries:",
      hasEntries
    ); // Debug log

    return {
      totalHours,
      currentMonthHours,
      hasEntries,
      entryCount: missionaryHours.length,
    };
  };

  // Calculate days left using end_date (for upcoming view)
  const getDaysLeft = (missionary: any) => {
    if (!missionary.end_date) return null;
    const end = new Date(missionary.end_date);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [selectedMissionary, setSelectedMissionary] = React.useState<any>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    missionary: any
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedMissionary(missionary);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMissionary(null);
  };

  const getLocationDisplay = (missionary: any) => {
    if (missionary.assignment_level === "state") {
      return "myHometown Utah";
    } else if (missionary.assignment_level === "city") {
      if (!Array.isArray(cities)) return "";
      const city = cities.find(
        (c) => c._id === missionary.city_id || c.id === missionary.city_id
      );
      return city ? `${city.name}, ${city.state}` : "";
    } else if (missionary.assignment_level === "community") {
      if (!Array.isArray(communities)) return "";
      const community = communities.find(
        (c) =>
          c._id === missionary.community_id || c.id === missionary.community_id
      );
      return community ? `${community.name} (${community.city})` : "";
    }
    return "No Assignment";
  };

  const getStatusColor = (status: string) => {
    return status === "active" ? "success" : "default";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const showNoHoursWarning = false;

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.50" }}>
              <TableCell sx={{ width: 56 }}></TableCell>{" "}
              {/* Error/Warning column */}
              {isUpcomingView && <TableCell>Days Left</TableCell>}
              <TableCell>Name</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Assignment</TableCell>
              <TableCell>Title/Group</TableCell>
              <TableCell>Total Hours</TableCell>
              <TableCell>This Month</TableCell>
              <TableCell>Call/Start Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {missionaries.map((missionary) => {
              const hoursData = getHoursData(missionary.id);
              return (
                <TableRow key={missionary.id} hover>
                  {/* Error/Warning column */}
                  <TableCell sx={{ width: 56 }}>
                    {/* Error icon if no hours entries */}
                    {!hoursData.hasEntries && showNoHoursWarning && (
                      <Tooltip title="No hours logged this month">
                        <IconButton size="small" color="warning" tabIndex={-1}>
                          <Warning />
                        </IconButton>
                      </Tooltip>
                    )}
                    {/* Error icon for missing information */}
                    {(!missionary.title ||
                      !missionary.contact_number ||
                      (!missionary.stake_name &&
                        missionary.person_type !== "volunteer") ||
                      !missionary.start_date ||
                      !missionary.duration ||
                      !missionary.profile_picture_url ||
                      !missionary.gender ||
                      getMissingAddressParts(missionary).length > 0) && (
                      <Tooltip
                        title={`Missing: ${[
                          !missionary.title && "Position",
                          !missionary.contact_number && "Phone Number",
                          !missionary.stake_name &&
                            missionary.person_type !== "volunteer" &&
                            "Home Stake",
                          !missionary.start_date && "Start Date",
                          !missionary.duration && "Mission Duration",
                          !missionary.profile_picture_url && "Profile Picture",
                          !missionary.gender && "Gender",
                          ...getMissingAddressParts(missionary),
                        ]
                          .filter(Boolean)
                          .join(", ")} - Click to update`}
                      >
                        <IconButton
                          size="small"
                          color="error"
                          tabIndex={-1}
                          onClick={() => {
                            onEdit(missionary);
                          }}
                        >
                          <Help />
                        </IconButton>
                      </Tooltip>
                    )}
                  </TableCell>
                  {isUpcomingView && (
                    <TableCell>
                      {missionary.daysUntilRelease !== undefined
                        ? missionary.daysUntilRelease
                        : getDaysLeft(missionary)}
                    </TableCell>
                  )}
                  <TableCell>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <Avatar
                        src={missionary.profile_picture_url}
                        alt={`${missionary.first_name} ${missionary.last_name}`}
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: missionary.profile_picture_url
                            ? "transparent"
                            : "warning.light",
                          border: !missionary.profile_picture_url
                            ? "2px solid"
                            : "none",
                          borderColor: !missionary.profile_picture_url
                            ? "warning.main"
                            : "transparent",
                          cursor: onProfilePictureClick ? "pointer" : undefined,
                          boxShadow: onProfilePictureClick ? 2 : undefined,
                          transition: "box-shadow 0.2s",
                          "&:hover": onProfilePictureClick
                            ? { boxShadow: 6 }
                            : undefined,
                        }}
                        onClick={() =>
                          onProfilePictureClick?.(
                            missionary.profile_picture_url || null,
                            missionary.first_name + " " + missionary.last_name
                          )
                        }
                      >
                        {!missionary.profile_picture_url && (
                          <Typography variant="body2">
                            {missionary.first_name?.[0]}
                            {missionary.last_name?.[0]}
                          </Typography>
                        )}
                      </Avatar>
                      <Box>
                        <Typography variant="subtitle2" fontWeight="bold">
                          {missionary.first_name} {missionary.last_name}
                        </Typography>
                        {missionary.notes && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            noWrap
                          >
                            {missionary.notes.length > 50
                              ? `${missionary.notes.substring(0, 50)}...`
                              : missionary.notes}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <EmailIcon
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        />
                        <Typography variant="body2" noWrap>
                          {missionary.email || "No email"}
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 0.5,
                        }}
                      >
                        <PhoneIcon
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            opacity: missionary.contact_number ? 1 : 0.6,
                            fontStyle: missionary.contact_number
                              ? "normal"
                              : "italic",
                          }}
                        >
                          {missionary.contact_number || "No phone"}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box>
                      {missionary.person_type && (
                        <Typography
                          variant="body2"
                          fontWeight="medium"
                          sx={{ textTransform: "capitalize" }}
                        >
                          {missionary.person_type}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <LocationOnIcon
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                      <Typography variant="body2" noWrap>
                        {getLocationDisplay(missionary)}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        sx={{
                          opacity: missionary.title ? 1 : 0.6,
                          fontStyle: missionary.title ? "normal" : "italic",
                          color: missionary.title ? "inherit" : "warning.main",
                        }}
                      >
                        {missionary.title || "Position not set"}
                      </Typography>
                      {missionary.group && (
                        <Typography variant="caption" color="text.secondary">
                          {missionary.group}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <ScheduleIcon
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        color={
                          hoursData.totalHours > 0
                            ? "primary.main"
                            : "text.secondary"
                        }
                      >
                        {hoursData.totalHours}h
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <ScheduleIcon
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        color={
                          hoursData.currentMonthHours > 0
                            ? "secondary.main"
                            : "text.secondary"
                        }
                      >
                        {hoursData.currentMonthHours}h
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box
                      sx={{
                        display: "flex",
                        flexDirection: "column",
                        gap: 0.5,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          opacity: missionary.start_date ? 1 : 0.6,
                          fontStyle: missionary.start_date
                            ? "normal"
                            : "italic",
                          color: missionary.start_date
                            ? "inherit"
                            : "warning.main",
                        }}
                      >
                        {missionary.start_date
                          ? formatDate(missionary.start_date)
                          : "Start date not set"}
                      </Typography>
                      {missionary.start_date &&
                        missionary.duration &&
                        getReleaseDate(missionary) && (
                          <Typography variant="caption" color="text.secondary">
                            Release: {getReleaseDate(missionary)}
                          </Typography>
                        )}
                      {(!missionary.start_date || !missionary.duration) && (
                        <Typography
                          variant="caption"
                          color="warning.main"
                          fontStyle="italic"
                        >
                          {!missionary.duration ? "Duration not set" : ""}
                        </Typography>
                      )}
                    </Box>
                  </TableCell>

                  <TableCell align="right">
                    <Tooltip title="View details">
                      <IconButton
                        onClick={() => {
                          setSelectedMissionary(missionary);
                          setDetailsOpen(true);
                        }}
                        size="small"
                      >
                        <InfoIcon />
                      </IconButton>
                    </Tooltip>
                    <IconButton
                      onClick={(e) => handleMenuOpen(e, missionary)}
                      size="small"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>

        <Menu
          anchorEl={anchorEl}
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem
            onClick={() => {
              if (selectedMissionary) {
                onEdit(selectedMissionary);
              }
              handleMenuClose();
            }}
          >
            <EditIcon sx={{ mr: 1, fontSize: 20 }} /> Edit
          </MenuItem>
          <MenuItem
            onClick={() => {
              if (selectedMissionary) {
                onDelete(selectedMissionary);
              }
              handleMenuClose();
            }}
            sx={{ color: "error.main" }}
          >
            <DeleteIcon sx={{ mr: 1, fontSize: 20 }} /> Delete
          </MenuItem>
        </Menu>
      </TableContainer>

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen && !!selectedMissionary}
        onClose={() => setDetailsOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="h6">
            {selectedMissionary?.first_name} {selectedMissionary?.last_name}
          </Typography>
          <IconButton onClick={() => setDetailsOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          {selectedMissionary && (
            <Stack spacing={3}>
              {/* Basic Info */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Basic Information
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <EmailIcon
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                      <Typography variant="body2" noWrap>
                        {selectedMissionary.email || "No email provided"}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <PhoneIcon
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                      <Typography
                        variant="body2"
                        sx={{
                          opacity: selectedMissionary.contact_number ? 1 : 0.6,
                          fontStyle: selectedMissionary.contact_number
                            ? "normal"
                            : "italic",
                          color: selectedMissionary.contact_number
                            ? "inherit"
                            : "warning.main",
                        }}
                      >
                        {selectedMissionary.contact_number ||
                          "No phone provided"}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <LocationOnIcon
                        sx={{ fontSize: 16, color: "text.secondary" }}
                      />
                      <Typography variant="body2" noWrap>
                        {getLocationDisplay(selectedMissionary)}
                      </Typography>
                    </Box>
                  </Grid>
                  <Grid item xs={12}>
                    <Tooltip
                      title={
                        getMissingAddressParts(selectedMissionary).length
                          ? `Missing: ${getMissingAddressParts(
                              selectedMissionary
                            ).join(", ")}`
                          : "Physical address"
                      }
                    >
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <LocationOnIcon
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography
                          variant="body2"
                          sx={{
                            opacity: getMissingAddressParts(selectedMissionary)
                              .length
                              ? 0.7
                              : 1,
                            fontStyle: getMissingAddressParts(
                              selectedMissionary
                            ).length
                              ? "italic"
                              : "normal",
                          }}
                          noWrap
                        >
                          {buildFullAddress(selectedMissionary)}
                        </Typography>
                      </Box>
                    </Tooltip>
                  </Grid>
                </Grid>
              </Box>

              {/* Hours Information */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Service Hours
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <ScheduleIcon
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                    <Typography variant="body2">
                      {getHoursData(selectedMissionary.id).totalHours} total
                      hours recorded
                    </Typography>
                  </Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <ScheduleIcon
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                    <Typography variant="body2">
                      {getHoursData(selectedMissionary.id).currentMonthHours}{" "}
                      hours this month
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {getHoursData(selectedMissionary.id).entryCount} total
                    entries
                  </Typography>
                </Stack>
              </Box>

              {/* Assignment Details */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Assignment Details
                </Typography>
                <Stack spacing={1}>
                  <Typography variant="body2">
                    <strong>Level:</strong>{" "}
                    {selectedMissionary.assignment_level}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Title:</strong>{" "}
                    {selectedMissionary.title ? (
                      <span>{selectedMissionary.title}</span>
                    ) : (
                      <span style={{ color: "#ed6c02", fontStyle: "italic" }}>
                        Not set
                      </span>
                    )}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Home Stake:</strong>{" "}
                    {selectedMissionary.stake_name ? (
                      <span>{selectedMissionary.stake_name}</span>
                    ) : (
                      <span style={{ color: "#ed6c02", fontStyle: "italic" }}>
                        Not set
                      </span>
                    )}
                  </Typography>
                </Stack>
              </Box>

              {/* Mission Timeline */}
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Mission Timeline
                </Typography>
                <Stack spacing={1}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                    <CalendarTodayIcon
                      sx={{ fontSize: 16, color: "text.secondary" }}
                    />
                    <Typography variant="body2">
                      <strong>Called:</strong>{" "}
                      {selectedMissionary.start_date ? (
                        <span>{formatDate(selectedMissionary.start_date)}</span>
                      ) : (
                        <span style={{ color: "#ed6c02", fontStyle: "italic" }}>
                          Not set
                        </span>
                      )}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    <strong>Duration:</strong>{" "}
                    {selectedMissionary.duration ? (
                      <span>{selectedMissionary.duration}</span>
                    ) : (
                      <span style={{ color: "#ed6c02", fontStyle: "italic" }}>
                        Not set
                      </span>
                    )}
                  </Typography>
                  {selectedMissionary.start_date &&
                    selectedMissionary.duration &&
                    getReleaseDate(selectedMissionary) && (
                      <Typography variant="body2">
                        <strong>Expected Release:</strong>{" "}
                        {getReleaseDate(selectedMissionary)}
                      </Typography>
                    )}
                  {isUpcomingView && (
                    <Typography variant="body2">
                      <strong>Days Remaining:</strong>{" "}
                      {selectedMissionary.daysUntilRelease ??
                        getDaysLeft(selectedMissionary)}
                    </Typography>
                  )}
                </Stack>
              </Box>

              {/* Notes */}
              {selectedMissionary.notes && (
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Notes
                  </Typography>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                      borderLeft: 3,
                      borderColor: "primary.main",
                    }}
                  >
                    <Typography variant="body2">
                      {selectedMissionary.notes}
                    </Typography>
                  </Box>
                </Box>
              )}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => {
              if (selectedMissionary) onEdit(selectedMissionary);
            }}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
