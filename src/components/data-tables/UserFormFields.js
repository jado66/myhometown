import React from "react";
import {
  Box,
  TextField,
  FormControl,
  Switch,
  FormControlLabel,
  Typography,
  Grid,
  FormHelperText,
  IconButton,
  Tooltip,
} from "@mui/material";
import CommunitySelect from "./selects/CommunitySelect";
import CitySelect from "./selects/CitySelect";
import JsonViewer from "../util/debug/DebugOutput";
import { Info } from "@mui/icons-material";
import { toast } from "react-toastify";

const UserFormFields = ({
  userData,
  onChange,
  errors = {},
  isNewUser = false,
}) => {
  const handlePermissionChange = (permission) => (event) => {
    const checked = event.target.checked;
    if (permission === "administrator" && checked) {
      toast.info(
        "This user will have full access to everything on the site as a Global Administrator.",
        { autoClose: 7000 }
      );
    }
    onChange({
      ...userData,
      permissions: {
        ...userData?.permissions,
        [permission]: checked,
      },
    });
  };

  const handleCityChange = (selectedCity) => {
    let citiesArr = [];
    if (Array.isArray(selectedCity)) {
      citiesArr = selectedCity.map((city) => ({
        id: city.value,
        name: city.label,
        state: "Utah",
      }));
    } else if (selectedCity) {
      citiesArr = [
        {
          id: selectedCity.value,
          name: selectedCity.label,
          state: "Utah",
        },
      ];
    }
    onChange({
      ...userData,
      cities: citiesArr,
    });
  };

  // Store the full selected option objects for communities
  const handleCommunityChange = (selectedCommunities) => {
    onChange({
      ...userData,
      communities: selectedCommunities || [],
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <FormControl fullWidth>
        <TextField
          label="Email"
          value={userData?.email || ""}
          onChange={(e) => onChange({ ...userData, email: e.target.value })}
          error={!!errors.email}
          helperText={errors.email}
          disabled={!isNewUser}
          fullWidth
        />
      </FormControl>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <TextField
              label="First Name"
              value={userData?.first_name || ""}
              onChange={(e) =>
                onChange({ ...userData, first_name: e.target.value })
              }
              error={!!errors.first_name}
              helperText={errors.first_name}
              fullWidth
            />
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <TextField
              label="Last Name"
              value={userData?.last_name || ""}
              onChange={(e) =>
                onChange({ ...userData, last_name: e.target.value })
              }
              error={!!errors.last_name}
              helperText={errors.last_name}
              fullWidth
            />
          </FormControl>
        </Grid>
      </Grid>

      <FormControl fullWidth>
        <TextField
          label="Contact Number"
          value={userData?.contact_number || ""}
          onChange={(e) =>
            onChange({ ...userData, contact_number: e.target.value })
          }
          error={!!errors.contact_number}
          helperText={errors.contact_number}
          fullWidth
        />
      </FormControl>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Permissions
        </Typography>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={userData?.permissions?.texting || false}
                  onChange={handlePermissionChange("texting")}
                />
              }
              label="Texting"
            />
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={userData?.permissions?.dos_admin || false}
                  onChange={handlePermissionChange("dos_admin")}
                />
              }
              label="DOS Admin"
            />
            <IconButton size="small">
              <Tooltip title="Can lock and unlock projects & view Budgets">
                <Info />
              </Tooltip>
            </IconButton>
          </Grid>

          <Grid item xs={12} sm={4}>
            <FormControlLabel
              control={
                <Switch
                  checked={userData?.permissions?.administrator || false}
                  onChange={handlePermissionChange("administrator")}
                />
              }
              label="Global Administrator"
            />
          </Grid>
        </Grid>
      </Box>

      <FormControl fullWidth>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Cities
        </Typography>

        <CitySelect
          value={
            userData?.cities && userData.cities.length > 0
              ? {
                  value: userData.cities[0].id,
                  label: userData.cities[0].name,
                }
              : null
          }
          onChange={handleCityChange}
        />
        {errors.cities && (
          <FormHelperText error>{errors.cities}</FormHelperText>
        )}
      </FormControl>

      <FormControl fullWidth>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Communities
        </Typography>
        <CommunitySelect
          value={userData?.communities || []}
          onChange={handleCommunityChange}
          isMulti={true}
        />
        {errors.communities && (
          <FormHelperText error>{errors.communities}</FormHelperText>
        )}
      </FormControl>
    </Box>
  );
};

export default UserFormFields;
