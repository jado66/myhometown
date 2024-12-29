import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from "@mui/material";

const AddressSuggestionDialog = ({
  open,
  onClose,
  currentAddress,
  suggestedAddress,
  onAccept,
}) => {
  // Don't render the dialog content if we don't have both addresses
  if (!suggestedAddress || !currentAddress) {
    return null;
  }

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Verify Address</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          We found a standardized version of your address. Would you like to use
          it?
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {currentAddress && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Current Address:
              </Typography>
              <Typography>
                {currentAddress.addressStreet1}
                {currentAddress.addressStreet2 && (
                  <>, {currentAddress.addressStreet2}</>
                )}
                <br />
                {currentAddress.addressCity}, {currentAddress.addressState}{" "}
                {currentAddress.addressZipCode}
              </Typography>
            </Box>
          )}

          {suggestedAddress && (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                Suggested Address:
              </Typography>
              <Typography>
                {suggestedAddress.addressStreet1}
                {suggestedAddress.addressStreet2 && (
                  <>, {suggestedAddress.addressStreet2}</>
                )}
                <br />
                {suggestedAddress.addressCity}, {suggestedAddress.addressState}{" "}
                {suggestedAddress.addressZipCode}
              </Typography>
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Keep Original
        </Button>
        <Button
          onClick={() => onAccept(suggestedAddress)}
          variant="contained"
          color="primary"
        >
          Use Suggested
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddressSuggestionDialog;
