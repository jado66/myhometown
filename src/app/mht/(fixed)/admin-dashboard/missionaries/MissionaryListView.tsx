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
import React, { useMemo } from "react";
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
  Popover,
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
  StickyNote2 as NoteIcon,
} from "@mui/icons-material";
import { MissionaryViewDialog } from "./MissionaryViewDialog";

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
  // Pre-index hours by missionary_id so lookups are O(1) instead of O(n)
  const hoursMap = useMemo(() => {
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth();

    const map = new Map<
      string,
      {
        totalHours: number;
        currentMonthHours: number;
        hasEntries: boolean;
        entryCount: number;
      }
    >();

    for (const h of hours) {
      const id = h.missionary_id;
      if (!id) continue;

      let entry = map.get(id);
      if (!entry) {
        entry = {
          totalHours: 0,
          currentMonthHours: 0,
          hasEntries: false,
          entryCount: 0,
        };
        map.set(id, entry);
      }

      const hoursValue = h.total_hours || 0;
      entry.totalHours += hoursValue;
      entry.entryCount += 1;
      entry.hasEntries = true;

      if (h.period_start_date) {
        const periodStart = new Date(h.period_start_date + "T00:00:00.000Z");
        if (
          periodStart.getUTCFullYear() === currentYear &&
          periodStart.getUTCMonth() === currentMonth
        ) {
          entry.currentMonthHours += hoursValue;
        }
      }
    }

    return map;
  }, [hours]);

  const defaultHoursData = {
    totalHours: 0,
    currentMonthHours: 0,
    hasEntries: false,
    entryCount: 0,
  };

  const getHoursData = (missionaryId: string) => {
    return hoursMap.get(missionaryId) || defaultHoursData;
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
  const [noteAnchorEl, setNoteAnchorEl] = React.useState<null | HTMLElement>(
    null,
  );
  const [noteForMissionary, setNoteForMissionary] = React.useState<any>(null);

  const handleMenuOpen = (
    event: React.MouseEvent<HTMLElement>,
    missionary: any,
  ) => {
    setAnchorEl(event.currentTarget);
    setSelectedMissionary(missionary);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMissionary(null);
  };

  const handleNoteOpen = (
    event: React.MouseEvent<HTMLElement>,
    missionary: any,
  ) => {
    setNoteAnchorEl(event.currentTarget);
    setNoteForMissionary(missionary);
  };

  const handleNoteClose = () => {
    setNoteAnchorEl(null);
    setNoteForMissionary(null);
  };

  const getLocationDisplay = (missionary: any) => {
    if (missionary.assignment_level === "state") {
      return "myHometown Utah";
    } else if (missionary.assignment_level === "city") {
      // Check if city data is already joined in the missionary object
      if (
        missionary.cities &&
        typeof missionary.cities === "object" &&
        missionary.cities.name
      ) {
        return `${missionary.cities.name}${
          missionary.cities.state ? ", " + missionary.cities.state : ""
        }`;
      }
      // Otherwise, look up from cities array
      if (!Array.isArray(cities)) return "";
      const city = cities.find(
        (c) => c._id === missionary.city_id || c.id === missionary.city_id,
      );
      return city ? `${city.name}, ${city.state}` : "";
    } else if (missionary.assignment_level === "community") {
      // Check if community data is already joined in the missionary object
      if (
        missionary.communities &&
        typeof missionary.communities === "object" &&
        missionary.communities.name
      ) {
        // Also get city name if available
        const cityName =
          missionary.cities &&
          typeof missionary.cities === "object" &&
          missionary.cities.name
            ? missionary.cities.name
            : missionary.communities.city || "";
        return `${missionary.communities.name}${
          cityName ? " (" + cityName + ")" : ""
        }`;
      }
      // Otherwise, look up from communities array
      if (!Array.isArray(communities)) return "";
      const community = communities.find(
        (c) =>
          c._id === missionary.community_id || c.id === missionary.community_id,
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
              <TableCell>Type/Status</TableCell>
              <TableCell>Assignment</TableCell>
              <TableCell>Position</TableCell>
              <TableCell>Position Detail</TableCell>
              <TableCell>Hours (Month/Total)</TableCell>
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
                  <TableCell sx={{ pl: 1, pr: 0 }}>
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
                    <Tooltip title="View details">
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          cursor: "pointer",
                          "&:hover": {
                            "& .missionary-name": {
                              textDecoration: "underline",
                            },
                          },
                        }}
                        onClick={() => {
                          setSelectedMissionary(missionary);
                          setDetailsOpen(true);
                        }}
                      >
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
                            boxShadow: 2,
                            transition: "box-shadow 0.2s",
                            "&:hover": { boxShadow: 6 },
                          }}
                        >
                          {!missionary.profile_picture_url && (
                            <Typography variant="body2">
                              {missionary.first_name?.[0]}
                              {missionary.last_name?.[0]}
                            </Typography>
                          )}
                        </Avatar>
                        <Box>
                          <Typography
                            variant="subtitle2"
                            fontWeight="bold"
                            className="missionary-name"
                          >
                            {missionary.first_name} {missionary.last_name}
                          </Typography>
                        </Box>
                      </Box>
                    </Tooltip>
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
                      <Typography
                        variant="caption"
                        fontWeight="medium"
                        color="primary"
                        sx={{ textTransform: "capitalize" }}
                      >
                        {missionary.assignment_status}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell sx={{ minWidth: 150 }}>
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <LocationOnIcon
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                      <Typography variant="body2">
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
                          whiteSpace: "nowrap",
                        }}
                      >
                        {missionary.title || "Position not set"}
                      </Typography>
                    </Box>
                  </TableCell>

                  <TableCell>
                    <Box>
                      <Typography
                        variant="body2"
                        fontWeight="medium"
                        sx={{
                          opacity: missionary.position_detail ? 1 : 0.6,
                          fontStyle: "normal",
                        }}
                      >
                        {missionary.position_detail}
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
                      <Typography variant="body2" fontWeight="medium">
                        <Box component="span" color="secondary.main">
                          {hoursData.currentMonthHours}h
                        </Box>
                        {" / "}
                        <Box component="span" color="primary.main">
                          {hoursData.totalHours}h
                        </Box>
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
                      {missionary.end_date && (
                        <Typography variant="caption" color="text.secondary">
                          Release: {formatDate(missionary.end_date)}
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
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        gap: 0.5,
                      }}
                    >
                      {missionary.notes && (
                        <Tooltip title="View note">
                          <IconButton
                            onClick={(e) => handleNoteOpen(e, missionary)}
                            size="small"
                            color="primary"
                          >
                            <NoteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      )}
                      <Tooltip title="Edit">
                        <IconButton
                          onClick={() => onEdit(missionary)}
                          size="small"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete">
                        <IconButton
                          onClick={() => onDelete(missionary)}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Note Popover */}
      <Popover
        open={Boolean(noteAnchorEl)}
        anchorEl={noteAnchorEl}
        onClose={handleNoteClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        PaperProps={{
          sx: { maxWidth: 300, p: 2 },
        }}
      >
        <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
          Note
        </Typography>
        <Typography variant="body2">{noteForMissionary?.notes}</Typography>
      </Popover>

      {/* Details Dialog */}
      <MissionaryViewDialog
        open={detailsOpen && !!selectedMissionary}
        onClose={() => setDetailsOpen(false)}
        onEdit={(missionary) => {
          setDetailsOpen(false);
          onEdit(missionary);
        }}
        missionary={selectedMissionary}
        cities={cities}
        communities={communities}
        hoursData={
          selectedMissionary ? getHoursData(selectedMissionary.id) : undefined
        }
        isUpcomingView={isUpcomingView}
      />
    </>
  );
};
