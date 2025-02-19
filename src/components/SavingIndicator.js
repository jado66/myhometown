// components/SavingIndicator.js
import React, { useState, useEffect } from "react";
import { Snackbar, Alert } from "@mui/material";
import { useProjectForm } from "@/contexts/ProjectFormProvider";

const SavingIndicator = () => {
  const { isSaving } = useProjectForm();
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    let timeoutId;

    if (isSaving) {
      setShowIndicator(true);
    } else {
      // When saving completes, wait 1 second before hiding
      timeoutId = setTimeout(() => {
        setShowIndicator(false);
      }, 2000); // Adjust this delay as needed
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isSaving]);

  return (
    <Snackbar
      open={showIndicator}
      anchorOrigin={{ vertical: "top", horizontal: "right" }}
      sx={{ top: "24px !important" }}
    >
      <Alert
        severity="info"
        sx={{
          bgcolor: "primary.main",
          color: "white",
          "& .MuiAlert-icon": {
            color: "white",
          },
        }}
      >
        Saving...
      </Alert>
    </Snackbar>
  );
};

export default SavingIndicator;
