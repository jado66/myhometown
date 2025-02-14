import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Button,
  Box,
  FormLabel,
} from "@mui/material";
import { Delete, Key } from "@mui/icons-material";
import { CityOrCommunityCell } from "./CityOrCommunityCell";
import JsonViewer from "../util/debug/DebugOutput";

const initialPermissions = {
  // administrator: false,
  // cityManagement: false,
  // communityManagement: false,
  // texting: false,
  // classManagement: false,
};

export const UserFormDialog = ({
  open,
  onClose,
  onSubmit,
  initialData = null,
  onDelete,
  onPasswordReset,
  loading = false,
}) => {
  const [formData, setFormData] = useState(initialData);
  const isEditMode = !!initialData?._id;

  useEffect(() => {
    if (open) {
      // Clone the initial data to avoid direct mutation
      let newFormData = { ...initialData };

      // Check if .name exists and split it
      if (newFormData?.name) {
        const [first_name, last_name] = newFormData.name.split(" ");
        newFormData.first_name = first_name || "";
        newFormData.last_name = last_name || "";
        delete newFormData.name;
      }

      setFormData(newFormData);
    }
  }, [open, initialData]);

  const handlePermissionChange = (permission) => {
    // Ensure we're working with valid permissions object
    const currentPermissions = formData.permissions || initialPermissions;

    let updatedPermissions = {
      ...currentPermissions,
      [permission]: !currentPermissions[permission],
    };

    // Handle administrator special case
    if (permission === "administrator" && updatedPermissions[permission]) {
      Object.keys(updatedPermissions).forEach((key) => {
        if (key !== "administrator") {
          updatedPermissions[key] = false;
        }
      });
    }

    // Handle non-administrator permissions
    if (permission !== "administrator" && updatedPermissions[permission]) {
      updatedPermissions.administrator = false;
    }

    setFormData((prevData) => ({
      ...prevData,
      permissions: updatedPermissions,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditMode ? "Edit User" : "Create User"}</DialogTitle>

      <JsonViewer data={formData} />

      <form onSubmit={handleSubmit}>
        <DialogContent>
          <TextField
            required
            fullWidth
            label="Email"
            type="email"
            margin="dense"
            value={formData?.email || ""}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
            disabled={isEditMode}
          />

          <TextField
            required
            fullWidth
            label="First Name"
            type="text"
            margin="dense"
            value={formData?.first_name || ""}
            onChange={(e) =>
              setFormData({ ...formData, first_name: e.target.value })
            }
          />
          <TextField
            required
            fullWidth
            label="Last Name"
            type="text"
            margin="dense"
            value={formData?.last_name || ""}
            onChange={(e) =>
              setFormData({ ...formData, last_name: e.target.value })
            }
          />

          <TextField
            fullWidth
            label="Contact Number"
            type="tel"
            margin="dense"
            value={formData?.contact_number || ""}
            onChange={(e) =>
              setFormData({ ...formData, contact_number: e.target.value })
            }
          />

          <FormControl component="fieldset" sx={{ mt: 2 }} fullWidth>
            <FormLabel component="legend">User Permissions</FormLabel>
            <FormGroup>
              {Object.entries({
                ...initialPermissions,
                ...formData?.permissions,
              }).map(([key, value]) => (
                <FormControlLabel
                  key={key}
                  sx={{ textTransform: "capitalize" }}
                  control={
                    <Checkbox
                      checked={value}
                      disabled={
                        key !== "administrator" &&
                        formData?.permissions?.administrator
                      }
                      onChange={() => handlePermissionChange(key)}
                    />
                  }
                  label={key.replace(/_/g, " ")}
                />
              ))}
            </FormGroup>
          </FormControl>

          {isEditMode && (
            <>
              {formData?.cities?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <FormLabel component="legend">Cities Managing</FormLabel>
                  <CityOrCommunityCell
                    params={{ value: formData.cities }}
                    type="city"
                  />
                </Box>
              )}

              {formData?.communities?.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <FormLabel component="legend">Communities Managing</FormLabel>
                  <CityOrCommunityCell
                    params={{ value: formData.communities }}
                    type="community"
                  />
                </Box>
              )}
            </>
          )}
        </DialogContent>

        <DialogActions
          sx={{
            display: "flex",
            justifyContent: isEditMode ? "space-between" : "flex-end",
          }}
        >
          {isEditMode && (
            <Box>
              <Button
                onClick={() => onDelete(formData)}
                color="error"
                disabled={loading}
                startIcon={<Delete />}
              >
                Delete User
              </Button>
              <Button
                onClick={() => onPasswordReset(formData.email)}
                color="warning"
                disabled={loading}
                startIcon={<Key />}
              >
                Reset Password
              </Button>
            </Box>
          )}
          <Box>
            <Button onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="submit" color="primary" disabled={loading}>
              {loading ? "Saving..." : isEditMode ? "Save" : "Create"}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};
