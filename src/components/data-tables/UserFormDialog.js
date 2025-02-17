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
import { supabase } from "@/util/supabase";

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
  const isEditMode = !!initialData?.id;

  useEffect(() => {
    if (open && initialData) {
      let newFormData = { ...initialData };

      // Fetch city details and populate cities_details
      if (newFormData.cities) {
        const fetchCityDetails = async () => {
          const { data: citiesData, error } = await supabase
            .from("cities")
            .select("*")
            .in("id", newFormData.cities); // Fetch cities with matching IDs

          if (error) {
            console.error("Error fetching city details:", error);
          } else {
            newFormData.cities_details = citiesData.map((city) => ({
              value: city.id,
              label: city.name,
            }));
            setFormData(newFormData);
          }
        };

        fetchCityDetails();
      }
    }
  }, [open, initialData]);

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
          <UserFormFields
            userData={formData}
            onChange={setFormData}
            isNewUser={!isEditMode}
          />
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
