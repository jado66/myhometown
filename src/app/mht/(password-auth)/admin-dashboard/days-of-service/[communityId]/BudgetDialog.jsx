"use client";

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  IconButton,
} from "@mui/material";

import { Visibility, VisibilityOff } from "@mui/icons-material";

const BudgetDialog = ({
  open,
  onClose,
  setPassword,
  password,
  showPassword,
  setShowPassword,
  handleAuthSubmit,
  setAuthError,
  authError,
}) => {
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Enter the Budget Access Password</DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Password"
          type={showPassword ? "text" : "password"}
          fullWidth
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!authError}
          helperText={
            authError ||
            "If you need a password please contact your Neighborhood Services Director."
          }
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              handleAuthSubmit();
            }
          }}
          InputProps={{
            endAdornment: (
              <IconButton
                onClick={() => setShowPassword((prev) => !prev)}
                edge="end"
              >
                {
                  // Show/hide password icon
                  showPassword ? <VisibilityOff /> : <Visibility />
                }
              </IconButton>
            ),

            sx: { pr: 2 },
          }}
        />
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onClose();
            setPassword("");
            setAuthError("");
          }}
        >
          Cancel
        </Button>
        <Button onClick={handleAuthSubmit} variant="contained">
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default BudgetDialog;
