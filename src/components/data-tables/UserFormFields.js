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
import Select from "react-select";
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
  // Define all available permissions
  const permissionOptions = [
    {
      value: "texting",
      label: "Texting",
      description: null,
    },
    {
      value: "dos_admin",
      label: "DOS Admin",
      description:
        "Can lock and unlock projects, view budgets, and bypass authentication requirements for DOS projects.",
    },
    {
      value: "content_development",
      label: "Content Development",
      description:
        "Can create and edit content on the site for their assigned cities and communities.",
    },
    {
      value: "missionary_volunteer_management",
      label: "Missionary & Volunteer Management",
      description:
        "Can manage missionary and volunteer hours, view reports, and manage related settings for their assigned cities and communities.",
    },
    {
      value: "classes_admin",
      label: "Classes Admin",
      description:
        "Can manage classes, view reports, and manage related settings for their assigned cities and communities.",
    },
    {
      value: "administrator",
      label: "Global Administrator",
      description:
        "This user will have full access to everything on the site as a Global Administrator.",
    },
  ];

  const handlePermissionChange = (selectedPermissions) => {
    // Convert array of permission objects to permissions object
    const permissionsObj = {};

    if (selectedPermissions && Array.isArray(selectedPermissions)) {
      selectedPermissions.forEach((perm) => {
        permissionsObj[perm.value] = true;
      });

      // Show toast for administrator permission
      if (selectedPermissions.some((p) => p.value === "administrator")) {
        const wasAlreadyAdmin = userData?.permissions?.administrator;
        if (!wasAlreadyAdmin) {
          toast.info(
            "This user will have full access to everything on the site as a Global Administrator.",
            { autoClose: 7000 }
          );
        }
      }
    }

    onChange({
      ...userData,
      permissions: permissionsObj,
    });
  };

  // Convert current permissions object to array of selected options
  const selectedPermissions = permissionOptions.filter(
    (option) => userData?.permissions?.[option.value] === true
  );

  // Handle Select All functionality
  const handleSelectAll = () => {
    const allPermissions = {};
    permissionOptions.forEach((perm) => {
      allPermissions[perm.value] = true;
    });
    onChange({
      ...userData,
      permissions: allPermissions,
    });
    toast.info(
      "All permissions granted, including Global Administrator access.",
      { autoClose: 5000 }
    );
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

  // Store only the selected community IDs for communities
  const handleCommunityChange = (selectedCommunities) => {
    // selectedCommunities is an array of option objects or IDs
    let ids = [];
    if (Array.isArray(selectedCommunities)) {
      ids = selectedCommunities.map((c) =>
        typeof c === "object" ? c.value : c
      );
    }
    onChange({
      ...userData,
      communities: ids,
    });
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {!isNewUser && userData?.last_sign_in_at && (
        <Box
          sx={{
            p: 2,
            bgcolor: "background.default",
            borderRadius: 1,
            border: 1,
            borderColor: "divider",
          }}
        >
          <Typography variant="caption" color="text.secondary">
            Last Login
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {new Date(userData.last_sign_in_at).toLocaleString()}
          </Typography>
        </Box>
      )}

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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 1,
          }}
        >
          <Typography variant="h6">Permissions</Typography>
          <Typography
            variant="body2"
            sx={{
              color: "primary.main",
              cursor: "pointer",
              textDecoration: "underline",
              "&:hover": {
                color: "primary.dark",
              },
            }}
            onClick={handleSelectAll}
          >
            Select All
          </Typography>
        </Box>

        <Select
          closeMenuOnSelect={false}
          options={permissionOptions}
          value={selectedPermissions}
          onChange={handlePermissionChange}
          placeholder="Select permissions..."
          isMulti={true}
          className="basic-multi-select"
          classNamePrefix="select"
          isClearable={true}
          isSearchable
          styles={{
            menu: (provided) => ({
              ...provided,
              zIndex: 9999,
            }),
          }}
        />

        {selectedPermissions.length > 0 && (
          <Box
            sx={{ mt: 1, display: "flex", flexDirection: "column", gap: 0.5 }}
          >
            {selectedPermissions.map((perm) =>
              perm.description ? (
                <Box
                  key={perm.value}
                  sx={{ display: "flex", alignItems: "flex-start", gap: 0.5 }}
                >
                  <Info sx={{ fontSize: 16, color: "info.main", mt: 0.25 }} />
                  <Typography variant="caption" color="text.secondary">
                    <strong>{perm.label}:</strong> {perm.description}
                  </Typography>
                </Box>
              ) : null
            )}
          </Box>
        )}
        {errors.permissions && (
          <FormHelperText error>{errors.permissions}</FormHelperText>
        )}
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
