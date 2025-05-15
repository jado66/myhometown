import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Button,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  IconButton,
  Box,
} from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";
import Creatable from "react-select/creatable";

const ContactDialog = ({
  open,
  onClose,
  onSave,
  contact = null,
  userId,
  userCommunities = [],
  userCities = [],
  groupsByOwner = {}, // Updated to use the structured groupsByOwner
  user,
  title = "Add Contact",
}) => {
  // Initial form state
  const initialFormState = {
    first_name: "",
    last_name: "",
    middle_name: "",
    email: "",
    phone: "",
    owner_type: "user",
    owner_id: userId,
    groups: [],
  };

  // State for the form
  const [formData, setFormData] = useState(initialFormState);
  const [errors, setErrors] = useState({});

  // State to track available groups based on current owner
  const [availableGroups, setAvailableGroups] = useState([]);

  // Effect to reset form when dialog opens/closes or contact changes
  useEffect(() => {
    if (open) {
      if (contact) {
        // If editing an existing contact
        setFormData({
          ...contact,
          // Ensure groups is in the right format
          groups: formatGroupsForSelect(contact.groups || []),
        });

        // Set available groups based on contact's owner
        updateAvailableGroups(contact.owner_type, contact.owner_id);
      } else {
        // If adding a new contact
        setFormData(initialFormState);
        // Set available groups for user by default
        updateAvailableGroups("user", userId);
      }
      setErrors({});
    }
  }, [open, contact, userId, groupsByOwner]);

  // Update available groups when owner changes
  useEffect(() => {
    if (open) {
      updateAvailableGroups(formData.owner_type, formData.owner_id);
    }
  }, [formData.owner_type, formData.owner_id, groupsByOwner]);

  // Function to update available groups based on owner type and ID
  const updateAvailableGroups = (ownerType, ownerId) => {
    let groups = [];

    if (ownerType === "user") {
      groups = groupsByOwner.user || [];
    } else if (ownerType === "community") {
      groups =
        (groupsByOwner.communities && groupsByOwner.communities[ownerId]) || [];
    } else if (ownerType === "city") {
      groups = (groupsByOwner.cities && groupsByOwner.cities[ownerId]) || [];
    }

    setAvailableGroups(groups);
  };

  // Validate the form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.first_name.trim()) {
      newErrors.first_name = "First name is required";
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = "Last name is required";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Phone number is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  // Handle owner type and id changes
  const handleOwnerChange = (e) => {
    const { name, value } = e.target;

    if (name === "owner_type") {
      // When owner type changes, reset owner id
      let defaultOwnerId = userId;

      if (value === "community" && userCommunities.length > 0) {
        defaultOwnerId = userCommunities[0].id;
      } else if (value === "city" && userCities.length > 0) {
        defaultOwnerId = userCities[0].id;
      }

      // When owner changes, reset groups to avoid mixing groups from different owners
      setFormData((prev) => ({
        ...prev,
        owner_type: value,
        owner_id: defaultOwnerId,
        groups: [], // Reset groups when owner changes
      }));
    } else if (name === "owner_id") {
      // When owner ID changes (within the same owner type), reset groups
      setFormData((prev) => ({
        ...prev,
        owner_id: value,
        groups: [], // Reset groups when owner ID changes
      }));
    }
  };

  // Handle groups change
  const handleGroupChange = (selectedGroups) => {
    const stringGroups = formatGroupsForSave(selectedGroups || []);
    setFormData((prev) => ({
      ...prev,
      groups: stringGroups,
    }));
  };

  // Handle save button click
  const handleSave = () => {
    if (validateForm()) {
      // Format data for saving if needed
      const dataToSave = {
        ...formData,
      };

      onSave(dataToSave);
    }
  };

  // Convert string groups to format needed for react-select
  const formatGroupsForSelect = (groups) => {
    // Handle null or undefined case
    if (!groups) return [];

    // Handle empty array
    if (Array.isArray(groups) && groups.length === 0) return [];

    // If groups is a string (JSON string), try to parse it
    if (typeof groups === "string") {
      try {
        const parsedGroups = JSON.parse(groups);
        if (Array.isArray(parsedGroups)) {
          return parsedGroups.map((group) => {
            // If already in object format with value/label
            if (typeof group === "object" && group !== null && group.value) {
              return group;
            }
            // If it's a string
            return { label: group, value: group };
          });
        }
      } catch (e) {
        console.error("Error parsing groups JSON", e);
        return [];
      }
    }

    // If groups is already an array
    if (Array.isArray(groups)) {
      return groups.map((group) => {
        // If already in object format
        if (typeof group === "object" && group !== null && group.value) {
          return group;
        }
        // If it's a string
        return { label: group, value: group };
      });
    }

    return [];
  };

  // Convert react-select format back to string array
  const formatGroupsForSave = (groupObjects) => {
    if (!groupObjects) return [];
    if (!Array.isArray(groupObjects)) return [];

    return groupObjects.map((group) => {
      // If group is already a string
      if (typeof group === "string") {
        return group;
      }
      // If group is an object with value property
      if (typeof group === "object" && group !== null && group.value) {
        return group.value;
      }
      // Fallback
      return String(group);
    });
  };

  // Styles for react-select
  const selectStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: "56px",
      fontSize: "1rem",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  // Custom components for react-select
  const selectComponents = {
    DropdownIndicator: () => null,
    IndicatorSeparator: () => null,
  };

  // Helper to get available owner options
  const getOwnerOptions = () => {
    if (formData.owner_type === "user") {
      return (
        <MenuItem value={userId}>
          {user.isAdmin ? "Personal Contacts" : "Unassigned Contacts"}
        </MenuItem>
      );
    } else if (formData.owner_type === "community") {
      return userCommunities.map((community) => (
        <MenuItem key={community.id} value={community.id}>
          {community.name} Community
        </MenuItem>
      ));
    } else if (formData.owner_type === "city") {
      return userCities.map((city) => (
        <MenuItem key={city.id} value={city.id}>
          {city.name} City
        </MenuItem>
      ));
    }
    return null;
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          {title}
          <IconButton
            edge="end"
            color="inherit"
            onClick={onClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        <Grid container spacing={2}>
          {/* Name fields */}
          <Grid item xs={12} sm={4}>
            <TextField
              autoFocus
              name="first_name"
              label="First Name"
              fullWidth
              value={formData.first_name || ""}
              onChange={handleChange}
              error={!!errors.first_name}
              helperText={errors.first_name}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="middle_name"
              label="Middle Name"
              fullWidth
              value={formData.middle_name || ""}
              onChange={handleChange}
              margin="normal"
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              name="last_name"
              label="Last Name"
              fullWidth
              value={formData.last_name || ""}
              onChange={handleChange}
              error={!!errors.last_name}
              helperText={errors.last_name}
              margin="normal"
              required
            />
          </Grid>

          {/* Contact information */}
          <Grid item xs={12} sm={6}>
            <TextField
              name="phone"
              label="Phone"
              fullWidth
              value={formData.phone || ""}
              onChange={handleChange}
              error={!!errors.phone}
              helperText={errors.phone}
              margin="normal"
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="email"
              label="Email"
              fullWidth
              value={formData.email || ""}
              onChange={handleChange}
              margin="normal"
              type="email"
            />
          </Grid>

          {/* Owner selection */}
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth margin="normal">
              <InputLabel>Owner Type</InputLabel>
              <Select
                name="owner_type"
                value={formData.owner_type}
                onChange={handleOwnerChange}
                label="Owner Type"
              >
                <MenuItem value="user">
                  {user.isAdmin ? "Personal" : "Unassigned"}
                </MenuItem>
                {userCommunities?.length && userCommunities.length > 0 && (
                  <MenuItem value="community">Community</MenuItem>
                )}
                {userCities?.length && userCities?.length > 0 && (
                  <MenuItem value="city">City</MenuItem>
                )}
              </Select>
            </FormControl>
          </Grid>
          {formData.owner_type !== "user" && (
            <>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth margin="normal">
                  <InputLabel>Owner</InputLabel>
                  <Select
                    name="owner_id"
                    value={formData.owner_id}
                    onChange={handleOwnerChange}
                    label="Owner"
                  >
                    {getOwnerOptions()}
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}

          {/* Groups selection - Updated to use owner-specific groups */}
          <Grid item xs={12}>
            <FormControl fullWidth margin="normal">
              <FormHelperText>
                Groups for{" "}
                {formData.owner_type === "user"
                  ? user.isAdmin
                    ? "Personal Contacts"
                    : "Unassigned Contacts"
                  : formData.owner_type === "community"
                  ? userCommunities.find((c) => c.id === formData.owner_id)
                      ?.name + " Community"
                  : userCities.find((c) => c.id === formData.owner_id)?.name +
                    " City"}
              </FormHelperText>
              <Creatable
                isMulti
                value={formatGroupsForSelect(formData.groups || [])}
                options={formatGroupsForSelect(availableGroups || [])}
                onChange={handleGroupChange}
                styles={selectStyles}
                components={selectComponents}
                menuPortalTarget={document.body}
                noOptionsMessage={() => "Type to create new group"}
                menuPosition="fixed"
                placeholder="Select or create groups"
              />
            </FormControl>
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={handleSave} color="primary" variant="contained">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ContactDialog;
