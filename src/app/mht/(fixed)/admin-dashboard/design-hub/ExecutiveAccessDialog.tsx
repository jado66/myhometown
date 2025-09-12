import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Typography,
  Button,
} from "@mui/material";
import { ArrowBack as ArrowBackIcon } from "@mui/icons-material";

interface ExecutiveAccessDialogProps {
  open: boolean;
  handleDialogBack: () => void;
  handleDialogProceed: () => void;
}

export default function ExecutiveAccessDialog({
  open,
  handleDialogBack,
  handleDialogProceed,
}: ExecutiveAccessDialogProps) {
  return (
    <Dialog
      open={open}
      onClose={() => {}}
      maxWidth="sm"
      fullWidth
      PaperProps={{ sx: { borderRadius: 2, p: 2 } }}
    >
      <DialogTitle sx={{ textAlign: "center", pb: 1 }}>
        <Typography
          variant="h5"
          sx={{ fontWeight: "bold", color: "primary.main" }}
        >
          Executive Access Required
        </Typography>
      </DialogTitle>
      <DialogContent sx={{ textAlign: "center", py: 3 }}>
        <Typography variant="body1" sx={{ fontSize: "1.1rem" }}>
          Please proceed only if you are a myHometown executive
        </Typography>
      </DialogContent>
      <DialogActions sx={{ justifyContent: "center", gap: 2, pt: 2 }}>
        <Button
          variant="outlined"
          onClick={handleDialogBack}
          startIcon={<ArrowBackIcon />}
          sx={{ minWidth: 120 }}
        >
          Back
        </Button>
        <Button
          variant="contained"
          onClick={handleDialogProceed}
          sx={{ minWidth: 120, fontWeight: "bold" }}
        >
          Proceed
        </Button>
      </DialogActions>
    </Dialog>
  );
}
