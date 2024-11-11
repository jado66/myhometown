import {
  Dialog,
  DialogTitle,
  TextField,
  DialogContent,
  DialogActions,
  FormLabel,
  Button,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Box,
} from "@mui/material";
import React, { useState, useEffect } from "react";
import { CityOrCommunityCell } from "./CityOrCommunityCell";
import { Delete, Key } from "@mui/icons-material";
import { toast } from "react-toastify";

const initialState = {
  id: "",
  name: "",
  email: "",
  contactNumber: "",
  permissions: {
    administrator: false,
    cityManagement: false,
    communityManagement: false,
    texting: false,
    // emailingEnabled: false, // Commented out for now
    classManagement: false,
  },
  cities: [],
  communities: [],
};

const AddEditUserDialog = ({
  open,
  handleClose,
  onSubmitForm,
  initialUserState,
}) => {
  const [user, setUser] = useState(initialUserState || initialState);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSendingReset, setIsSendingReset] = useState(false);

  const handleDelete = async () => {
    if (!user._id) return;

    try {
      setIsDeleting(true);
      const response = await fetch(`/api/database/users/${user._id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to delete user");
      }

      toast.success("User deleted successfully");
      handleClose();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(error.message || "Failed to delete user");
    } finally {
      setIsDeleting(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!user._id) return;

    try {
      setIsSendingReset(true);
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: user._id }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to send password reset");
      }

      toast.success("Password reset email sent successfully");
    } catch (error) {
      console.error("Error sending password reset:", error);
      toast.error(error.message || "Failed to send password reset email");
    } finally {
      setIsSendingReset(false);
    }
  };

  useEffect(() => {
    if (open) {
      // Ensure initialUserState has permissions object with default values
      const userState = initialUserState
        ? {
            ...initialUserState,
            permissions: {
              ...initialState.permissions,
              ...(initialUserState.permissions || {}),
            },
          }
        : initialState;
      setUser(userState);
    }
  }, [open, initialUserState]);

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmitForm(user);
    setUser(initialState);
    handleClose();
  };

  const handlePermissionChange = (permission) => {
    // Create a copy of current permissions
    let updatedPermissions = {
      ...user.permissions,
      [permission]: !user.permissions[permission],
    };

    // If the changing permission is 'administrator' and it's being set to true, set all others to false
    if (permission === "administrator" && updatedPermissions[permission]) {
      Object.keys(updatedPermissions).forEach((key) => {
        if (key !== "administrator") {
          updatedPermissions[key] = false;
        }
      });
    }

    // If any other permission is being set to true, ensure 'administrator' is false
    if (permission !== "administrator" && updatedPermissions[permission]) {
      updatedPermissions["administrator"] = false;
    }

    // Update the user object with new permissions
    setUser({
      ...user,
      permissions: updatedPermissions,
    });
  };

  const title = initialUserState ? "Edit User" : "Add User";

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            margin="dense"
            id="email"
            label="Email (Readonly)"
            type="email"
            fullWidth
            value={user.email}
            InputProps={{
              readOnly: true,
            }}
            disabled
          />

          <TextField
            autoFocus
            margin="dense"
            id="name"
            label="Name"
            type="text"
            fullWidth
            value={user.name}
            onChange={(e) => setUser({ ...user, name: e.target.value })}
          />

          <TextField
            margin="dense"
            id="contactNumber"
            label="Contact Number"
            type="phone"
            fullWidth
            value={user.contactNumber}
            onChange={(e) =>
              setUser({ ...user, contactNumber: e.target.value })
            }
          />

          <FormControl component="fieldset" sx={{ mt: 2 }} fullWidth>
            <FormLabel component="legend">User Permissions</FormLabel>
            <FormGroup row>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={user.permissions?.administrator || false}
                    onChange={() => handlePermissionChange("administrator")}
                  />
                }
                label="Administrator"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    disabled={user.permissions?.administrator}
                    checked={user.permissions?.cityManagement || false}
                    onChange={() => handlePermissionChange("cityManagement")}
                  />
                }
                label="City Management"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    disabled={user.permissions?.administrator}
                    checked={user.permissions?.communityManagement || false}
                    onChange={() =>
                      handlePermissionChange("communityManagement")
                    }
                  />
                }
                label="Community Management"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    disabled={user.permissions?.administrator}
                    checked={user.permissions?.texting || false}
                    onChange={() => handlePermissionChange("texting")}
                  />
                }
                label="Texting"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    disabled={user.permissions?.administrator}
                    checked={user.permissions?.classManagement || false}
                    onChange={() => handlePermissionChange("classManagement")}
                  />
                }
                label="Class Management"
              />
            </FormGroup>
          </FormControl>

          {user.cities && user.cities.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <FormLabel component="legend" sx={{ mb: 1 }}>
                Cities Managing
              </FormLabel>
              <CityOrCommunityCell
                params={{ value: user.cities }}
                type="city"
              />
            </Box>
          )}

          {user.communities && user.communities.length > 0 && (
            <Box sx={{ mt: 2 }}>
              <FormLabel component="legend">Communities Managing</FormLabel>
              <CityOrCommunityCell
                params={{ value: user.communities }}
                type="community"
              />
            </Box>
          )}
        </DialogContent>
        <DialogActions
          sx={{ display: "flex", justifyContent: "space-between" }}
        >
          {initialUserState && (
            <Box>
              <Button
                onClick={handleDelete}
                color="error"
                disabled={isDeleting}
                startIcon={<Delete />}
              >
                {isDeleting ? "Deleting User..." : "Delete User"}
              </Button>
              <Button
                onClick={handlePasswordReset}
                color="warning"
                disabled={isSendingReset}
                startIcon={<Key />}
              >
                {isSendingReset ? "Sending..." : "Reset Password"}
              </Button>
            </Box>
          )}
          <Box>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button type="submit" color="primary">
              {initialUserState ? "Save" : "Add"}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default AddEditUserDialog;
