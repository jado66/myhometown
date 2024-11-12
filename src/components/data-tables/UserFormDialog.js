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
        const [firstName, lastName] = newFormData.name.split(" ");
        newFormData.firstName = firstName || "";
        newFormData.lastName = lastName || "";
        delete newFormData.name;
      }

      setFormData(newFormData);
    }
  }, [open, initialData]);

  const handlePermissionChange = (permission) => {
    let updatedPermissions = {
      ...formData.permissions,
      [permission]: !formData.permissions[permission],
    };

    if (permission === "administrator" && updatedPermissions[permission]) {
      Object.keys(updatedPermissions).forEach((key) => {
        if (key !== "administrator") {
          updatedPermissions[key] = false;
        }
      });
    }

    if (permission !== "administrator" && updatedPermissions[permission]) {
      updatedPermissions["administrator"] = false;
    }

    setFormData({
      ...formData,
      permissions: updatedPermissions,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEditMode ? "Edit User" : "Create User"}</DialogTitle>
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
            value={formData?.firstName || ""}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
          />
          <TextField
            required
            fullWidth
            label="Last Name"
            type="text"
            margin="dense"
            value={formData?.lastName || ""}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
          />

          <TextField
            fullWidth
            label="Contact Number"
            type="tel"
            margin="dense"
            value={formData?.contactNumber || ""}
            onChange={(e) =>
              setFormData({ ...formData, contactNumber: e.target.value })
            }
          />

          <FormControl component="fieldset" sx={{ mt: 2 }} fullWidth>
            <FormLabel component="legend">User Permissions</FormLabel>
            <FormGroup>
              {Object.entries(formData?.permissions || {}).map(
                ([key, value]) => (
                  <FormControlLabel
                    key={key}
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
                    label={
                      key.charAt(0).toUpperCase() +
                      key.slice(1).replace(/([A-Z])/g, " $1")
                    }
                  />
                )
              )}
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
