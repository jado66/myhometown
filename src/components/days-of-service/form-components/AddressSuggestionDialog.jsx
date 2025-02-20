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

// TODO this only works the first time the dialog is opened

// Helper function to convert camelCase to snake_case
const toSnakeCase = (str) =>
  str.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);

const camelToSnakeCase = (obj) =>
  Object.keys(obj).reduce((acc, key) => {
    const snakeKey = toSnakeCase(key);
    acc[snakeKey] = obj[key];
    return acc;
  }, {});

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

  const isDifferent = (current, suggested) => {
    return current?.toLowerCase() !== suggested?.toLowerCase();
  };

  const HighlightedText = ({ text, isHighlighted }) => (
    <Typography
      component="span"
      sx={{
        backgroundColor: isHighlighted
          ? "rgba(255, 255, 0, 0.3)"
          : "transparent",
        padding: isHighlighted ? "0 2px" : 0,
        borderRadius: "2px",
      }}
    >
      {text}
    </Typography>
  );

  const RenderAddress = ({ current, suggested }) => (
    <Typography>
      <HighlightedText
        text={current.addressStreet1}
        isHighlighted={isDifferent(
          current.addressStreet1,
          suggested.addressStreet1
        )}
      />
      {current.addressStreet2 && (
        <>
          ,{" "}
          <HighlightedText
            text={current.addressStreet2}
            isHighlighted={isDifferent(
              current.addressStreet2,
              suggested.addressStreet2
            )}
          />
        </>
      )}
      <br />
      <HighlightedText
        text={current.addressCity}
        isHighlighted={isDifferent(current.addressCity, suggested.addressCity)}
      />
      ,{" "}
      <HighlightedText
        text={current.addressState}
        isHighlighted={isDifferent(
          current.addressState,
          suggested.addressState
        )}
      />{" "}
      <HighlightedText
        text={current.addressZipCode}
        isHighlighted={isDifferent(
          current.addressZipCode,
          suggested.addressZipCode
        )}
      />
    </Typography>
  );

  // Convert suggestedAddress to snake_case before passing to onAccept
  const handleAccept = () => {
    const snakeCaseSuggestedAddress = camelToSnakeCase(suggestedAddress);
    onAccept(snakeCaseSuggestedAddress);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Verify Address</DialogTitle>
      <DialogContent>
        <Typography variant="subtitle1" sx={{ mb: 2 }}>
          We found a standardized version of your address. Would you like to use
          it?
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Current Address:
            </Typography>
            <RenderAddress
              current={currentAddress}
              suggested={suggestedAddress}
            />
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Suggested Address:
            </Typography>
            <RenderAddress
              current={suggestedAddress}
              suggested={currentAddress}
            />
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Keep Original
        </Button>
        <Button
          onClick={handleAccept} // Use the new handler
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
