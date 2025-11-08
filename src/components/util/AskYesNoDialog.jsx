import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContentText,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
} from "@mui/material";

export default function AskYesNoDialog(props) {
  const { title, description, onConfirm, onCancel, onClose, open, loading } =
    props;

  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      aria-labelledby="confirm-dialog"
    >
      <DialogTitle id="confirm-dialog">{title}</DialogTitle>
      <DialogContent>
        <DialogContentText>{description}</DialogContentText>
      </DialogContent>

      <DialogActions>
        <Button
          variant="contained"
          onClick={onCancel}
          color="secondary"
          disabled={loading}
        >
          No
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          color="primary"
          autoFocus
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {loading ? "Deleting..." : "Yes"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
