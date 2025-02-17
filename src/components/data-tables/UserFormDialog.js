import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  FormLabel,
} from "@mui/material";
import { Delete, Key } from "@mui/icons-material";
import JsonViewer from "../util/debug/DebugOutput";
import UserFormFields from "./UserFormFields";

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

  const handlePermissionChange = (permission) => (event) => {
    onChange({
      ...userData,
      permissions: {
        administrator:
          permission === "administrator"
            ? event.target.checked
            : userData?.permissions?.administrator || false,
        texting:
          permission === "texting"
            ? event.target.checked
            : userData?.permissions?.texting || false,
      },
    });
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
          <UserFormFields userData={formData} onChange={setFormData} />
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
