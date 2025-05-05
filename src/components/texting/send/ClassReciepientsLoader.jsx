import React, { useState } from "react";
import {
  Button,
  TextField,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress,
} from "@mui/material";
import { PersonAdd } from "@mui/icons-material";
import { useClasses } from "@/hooks/useClasses";

const ClassRecipientsLoader = ({ onAddRecipients }) => {
  const [open, setOpen] = useState(false);
  const [classId, setClassId] = useState("");
  const [error, setError] = useState(null);
  const { getClass, loading } = useClasses();

  const handleOpen = () => {
    setOpen(true);
    setError(null);
  };

  const handleClose = () => {
    setOpen(false);
    setClassId("");
    setError(null);
  };

  const handleLoadClassMembers = async () => {
    if (!classId.trim()) {
      setError("Please enter a valid class ID");
      return;
    }

    try {
      const classData = await getClass(classId);

      if (!classData) {
        setError("Could not find class with that ID");
        return;
      }

      if (
        !classData.signups ||
        !Array.isArray(classData.signups) ||
        classData.signups.length === 0
      ) {
        setError("This class has no signups yet");
        return;
      }

      // Filter out entries without phone numbers and format them for the recipient selector
      const recipients = classData.signups
        .filter((signup) => signup.phone)
        .map((signup) => ({
          value: signup.phone,
          label: `${signup.first_name || ""} ${signup.last_name || ""} (${
            signup.phone
          })`.trim(),
          contactId: signup.id || null,
          firstName: signup.first_name || "",
          lastName: signup.last_name || "",
          phone: signup.phone,
          email: signup.email || "",
          groups: [],
          ownerType: "class",
          ownerId: classId,
        }));

      if (recipients.length === 0) {
        setError("No valid phone numbers found in class signups");
        return;
      }

      // Add these recipients to the current selection
      onAddRecipients(recipients);
      handleClose();
    } catch (err) {
      console.error("Error loading class members:", err);
      setError(err.message || "Failed to load class members");
    }
  };

  return (
    <>
      <Button
        variant="outlined"
        startIcon={<PersonAdd />}
        onClick={handleOpen}
        sx={{ mb: 2 }}
      >
        Load Class Members
      </Button>

      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>Load Class Members</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Enter a class ID to load all members with phone numbers as message
            recipients.
          </DialogContentText>
          <TextField
            autoFocus
            margin="dense"
            id="classId"
            label="Class ID"
            type="text"
            fullWidth
            variant="outlined"
            value={classId}
            onChange={(e) => setClassId(e.target.value)}
            error={!!error}
            helperText={error}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Cancel</Button>
          <Button
            onClick={handleLoadClassMembers}
            color="primary"
            disabled={loading || !classId.trim()}
          >
            {loading ? <CircularProgress size={24} /> : "Load Members"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ClassRecipientsLoader;
