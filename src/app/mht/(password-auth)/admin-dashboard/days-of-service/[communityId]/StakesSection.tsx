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
import { v4 as uuidv4 } from "uuid";

const StakesSection = ({ stakes, onStakesChange, dayOfServiceId }) => {
  const [newStake, setNewStake] = useState({
    id: "",
    name: "",
    liaison_name_1: "",
    liaison_email_1: "",
    liaison_phone_1: "",
    liaison_name_2: "",
    liaison_email_2: "",
    liaison_phone_2: "",
  });
  const [showStakeDialog, setShowStakeDialog] = useState(false);
  const { addPartnerToDayOfService } = useDaysOfService();

  const handleAddStake = async () => {
    if (!newStake.name.trim() || !dayOfServiceId) return;
    try {
      const id = uuidv4();

      await addPartnerToDayOfService(dayOfServiceId, "stake", {
        ...newStake,
        id,
      });
      onStakesChange([...stakes, newStake]);
      setNewStake({
        id: "",
        name: "",
        liaison_name_1: "",
        liaison_email_1: "",
        liaison_phone_1: "",
        liaison_name_2: "",
        liaison_email_2: "",
        liaison_phone_2: "",
      });
      setShowStakeDialog(false);
    } catch (error) {
      console.error("Error adding stake:", error);
      toast.error("Failed to add stake");
    }
  };

  const handleEditStake = (stake) => {
    setNewStake(stake);
    setShowStakeDialog(true);
  };

  const handleUpdateStake = () => {
    const updatedStakes = stakes.map((s) =>
      s.id === editingStake.id ? newStake : s
    );
    onStakesChange(updatedStakes);
    setShowStakeDialog(false);
  };

  const handleDeleteStake = (stakeToDelete) => {
    const updatedStakes = stakes.filter((s) => s.id !== stakeToDelete.id);
    onStakesChange(updatedStakes);
  };

  const handleOnAddStake = () => {
    setNewStake({
      id: "",
      name: "",
      liaison_name_1: "",
      liaison_email_1: "",
      liaison_phone_1: "",
      liaison_name_2: "",
      liaison_email_2: "",
      liaison_phone_2: "",
    });
    setShowStakeDialog(true);
  };

  const editingStake = Boolean(newStake.id);

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom>
        Partner Stakes / Stakes
      </Typography>
      {stakes.map((stake) => (
        <Chip
          key={stake.id || stake.name}
          label={stake.name}
          onDelete={() => handleDeleteStake(stake)}
          onClick={() => handleEditStake(stake)}
          deleteIcon={<Delete />}
          sx={{ mr: 1, mb: 1 }}
        />
      ))}
      <Button
        onClick={handleOnAddStake}
        variant="outlined"
        size="small"
        sx={{ mt: 1 }}
      >
        Add Stake
      </Button>

      <Dialog
        open={showStakeDialog}
        onClose={() => setShowStakeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingStake ? "Edit Stake" : "Add New Stake"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 2 }}>
            <TextField
              label="Stake Name"
              value={newStake.name}
              onChange={(e) =>
                setNewStake({ ...newStake, name: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Liaison Name 1"
              value={newStake.liaison_name_1}
              onChange={(e) =>
                setNewStake({ ...newStake, liaison_name_1: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Liaison Email 1"
              value={newStake.liaison_email_1}
              onChange={(e) =>
                setNewStake({ ...newStake, liaison_email_1: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Liaison Phone 1"
              value={newStake.liaison_phone_1}
              onChange={(e) =>
                setNewStake({ ...newStake, liaison_phone_1: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Liaison Name 2"
              value={newStake.liaison_name_2}
              onChange={(e) =>
                setNewStake({ ...newStake, liaison_name_2: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Liaison Email 2"
              value={newStake.liaison_email_2}
              onChange={(e) =>
                setNewStake({ ...newStake, liaison_email_2: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Liaison Phone 2"
              value={newStake.liaison_phone_2}
              onChange={(e) =>
                setNewStake({ ...newStake, liaison_phone_2: e.target.value })
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowStakeDialog(false)}>Cancel</Button>
          <Button
            onClick={editingStake ? handleUpdateStake : handleAddStake}
            variant="contained"
            color="primary"
          >
            {editingStake ? "Update" : "Add"} Stake
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default StakesSection;
