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
} from "@mui/material";
import CommunitySelect from "./selects/CommunitySelect";
import CitySelect from "./selects/CitySelect";
import JsonViewer from "../util/debug/DebugOutput";

const UserFormFields = ({
  userData,
  onChange,
  errors = {},
  isNewUser = false,
}) => {
  const handlePermissionChange = (permission) => (event) => {
    onChange({
      ...userData,
      permissions: {
        ...userData?.permissions,
        [permission]: event.target.checked,
      },
    });
  };

  const handleCityChange = (selectedCities) => {
    onChange({
      ...userData,
      cities: selectedCities.map((city) => city.value),
    });
  };

  const handleCommunityChange = (selectedCommunities) => {
    onChange({
      ...userData,
      communities: selectedCommunities.map((community) => community.value),
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

      {isNewUser && (
        <FormControl fullWidth>
          <TextField
            label="Password"
            type="password"
            value={userData?.password || ""}
            onChange={(e) =>
              onChange({ ...userData, password: e.target.value })
            }
            error={!!errors.password}
            helperText={errors.password}
            fullWidth
          />
        </FormControl>
      )}

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
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={userData?.permissions?.administrator || false}
                  onChange={handlePermissionChange("administrator")}
                />
              }
              label="Administrator"
            />
          </Grid>

          <Grid item xs={12} sm={6}>
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
        </Grid>
      </Box>

      <FormControl fullWidth>
        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Cities
        </Typography>
        <CitySelect
          value={
            userData?.cities_details?.map((city) => ({
              value: city.id,
              label: city.name,
            })) || []
          }
          onChange={handleCityChange}
          isMulti={true}
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
          value={
            userData?.communities_details?.map((community) => ({
              value: community.id,
              label: community.name,
            })) || []
          }
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
