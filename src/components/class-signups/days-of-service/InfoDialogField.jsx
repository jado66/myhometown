"use client";
import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormHelperText,
} from "@mui/material";
import { Check } from "@mui/icons-material";
import { MultiLineTypography } from "../../MultiLineTypography";

export const InfoDialogField = ({ field, config, value, onChange, error }) => {
  const [open, setOpen] = useState(false);

  return (
    <Box>
      <Button variant="outlined" onClick={() => setOpen(true)}>
        {config.label}
        {value && <Check sx={{ ml: 1 }} />}
      </Button>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>{config.label}</DialogTitle>
        <DialogContent>
          <MultiLineTypography text={config.content} />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setOpen(false);
              onChange(field, true);
            }}
          >
            I Acknowledge
          </Button>
        </DialogActions>
      </Dialog>
      {error && <FormHelperText error>{error}</FormHelperText>}
    </Box>
  );
};
