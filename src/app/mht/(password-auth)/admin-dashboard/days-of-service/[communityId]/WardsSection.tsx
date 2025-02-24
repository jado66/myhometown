"use client";

import { useState } from "react";
import {
  Typography,
  Box,
  TextField,
  Button,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { Delete } from "@mui/icons-material";
import { useDaysOfService } from "@/hooks/useDaysOfService";
import { toast } from "react-toastify";

const WardsSection = ({ wards, onWardsChange, dayOfServiceId }) => {
  const [newWard, setNewWard] = useState("");
  const [showWardDialog, setShowWardDialog] = useState(false);
  const { addPartnerToDayOfService } = useDaysOfService();

  const handleAddWard = async () => {
    if (!newWard.trim() || !dayOfServiceId) return;
    try {
      await addPartnerToDayOfService(dayOfServiceId, "ward", newWard);
      onWardsChange([...wards, newWard]);
      setNewWard("");
      setShowWardDialog(false);
    } catch (error) {
      console.error("Error adding ward:", error);
      toast.error("Failed to add ward");
    }
  };

  const handleDeleteWard = (wardToDelete) => {
    const updatedWards = wards.filter((w) => w !== wardToDelete);
    onWardsChange(updatedWards);
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Partner Wards / Groups
      </Typography>
      {wards.map((ward) => (
        <Chip
          key={ward}
          label={ward}
          onDelete={() => handleDeleteWard(ward)}
          deleteIcon={<Delete />}
          sx={{ mr: 1, mb: 1 }}
        />
      ))}
      <Button
        onClick={() => setShowWardDialog(true)}
        variant="outlined"
        size="small"
        sx={{ mt: 1 }}
      >
        Add Ward
      </Button>

      <Dialog
        open={showWardDialog}
        onClose={() => setShowWardDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Add New Ward</DialogTitle>
        <DialogContent>
          <TextField
            label="Ward Name"
            value={newWard}
            onChange={(e) => setNewWard(e.target.value)}
            fullWidth
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowWardDialog(false)}>Cancel</Button>
          <Button onClick={handleAddWard} variant="contained" color="primary">
            Add Ward
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WardsSection;
