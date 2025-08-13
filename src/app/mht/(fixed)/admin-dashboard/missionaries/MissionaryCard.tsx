import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Stack,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Divider,
  Popover,
  Tooltip,
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarTodayIcon,
  MoreVert as MoreVertIcon,
  Info as InfoIcon,
  Close as CloseIcon,
  StickyNote2 as NoteIcon,
  Warning,
  Schedule as ScheduleIcon,
} from "@mui/icons-material";

interface MissionaryCardProps {
  missionary: any;
  cities: any[];
  communities: any[];
  hours?: any[]; // Add hours prop
  onEdit: (missionary: any) => void;
  onDelete: (missionary: any) => void;
  isUpcomingView?: boolean;
  onProfilePictureClick?: (url: string | null, name: string | null) => void;
}

// Helper component for icon + text combinations
const IconText: React.FC<{
  icon: React.ReactNode;
  text: string;
  variant?: "body2" | "caption";
  sx?: any;
}> = ({ icon, text, variant = "body2", sx }) => (
  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, ...sx }}>
    {React.cloneElement(icon as React.ReactElement, {
      sx: {
        fontSize: variant === "caption" ? 14 : 16,
        color: "text.secondary",
      },
    })}
    <Typography
      variant={variant}
      color={variant === "caption" ? "text.secondary" : "inherit"}
      noWrap
    >
      {text}
    </Typography>
  </Box>
);

export const MissionaryCard: React.FC<MissionaryCardProps> = ({
  missionary,
  cities,
  communities,
  hours = [], // Default to empty array
  onEdit,
  onDelete,
  isUpcomingView = false,
  onProfilePictureClick,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [detailsOpen, setDetailsOpen] = React.useState(false);
  const [noteAnchorEl, setNoteAnchorEl] = React.useState<null | HTMLElement>(
    null
  );

  // Calculate hours for this missionary
  const hoursData = React.useMemo(() => {
    console.log("Card - Hours data:", hours); // Debug log
    console.log("Card - Looking for missionary ID:", missionary.id); // Debug log

    const missionaryHours = hours.filter((h) => {
      console.log("Card - Comparing:", h.missionary_id, "with", missionary.id); // Debug log
      return h.missionary_id === missionary.id;
    });

    console.log("Card - Filtered hours for missionary:", missionaryHours); // Debug log

    // Calculate total hours
    const totalHours = missionaryHours.reduce((sum, h) => {
      const hoursValue = h.total_hours || 0;
      return sum + hoursValue;
    }, 0);

    // Calculate current month hours
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const currentMonthHours = missionaryHours
      .filter((h) => {
        if (!h.period_start_date) return false;
        const periodStart = new Date(h.period_start_date);
        return periodStart >= currentMonthStart;
      })
      .reduce((sum, h) => sum + (h.total_hours || 0), 0);

    const hasEntries = missionaryHours.length > 0;

    console.log(
      "Card - Total hours:",
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
  }, [hours, missionary.id]);

  // Utility functions
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
    if (missionary.assignment_level === "state") return "myHometown Utah";
    if (missionary.assignment_level === "city") {
      const city = cities.find(
        (c) => c._id === missionary.city_id || c.id === missionary.city_id
      );
      return city ? `${city.name}, ${city.state}` : "Unknown City";
    }
    if (missionary.assignment_level === "community") {
      const community = communities.find(
        (c) =>
          c._id === missionary.community_id || c.id === missionary.community_id
      );
      return community
        ? `${community.name} (${community.city})`
        : "Unknown Community";
    }
    return "No Assignment";
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const getDaysLeftChipColor = () => {
    const days = missionary.daysUntilRelease ?? getDaysLeft() ?? 0;
    if (days < 30) return "error";
    if (days < 60) return "warning";
    if (days < 90) return "primary";
    return "success";
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleMenuClose = () => setAnchorEl(null);
  const handleNoteOpen = (event: React.MouseEvent<HTMLElement>) =>
    setNoteAnchorEl(event.currentTarget);
  const handleNoteClose = () => setNoteAnchorEl(null);

  const fullName = `${missionary.first_name} ${missionary.last_name}`;
  const initials = `${missionary.first_name?.[0] || ""}${
    missionary.last_name?.[0] || ""
  }`;

  return (
    <>
      <Card sx={{ height: "100%", position: "relative" }}>
        <CardContent sx={{ p: 2 }}>
          {/* Header with Avatar, Name, and Actions */}
          <Stack
            direction="row"
            spacing={2}
            alignItems="flex-start"
            sx={{ mb: 2 }}
          >
            <Avatar
              src={missionary.profile_picture_url}
              alt={fullName}
              sx={{ width: 56, height: 56, bgcolor: "primary.light" }}
              onClick={() =>
                onProfilePictureClick(missionary.profile_picture_url, fullName)
              }
            >
              {!missionary.profile_picture_url && (
                <Typography variant="h6">{initials}</Typography>
              )}
            </Avatar>

            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography variant="h6" component="h3" noWrap sx={{ mb: 0.5 }}>
                {fullName}
              </Typography>

              <Stack
                direction="row"
                spacing={1}
                alignItems="center"
                flexWrap="wrap"
              >
                <Chip
                  label={missionary.assignment_level}
                  size="small"
                  variant="outlined"
                  sx={{ textTransform: "capitalize" }}
                />
                {missionary.title && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    fontWeight="medium"
                  >
                    {missionary.title}
                  </Typography>
                )}
              </Stack>

              {/* Hours Display */}
              <Box sx={{ mt: 1, display: "flex", gap: 1, flexWrap: "wrap" }}>
                <Chip
                  icon={<ScheduleIcon sx={{ fontSize: 14 }} />}
                  label={`${hoursData.totalHours}h total`}
                  size="small"
                  color={hoursData.totalHours > 0 ? "primary" : "default"}
                  variant="outlined"
                />
                <Chip
                  label={`${hoursData.currentMonthHours}h this month`}
                  size="small"
                  color={
                    hoursData.currentMonthHours > 0 ? "secondary" : "default"
                  }
                  variant="outlined"
                />
              </Box>
            </Box>

            {/* Top Right Actions */}
            <Stack direction="row" spacing={0.5} alignItems="center">
              {isUpcomingView && (
                <Chip
                  label={`${
                    missionary.daysUntilRelease ?? getDaysLeft()
                  } days left`}
                  color={getDaysLeftChipColor()}
                  size="small"
                  sx={{ mr: 1, mt: 2 }}
                />
              )}

              {/* Error icon if no hours entries */}
              {!hoursData.hasEntries && (
                <Tooltip title="No hours logged this month">
                  <IconButton size="small" color="warning">
                    <Warning color="warning" fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {/* Error icon if title is missing */}
              {!missionary.title && (
                <Tooltip title="Missing title (required)">
                  <IconButton size="small" color="error">
                    <Warning color="error" fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {/* Note Button */}
              {missionary.notes && (
                <Tooltip title="View note">
                  <IconButton
                    onClick={handleNoteOpen}
                    size="small"
                    color="primary"
                  >
                    <NoteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}

              {/* More Details Button */}
              <Tooltip title="More details">
                <IconButton onClick={() => setDetailsOpen(true)} size="small">
                  <InfoIcon fontSize="small" />
                </IconButton>
              </Tooltip>

              {/* Menu Button */}
              <Tooltip title="Edit and Delete">
                <IconButton onClick={handleMenuOpen} size="small">
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </Stack>
          </Stack>

          {/* Contact Information - Horizontal Layout */}
          <Grid container spacing={1} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <IconText
                icon={<EmailIcon />}
                text={missionary.email}
                variant="body2"
                sx={{ mb: 1 }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              {missionary.contact_number && (
                <IconText
                  icon={<PhoneIcon />}
                  text={missionary.contact_number}
                  variant="body2"
                />
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <IconText
                icon={<LocationOnIcon />}
                text={getLocationDisplay()}
                variant="body2"
              />
            </Grid>
          </Grid>

          {/* Mission Timeline */}
          <Grid container spacing={2} alignItems="center" sx={{ mb: 0.5 }}>
            {missionary.start_date && (
              <Grid item>
                <Typography variant="caption" color="text.secondary">
                  {`Called: ${formatDate(missionary.start_date)}`}
                </Typography>
              </Grid>
            )}
            {missionary.duration && (
              <Grid item>
                <Typography variant="caption" color="text.secondary">
                  Duration: {missionary.duration}
                </Typography>
              </Grid>
            )}
            {getReleaseDate() && (
              <Grid item>
                <Typography variant="caption" color="text.secondary">
                  Release: {getReleaseDate()}
                </Typography>
              </Grid>
            )}
          </Grid>

          {/* Actions Menu */}
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={() => {
                onEdit(missionary);
                handleMenuClose();
              }}
            >
              <EditIcon sx={{ mr: 1, fontSize: 20 }} />
              Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                onDelete(missionary);
                handleMenuClose();
              }}
              sx={{ color: "error.main" }}
            >
              <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
              Delete
            </MenuItem>
          </Menu>

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
            <Typography variant="body2">{missionary.notes}</Typography>
          </Popover>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog
        open={detailsOpen}
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
          <Typography variant="h6">{fullName}</Typography>
          <IconButton onClick={() => setDetailsOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <Stack spacing={3}>
            {/* Basic Info */}
            <Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                Basic Information
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <IconText icon={<EmailIcon />} text={missionary.email} />
                </Grid>
                {missionary.contact_number && (
                  <Grid item xs={12} sm={6}>
                    <IconText
                      icon={<PhoneIcon />}
                      text={missionary.contact_number}
                    />
                  </Grid>
                )}
                <Grid item xs={12}>
                  <IconText
                    icon={<LocationOnIcon />}
                    text={getLocationDisplay()}
                  />
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
                    {hoursData.totalHours} total hours recorded
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  <ScheduleIcon
                    sx={{ fontSize: 16, color: "text.secondary" }}
                  />
                  <Typography variant="body2">
                    {hoursData.currentMonthHours} hours this month
                  </Typography>
                </Box>
                <Typography variant="caption" color="text.secondary">
                  {hoursData.entryCount} total entries
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
                  <strong>Level:</strong> {missionary.assignment_level}
                </Typography>
                {missionary.title && (
                  <Typography variant="body2">
                    <strong>Title:</strong> {missionary.title}
                  </Typography>
                )}
                {missionary.stake_name && (
                  <Typography variant="body2">
                    <strong>Home Stake:</strong> {missionary.stake_name}
                  </Typography>
                )}
              </Stack>
            </Box>

            {/* Mission Timeline */}
            {(missionary.start_date || missionary.duration) && (
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                  Mission Timeline
                </Typography>
                <Stack spacing={1}>
                  {missionary.start_date && (
                    <IconText
                      icon={<CalendarTodayIcon />}
                      text={`Called: ${formatDate(missionary.start_date)}`}
                    />
                  )}
                  {missionary.duration && (
                    <Typography variant="body2">
                      <strong>Duration:</strong> {missionary.duration}
                    </Typography>
                  )}
                  {getReleaseDate() && (
                    <Typography variant="body2">
                      <strong>Expected Release:</strong> {getReleaseDate()}
                    </Typography>
                  )}
                  {isUpcomingView && (
                    <Typography variant="body2">
                      <strong>Days Remaining:</strong>{" "}
                      {missionary.daysUntilRelease ?? getDaysLeft()}
                    </Typography>
                  )}
                </Stack>
              </Box>
            )}

            {/* Notes */}
            {missionary.notes && (
              <Box>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
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
                  <Typography variant="body2">{missionary.notes}</Typography>
                </Box>
              </Box>
            )}
          </Stack>
        </DialogContent>

        <DialogActions>
          <Button onClick={() => setDetailsOpen(false)}>Close</Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            onClick={() => onEdit(missionary)}
          >
            Edit
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
