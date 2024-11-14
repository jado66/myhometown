"use client";
import React, { useContext } from "react";
import { UserContext } from "@/contexts/UserProvider";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CancelIcon from "@mui/icons-material/Cancel";

const ImpersonationBanner = () => {
  const { isImpersonating, stopImpersonation, user } = useContext(UserContext);

  if (!isImpersonating) return null;

  return (
    <Alert
      severity="error"
      sx={{
        position: "fixed",
        bottom: 0,
        zIndex: 10000,
        left: 0,
        width: "100%",
        borderRadius: 0,
        marginBottom: 0,
        "& .MuiAlert-message": {
          width: "100%",
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          width: "100%",
        }}
      >
        <Typography>Currently impersonating: {user?.email}</Typography>
        <Button
          variant="outlined"
          color="error"
          size="small"
          onClick={stopImpersonation}
          startIcon={<CancelIcon />}
          sx={{
            backgroundColor: "white",
            display: "flex",
            alignItems: "center",
          }}
        >
          Stop Impersonating
        </Button>
      </Box>
    </Alert>
  );
};

export default ImpersonationBanner;
