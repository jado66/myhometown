import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Avatar,
  Chip,
  Divider,
  Stack,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import EditIcon from "@mui/icons-material/Edit";
import PersonIcon from "@mui/icons-material/Person";
import AssignmentIcon from "@mui/icons-material/Assignment";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import HomeIcon from "@mui/icons-material/Home";
import CalendarTodayIcon from "@mui/icons-material/CalendarToday";
import ScheduleIcon from "@mui/icons-material/Schedule";
import BadgeIcon from "@mui/icons-material/Badge";
import VolunteerActivismIcon from "@mui/icons-material/VolunteerActivism";
import BusinessIcon from "@mui/icons-material/Business";
import LocationCityIcon from "@mui/icons-material/LocationCity";
import GroupIcon from "@mui/icons-material/Group";
import NoteIcon from "@mui/icons-material/Note";

interface MissionaryViewDialogProps {
  open: boolean;
  onClose: () => void;
  onEdit?: (missionary: any) => void;
  missionary: any;
  cities?: any[];
  communities?: any[];
  hoursData?: {
    totalHours: number;
    currentMonthHours: number;
    hasEntries: boolean;
    entryCount: number;
  };
  isUpcomingView?: boolean;
}

const MissionaryViewDialog: React.FC<MissionaryViewDialogProps> = ({
  open,
  onClose,
  onEdit,
  missionary,
  cities = [],
  communities = [],
  hoursData,
  isUpcomingView = false,
}) => {
  if (!missionary) return null;

  const formatDate = (dateString: string) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getReleaseDate = () => {
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

  const getDaysLeft = () => {
    if (!missionary.end_date) return null;
    const end = new Date(missionary.end_date);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getLocationDisplay = () => {
    if (missionary.assignment_level === "state") {
      return "myHometown Utah";
    } else if (missionary.assignment_level === "city") {
      const city = cities.find(
        (c) => c._id === missionary.city_id || c.id === missionary.city_id
      );
      return city ? `${city.name}, ${city.state}` : "City not found";
    } else if (missionary.assignment_level === "community") {
      const community = communities.find(
        (c) =>
          c._id === missionary.community_id || c.id === missionary.community_id
      );
      return community
        ? `${community.name} (${community.city})`
        : "Community not found";
    }
    return "No Assignment";
  };

  const buildFullAddress = () => {
    const street = missionary.street_address?.trim();
    const city = missionary.address_city?.trim();
    const state = missionary.address_state?.trim();
    const zip = missionary.zip_code?.trim();
    if (street && city && state && zip) {
      return `${street}, ${city}, ${state} ${zip}`;
    }
    const parts = [street, city, state, zip].filter(Boolean);
    return parts.length ? parts.join(", ") : null;
  };

  const InfoRow = ({
    icon: Icon,
    label,
    value,
    notSet = "Not set",
    noCapitalize = false,
  }: {
    icon?: any;
    label: string;
    value: any;
    notSet?: string;
    noCapitalize?: boolean;
  }) => (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, py: 0.5 }}>
      {Icon && <Icon sx={{ fontSize: 18, color: "text.secondary" }} />}
      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ minWidth: 150, alignSelf: "flex-start" }}
      >
        {label}:
      </Typography>
      {value ? (
        <Typography
          variant="body2"
          sx={{ textTransform: noCapitalize ? "none" : "capitalize" }}
        >
          {value}
        </Typography>
      ) : (
        <Typography variant="body2" color="text.disabled" fontStyle="italic">
          {notSet}
        </Typography>
      )}
    </Box>
  );

  const getLevelIcon = () => {
    switch (missionary.assignment_level) {
      case "state":
        return BusinessIcon;
      case "city":
        return LocationCityIcon;
      case "community":
        return GroupIcon;
      default:
        return AssignmentIcon;
    }
  };

  const LevelIcon = getLevelIcon();

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{ sx: { maxHeight: "90vh" } }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          pb: 1,
        }}
      >
        <Typography variant="h6">
          {missionary.person_type === "volunteer" ? "Volunteer" : "Missionary"}{" "}
          Details
        </Typography>
        <IconButton onClick={onClose} edge="end">
          <CloseIcon />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ py: 3 }}>
        <Grid container spacing={3}>
          {/* Left Column - Personal Info */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <PersonIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6" fontWeight="bold">
                    Personal Information
                  </Typography>
                </Box>

                {/* Profile Picture & Name */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    mb: 3,
                  }}
                >
                  <Avatar
                    src={missionary.profile_picture_url}
                    sx={{
                      width: 120,
                      height: 120,
                      mb: 2,
                      bgcolor: missionary.profile_picture_url
                        ? "transparent"
                        : "grey.300",
                      boxShadow: 2,
                    }}
                  >
                    {!missionary.profile_picture_url && (
                      <PersonIcon sx={{ fontSize: 48 }} />
                    )}
                  </Avatar>
                  <Typography variant="h5" fontWeight="bold" textAlign="center">
                    {missionary.first_name} {missionary.last_name}
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, mt: 1, px: 1 }}>
                    <Chip
                      size="small"
                      label={
                        missionary.person_type === "volunteer"
                          ? "Volunteer"
                          : "Missionary"
                      }
                      color="primary"
                      variant="outlined"
                      sx={{
                        px: 1,
                      }}
                    />
                    <Chip
                      size="small"
                      label={missionary.assignment_status || "active"}
                      color="primary"
                      variant="outlined"
                      sx={{
                        px: 1,
                        textTransform: "capitalize",
                      }}
                    />
                    {missionary.gender && (
                      <Chip
                        size="small"
                        label={missionary.gender}
                        color="primary"
                        variant="outlined"
                        sx={{ px: 1, textTransform: "capitalize" }}
                      />
                    )}
                  </Box>
                </Box>

                <Divider sx={{ my: 2 }} />

                {/* Contact Info */}
                <Stack spacing={1}>
                  <InfoRow
                    label="Email"
                    value={missionary.email}
                    notSet="No email provided"
                    noCapitalize
                  />
                  <InfoRow
                    label="Phone"
                    value={missionary.contact_number}
                    notSet="No phone provided"
                  />
                  <InfoRow
                    label="Address"
                    value={buildFullAddress()}
                    notSet="Address not set"
                  />
                </Stack>

                {/* Service Hours */}
                {hoursData && (
                  <>
                    <Divider sx={{ my: 2 }} />
                    <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                      <ScheduleIcon
                        sx={{ mr: 1, color: "primary.main", fontSize: 20 }}
                      />
                      <Typography variant="subtitle2" fontWeight="bold">
                        Service Hours
                      </Typography>
                    </Box>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box
                          sx={{
                            textAlign: "center",
                            p: 1.5,
                            bgcolor: "grey.50",
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="h4" color="primary.main">
                            {hoursData.currentMonthHours}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            This Month
                          </Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box
                          sx={{
                            textAlign: "center",
                            p: 1.5,
                            bgcolor: "grey.50",
                            borderRadius: 1,
                          }}
                        >
                          <Typography variant="h4" color="primary.main">
                            {hoursData.totalHours}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Total Hours
                          </Typography>
                        </Box>
                      </Grid>
                    </Grid>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ mt: 1, display: "block", textAlign: "center" }}
                    >
                      {hoursData.entryCount} total entries
                    </Typography>
                  </>
                )}
              </CardContent>
            </Card>
          </Grid>

          {/* Right Column - Assignment Info */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ height: "100%" }}>
              <CardContent>
                <Box sx={{ display: "flex", alignItems: "center", mb: 2 }}>
                  <AssignmentIcon sx={{ mr: 1, color: "primary.main" }} />
                  <Typography variant="h6" fontWeight="bold">
                    Assignment Details
                  </Typography>
                </Box>

                <Stack spacing={1.5}>
                  <InfoRow
                    label="Assignment Level"
                    value={missionary.assignment_level || "Not set"}
                  />
                  <InfoRow label="Location" value={getLocationDisplay()} />
                  <InfoRow label="Position Title" value={missionary.title} />
                  <InfoRow label="Position Group" value={missionary.group} />
                  <InfoRow
                    label="Position Detail"
                    value={missionary.position_detail}
                  />
                  {missionary.person_type !== "volunteer" && (
                    <InfoRow label="Home Stake" value={missionary.stake_name} />
                  )}
                </Stack>

                <Divider sx={{ my: 2 }} />

                {/* Timeline */}
                <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                  <CalendarTodayIcon
                    sx={{ mr: 1, color: "primary.main", fontSize: 20 }}
                  />
                  <Typography variant="subtitle2" fontWeight="bold">
                    Mission Timeline
                  </Typography>
                </Box>

                <Stack spacing={1}>
                  <InfoRow
                    label="Start Date"
                    value={formatDate(missionary.start_date)}
                  />
                  <InfoRow
                    label="Duration"
                    value={
                      missionary.duration ? `${missionary.duration}` : null
                    }
                  />
                  <InfoRow label="Expected Release" value={getReleaseDate()} />
                  {isUpcomingView && (
                    <Box
                      sx={{
                        p: 1.5,
                        bgcolor: "warning.50",
                        borderRadius: 1,
                        border: "1px solid",
                        borderColor: "warning.200",
                        mt: 1,
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color="warning.dark"
                      >
                        {missionary.daysUntilRelease ?? getDaysLeft()} days
                        remaining
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </CardContent>
            </Card>
          </Grid>

          {/* Notes Section - Full Width */}
          {missionary.notes && (
            <Grid item xs={12}>
              <Card variant="outlined">
                <CardContent>
                  <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
                    <NoteIcon sx={{ mr: 1, color: "primary.main" }} />
                    <Typography variant="h6" fontWeight="bold">
                      Notes
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      p: 2,
                      bgcolor: "grey.50",
                      borderRadius: 1,
                      borderLeft: 3,
                      borderColor: "primary.main",
                    }}
                  >
                    <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                      {missionary.notes}
                    </Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Close
        </Button>
        {onEdit && (
          <Button
            onClick={() => onEdit(missionary)}
            variant="contained"
            startIcon={<EditIcon />}
          >
            Edit
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export { MissionaryViewDialog };
export default MissionaryViewDialog;
