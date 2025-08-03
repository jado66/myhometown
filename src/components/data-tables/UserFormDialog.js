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
import { Delete, Key, Email } from "@mui/icons-material";
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
  onResendInvitation, // New prop
  loading = false,
}) => {
  const [formData, setFormData] = useState(initialData);
  const [resendingInvite, setResendingInvite] = useState(false);
  const isEditMode = !!initialData?.id;

  useEffect(() => {
    if (open && initialData) {
      let newFormData = { ...initialData };

      // Prepopulate communities as array of IDs
      if (Array.isArray(newFormData.communities_details)) {
        newFormData.communities = newFormData.communities_details.map(
          (comm) => comm.id
        );
      } else if (Array.isArray(newFormData.communities)) {
        // Already array of IDs
      } else {
        newFormData.communities = [];
      }

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
      } else {
        setFormData(newFormData);
      }
    }
  }, [open, initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleResendInvitation = async () => {
    if (!onResendInvitation || !formData) return;

    setResendingInvite(true);
    try {
      await onResendInvitation(formData);
    } catch (error) {
      console.error("Error resending invitation:", error);
    } finally {
      setResendingInvite(false);
    }
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
            <Box sx={{ display: "flex", gap: 1 }}>
              <Button
                onClick={() => onDelete(formData)}
                color="error"
                disabled={loading || resendingInvite}
                startIcon={<Delete />}
              >
                Delete User
              </Button>

              {/* Show both buttons - you can choose which one to keep */}
              {/* <Button
                onClick={() => onPasswordReset(formData.email)}
                color="warning"
                disabled={loading || resendingInvite}
                startIcon={<Key />}
              >
                Password Reset
              </Button> */}

              {onResendInvitation && (
                <Button
                  onClick={handleResendInvitation}
                  color="info"
                  disabled={loading || resendingInvite}
                  startIcon={<Email />}
                >
                  {resendingInvite ? "Sending..." : "Resend Invitation"}
                </Button>
              )}
            </Box>
          )}
          <Box>
            <Button onClick={onClose} disabled={loading || resendingInvite}>
              Cancel
            </Button>
            <Button
              type="submit"
              color="primary"
              disabled={loading || resendingInvite}
            >
              {loading ? "Saving..." : isEditMode ? "Save" : "Create"}
            </Button>
          </Box>
        </DialogActions>
      </form>
    </Dialog>
  );
};
