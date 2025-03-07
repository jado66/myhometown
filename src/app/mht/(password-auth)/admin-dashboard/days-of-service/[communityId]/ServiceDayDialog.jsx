"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  IconButton,
  InputAdornment,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import moment from "moment";
import { useDaysOfService } from "@/hooks/useDaysOfService";
import { toast } from "react-toastify";
import AskYesNoDialog from "@/components/util/AskYesNoDialog";

const ServiceDayDialog = ({
  open,
  onClose,
  cityId,
  communityId,
  initialData,
  fetchDays,
  handleDeleteDay,
  dayOfServicePrefix,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    start_date: moment().format("YYYY-MM-DD"),
    end_date: moment().format("YYYY-MM-DD"),
    city_id: cityId,
    community_id: communityId,
    partner_stakes: [],
    partner_wards: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const { addDayOfService, updateDayOfService } = useDaysOfService();

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        start_date: moment(initialData.start_date).format("YYYY-MM-DD"),
        end_date: moment(initialData.end_date).format("YYYY-MM-DD"),
        city_id: cityId,
        community_id: communityId,
        partner_stakes: initialData.partner_stakes || [],
        partner_wards: initialData.partner_wards || [],
        check_in_location: initialData.check_in_location || "",
      });
    } else {
      setFormData({
        name: "",
        start_date: moment().format("YYYY-MM-DD"),
        end_date: moment().format("YYYY-MM-DD"),
        city_id: cityId,
        community_id: communityId,
        partner_stakes: [],
        partner_wards: [],
        check_in_location: "",
      });
    }
  }, [initialData, cityId, communityId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (initialData?.id) {
        await updateDayOfService({
          id: initialData.id,
          short_id: initialData.short_id,
          ...formData,
        });
      } else {
        await addDayOfService(formData);
      }
      fetchDays();
      onClose(true);
    } catch (error) {
      console.error("Error saving day of service:", error);
      toast.error("Failed to save day of service");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={() => onClose(false)} maxWidth="md" fullWidth>
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span>
              {initialData ? "Edit Day of Service" : "New Day of Service"}
            </span>
            <IconButton onClick={() => onClose(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3, pt: 2 }}>
            <TextField
              label="Name (Optional)"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start" sx={{ mt: "2px" }}>
                    {dayOfServicePrefix}
                  </InputAdornment>
                ),
              }}
              variant="outlined"
            />

            <TextField
              label="Start Date"
              type="date"
              value={formData.start_date}
              onChange={(e) =>
                setFormData({ ...formData, start_date: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date (Day of Service)"
              type="date"
              value={formData.end_date}
              onChange={(e) =>
                setFormData({ ...formData, end_date: e.target.value })
              }
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Check-In Location"
              value={formData.check_in_location}
              key="check_in_location"
              onChange={(e) =>
                setFormData({ ...formData, check_in_location: e.target.value })
              }
              fullWidth
              variant="outlined"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          {initialData && (
            <Button
              onClick={() => setShowDeleteDialog(true)}
              color="error"
              disabled={isLoading}
              variant="outlined"
            >
              Delete Day
            </Button>
          )}
          <Box sx={{ flex: "1 1 auto" }} />
          <Button onClick={() => onClose(false)} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={isLoading || !formData.start_date || !formData.end_date}
          >
            {isLoading ? "Saving..." : "Save"}
          </Button>
        </DialogActions>
      </form>
      <AskYesNoDialog
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        title="Delete Day of Service?"
        description="Are you sure you want to delete this day of service? This will also delete all projects associated with this day. This action cannot be undone."
        onConfirm={() => {
          handleDeleteDay(initialData?.id);
          setShowDeleteDialog(false);
        }}
        onCancel={() => setShowDeleteDialog(false)}
      />
    </Dialog>
  );
};

export default ServiceDayDialog;
