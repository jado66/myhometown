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
  const {
    title,
    description,
    onConfirm,
    onCancel,
    onClose,
    open,
    loading,
    confirmText = "Yes",
    cancelText = "No",
    loadingText = "Deleting...",
    confirmColor = "primary",
  } = props;

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
          variant="out"
          onClick={onCancel}
          color="secondary"
          disabled={loading}
        >
          {cancelText}
        </Button>
        <Button
          variant="contained"
          onClick={onConfirm}
          color={confirmColor}
          autoFocus
          disabled={loading}
          startIcon={
            loading ? <CircularProgress size={20} color="inherit" /> : null
          }
        >
          {loading ? loadingText : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
