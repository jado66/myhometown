import React, { useState } from "react";
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Chip,
  Box,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Badge,
} from "@mui/material";
import {
  MoreVert as MoreVertIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationCity as LocationCityIcon,
  Business as BusinessIcon,
  Group as GroupIcon,
  CalendarToday as CalendarIcon,
} from "@mui/icons-material";

const MissionaryCard = ({
  missionary,
  cities,
  communities,
  onEdit,
  onDelete,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEdit = () => {
    onEdit(missionary);
    handleMenuClose();
  };

  const handleDelete = () => {
    onDelete(missionary);
    handleMenuClose();
  };

  const getLocationName = () => {
    if (missionary.assignment_level === "state") return "Utah State";
    if (missionary.city_id) {
      const city = cities.find((c) => c.id === missionary.city_id);
      return city ? `${city.name}, ${city.state}` : "Unassigned";
    }
    if (missionary.community_id) {
      const community = communities.find(
        (c) => c.id === missionary.community_id
      );
      return community ? community.name : "Unassigned";
    }
    return "Unassigned";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "error";
      case "unassigned":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusBadgeColor = (status) => {
    switch (status) {
      case "active":
        return "#4caf50";
      case "inactive":
        return "#f44336";
      case "unassigned":
        return "#ff9800";
      default:
        return "#9e9e9e";
    }
  };

  const getLocationIcon = () => {
    switch (missionary.assignment_level) {
      case "state":
        return <BusinessIcon fontSize="small" />;
      case "city":
        return <LocationCityIcon fontSize="small" />;
      case "community":
        return <GroupIcon fontSize="small" />;
      default:
        return <LocationCityIcon fontSize="small" />;
    }
  };

  return (
    <Card sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <CardContent sx={{ flex: 1 }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            mb: 2,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Badge
              overlap="circular"
              anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
              badgeContent={
                <Box
                  sx={{
                    width: 12,
                    height: 12,
                    borderRadius: "50%",
                    backgroundColor: getStatusBadgeColor(
                      missionary.assignment_status
                    ),
                    border: "2px solid white",
                  }}
                />
              }
            >
              <Avatar
                src={
                  missionary.profile_picture_url ||
                  `https://ui-avatars.com/api/?name=${missionary.first_name}+${missionary.last_name}&background=3B82F6&color=fff`
                }
                alt={`${missionary.first_name} ${missionary.last_name}`}
                sx={{ width: 64, height: 64 }}
              />
            </Badge>
            <Box>
              <Typography variant="h6" component="h3">
                {missionary.first_name} {missionary.last_name}
              </Typography>
              <Box
                sx={{ display: "flex", alignItems: "center", gap: 1, mt: 0.5 }}
              >
                <EmailIcon fontSize="small" color="action" />
                <Typography variant="body2" color="text.secondary">
                  {missionary.email}
                </Typography>
              </Box>
              {missionary.contact_number && (
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mt: 0.5,
                  }}
                >
                  <PhoneIcon fontSize="small" color="action" />
                  <Typography variant="body2" color="text.secondary">
                    {missionary.contact_number}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
          <IconButton onClick={handleMenuClick} size="small" sx={{ ml: 1 }}>
            <MoreVertIcon />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={open}
            onClose={handleMenuClose}
            PaperProps={{
              elevation: 3,
              sx: {
                mt: 1,
                minWidth: 160,
              },
            }}
          >
            <MenuItem onClick={handleEdit}>
              <ListItemIcon>
                <EditIcon fontSize="small" />
              </ListItemIcon>
              <ListItemText>Edit</ListItemText>
            </MenuItem>
            <MenuItem onClick={handleDelete} sx={{ color: "error.main" }}>
              <ListItemIcon>
                <DeleteIcon fontSize="small" sx={{ color: "error.main" }} />
              </ListItemIcon>
              <ListItemText>Delete</ListItemText>
            </MenuItem>
          </Menu>
        </Box>

        {/* Position & Role */}
        <Box sx={{ mb: 2 }}>
          <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1 }}>
            Group & Title:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            <Chip
              label={missionary.group || "No Group"}
              color="primary"
              variant="outlined"
              size="small"
            />
            <Chip
              label={missionary.title || "No Title"}
              color="secondary"
              variant="outlined"
              size="small"
            />
          </Box>
        </Box>

        {/* Assignment */}
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography variant="subtitle2" fontWeight="bold">
              Assignment:
            </Typography>
            <Chip
              label={missionary.assignment_status}
              color={getStatusColor(missionary.assignment_status)}
              size="small"
            />
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            {getLocationIcon()}
            <Typography variant="body2" color="text.secondary">
              {getLocationName()}
            </Typography>
          </Box>
        </Box>

        {/* Service Info */}
        {missionary.start_date && (
          <Box sx={{ mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarIcon fontSize="small" color="action" />
              <Typography variant="body2" color="text.secondary">
                Started: {new Date(missionary.start_date).toLocaleDateString()}
              </Typography>
            </Box>
          </Box>
        )}

        {/* Notes */}
        {missionary.notes && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: "divider" }}>
            <Typography
              variant="body2"
              color="text.secondary"
              fontStyle="italic"
            >
              "{missionary.notes}"
            </Typography>
          </Box>
        )}
      </CardContent>
    </Card>
  );
};

export { MissionaryCard };
