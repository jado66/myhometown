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
} from "@mui/material";
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationOnIcon,
  CalendarToday as CalendarTodayIcon,
  Person as PersonIcon,
  MoreVert as MoreVertIcon,
} from "@mui/icons-material";

interface MissionaryCardProps {
  missionary: any;
  cities: any[];
  communities: any[];
  onEdit: (missionary: any) => void;
  onDelete: (missionary: any) => void;
}

export const MissionaryCard: React.FC<MissionaryCardProps> = ({
  missionary,
  cities,
  communities,
  onEdit,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const getLocationDisplay = () => {
    if (missionary.assignment_level === "state") {
      return "Utah State";
    } else if (missionary.assignment_level === "city") {
      const city = cities.find(
        (c) => c._id === missionary.city_id || c.id === missionary.city_id
      );
      return city ? `${city.name}, ${city.state}` : "Unknown City";
    } else if (missionary.assignment_level === "community") {
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

  const getStatusColor = () => {
    return missionary.assignment_status === "active" ? "success" : "default";
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
    <Card sx={{ height: "100%", position: "relative" }}>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            {/* Profile Picture Avatar */}
            <Avatar
              src={missionary.profile_picture_url}
              alt={`${missionary.first_name} ${missionary.last_name}`}
              sx={{
                width: 60,
                height: 60,
                bgcolor: missionary.profile_picture_url
                  ? "transparent"
                  : "primary.light",
              }}
            >
              {!missionary.profile_picture_url && (
                <Typography variant="h6">
                  {missionary.first_name?.[0]}
                  {missionary.last_name?.[0]}
                </Typography>
              )}
            </Avatar>

            <Box>
              <Typography variant="h6" component="h3" gutterBottom>
                {missionary.first_name} {missionary.last_name}
              </Typography>
              <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                <Chip
                  label={missionary.assignment_status}
                  size="small"
                  color={getStatusColor()}
                />
                <Chip
                  label={missionary.assignment_level}
                  size="small"
                  variant="outlined"
                />
                {missionary.gender && (
                  <Chip
                    label={missionary.gender === "male" ? "M" : "F"}
                    size="small"
                    variant="outlined"
                  />
                )}
              </Box>
            </Box>
          </Box>

          <IconButton onClick={handleMenuOpen} size="small">
            <MoreVertIcon />
          </IconButton>
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
              <EditIcon sx={{ mr: 1, fontSize: 20 }} /> Edit
            </MenuItem>
            <MenuItem
              onClick={() => {
                onDelete(missionary);
                handleMenuClose();
              }}
              sx={{ color: "error.main" }}
            >
              <DeleteIcon sx={{ mr: 1, fontSize: 20 }} /> Delete
            </MenuItem>
          </Menu>
        </Box>

        {/* Title and Group */}
        {(missionary.title || missionary.group) && (
          <Box sx={{ mb: 2 }}>
            {missionary.title && (
              <Typography variant="subtitle1" fontWeight="bold">
                {missionary.title}
              </Typography>
            )}
            {missionary.group && (
              <Typography variant="body2" color="text.secondary">
                {missionary.group}
              </Typography>
            )}
          </Box>
        )}

        {/* Contact Information */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mb: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <EmailIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="body2">{missionary.email}</Typography>
          </Box>
          {missionary.contact_number && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <PhoneIcon sx={{ fontSize: 18, color: "text.secondary" }} />
              <Typography variant="body2">
                {missionary.contact_number}
              </Typography>
            </Box>
          )}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <LocationOnIcon sx={{ fontSize: 18, color: "text.secondary" }} />
            <Typography variant="body2">{getLocationDisplay()}</Typography>
          </Box>
        </Box>

        {/* Assignment Details */}
        {missionary.stake_name && (
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Home Stake: {missionary.stake_name}
          </Typography>
        )}

        {/* Dates */}
        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
          {missionary.call_date && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              <CalendarTodayIcon
                sx={{ fontSize: 16, color: "text.secondary" }}
              />
              <Typography variant="caption" color="text.secondary">
                Called: {formatDate(missionary.call_date)}
              </Typography>
            </Box>
          )}
          {missionary.duration && (
            <Typography variant="caption" color="text.secondary">
              Duration: {missionary.duration}
            </Typography>
          )}
        </Box>

        {/* Notes */}
        {missionary.notes && (
          <Box
            sx={{
              mt: 2,
              p: 1,
              bgcolor: "grey.50",
              borderRadius: 1,
              borderLeft: "3px solid",
              borderColor: "primary.main",
            }}
          >
            <Typography variant="caption" color="text.secondary">
              {missionary.notes}
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};
