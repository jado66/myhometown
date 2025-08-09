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
} from "@mui/icons-material";

interface MissionaryListViewProps {
  missionaries: any[];
  cities: any[];
  communities: any[];
  onEdit: (missionary: any) => void;
  onDelete: (missionary: any) => void;
  isUpcomingView?: boolean;
  onProfilePictureClick?: (url: string | null, name: string | null) => void;
}

export const MissionaryListView: React.FC<MissionaryListViewProps> = ({
  missionaries = [],
  cities = [],
  communities = [],
  onEdit,
  onDelete,
  isUpcomingView = false,
  onProfilePictureClick,
}) => {
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

  return (
    <>
      <TableContainer component={Paper} sx={{ mt: 2 }}>
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: "grey.50" }}>
              {isUpcomingView && <TableCell>Days Left</TableCell>}
              <TableCell>Missionary</TableCell>
              <TableCell>Contact</TableCell>
              <TableCell>Assignment</TableCell>
              <TableCell>Title/Group</TableCell>
              <TableCell>Call/Start Date</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {missionaries.map((missionary) => (
              <TableRow key={missionary.id} hover>
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
                          : "primary.light",
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
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    <Box
                      sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                    >
                      <EmailIcon
                        sx={{ fontSize: 14, color: "text.secondary" }}
                      />
                      <Typography variant="body2" noWrap>
                        {missionary.email}
                      </Typography>
                    </Box>
                    {missionary.contact_number && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <PhoneIcon
                          sx={{ fontSize: 14, color: "text.secondary" }}
                        />
                        <Typography variant="body2">
                          {missionary.contact_number}
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </TableCell>

                <TableCell>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
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
                    {missionary.title && (
                      <Typography variant="body2" fontWeight="medium">
                        {missionary.title}
                      </Typography>
                    )}
                    {missionary.group && (
                      <Typography variant="caption" color="text.secondary">
                        {missionary.group}
                      </Typography>
                    )}
                  </Box>
                </TableCell>

                <TableCell>
                  <Box
                    sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}
                  >
                    <Typography variant="body2">
                      {formatDate(missionary.start_date)}
                    </Typography>
                    {missionary.start_date &&
                      missionary.duration &&
                      getReleaseDate(missionary) && (
                        <Typography variant="caption" color="text.secondary">
                          Release: {getReleaseDate(missionary)}
                        </Typography>
                      )}
                  </Box>
                </TableCell>

                <TableCell align="right">
                  {/* Error icon button if title is missing */}
                  {!missionary.title && (
                    <Tooltip title="Missing title (required)">
                      <IconButton
                        size="small"
                        color="error"
                        tabIndex={-1}
                        sx={{ pointerEvents: "none" }}
                      >
                        <Warning />
                      </IconButton>
                    </Tooltip>
                  )}
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
            ))}
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
                        {selectedMissionary.email}
                      </Typography>
                    </Box>
                  </Grid>
                  {selectedMissionary.contact_number && (
                    <Grid item xs={12} sm={6}>
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <PhoneIcon
                          sx={{ fontSize: 16, color: "text.secondary" }}
                        />
                        <Typography variant="body2">
                          {selectedMissionary.contact_number}
                        </Typography>
                      </Box>
                    </Grid>
                  )}
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
                </Grid>
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
                  {selectedMissionary.title && (
                    <Typography variant="body2">
                      <strong>Title:</strong> {selectedMissionary.title}
                    </Typography>
                  )}
                  {selectedMissionary.stake_name && (
                    <Typography variant="body2">
                      <strong>Home Stake:</strong>{" "}
                      {selectedMissionary.stake_name}
                    </Typography>
                  )}
                </Stack>
              </Box>

              {/* Mission Timeline */}
              {(selectedMissionary.start_date ||
                selectedMissionary.duration) && (
                <Box>
                  <Typography
                    variant="subtitle1"
                    fontWeight="bold"
                    gutterBottom
                  >
                    Mission Timeline
                  </Typography>
                  <Stack spacing={1}>
                    {selectedMissionary.start_date && (
                      <Box
                        sx={{ display: "flex", alignItems: "center", gap: 0.5 }}
                      >
                        <Typography variant="body2">
                          <strong>Called:</strong>{" "}
                          {formatDate(selectedMissionary.start_date)}
                        </Typography>
                      </Box>
                    )}
                    {selectedMissionary.duration && (
                      <Typography variant="body2">
                        <strong>Duration:</strong> {selectedMissionary.duration}
                      </Typography>
                    )}
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
              )}

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
