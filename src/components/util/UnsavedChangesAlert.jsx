import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

const UnsavedChangesAlert = ({ hasUnsavedChanges = false }) => {
  const router = useRouter();
  const pathname = usePathname();
  const [showDialog, setShowDialog] = useState(false);
  const [nextUrl, setNextUrl] = useState("");

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (hasUnsavedChanges) {
        event.preventDefault();
        event.returnValue = "";
      }
    };

    // Handle browser back/forward/close
    window.addEventListener("beforeunload", handleBeforeUnload);

    // Handle clicks on links or navigation attempts
    const handleClick = (event) => {
      if (!hasUnsavedChanges) return;

      // Find the closest link element (either <a> or MUI Link)
      const target = event.target;
      const muiLink = target.closest('[role="link"]') || target.closest("a");

      if (!muiLink) return;

      // Get href from either the href attribute or the dataset
      const href = muiLink.getAttribute("href");

      if (!href || href.startsWith("#") || event.ctrlKey || event.metaKey)
        return;

      // Prevent the default navigation
      event.preventDefault();
      event.stopPropagation();

      setNextUrl(href);
      setShowDialog(true);
    };

    // Handle MUI Link clicks
    const handleMuiLinkClick = (event) => {
      if (!hasUnsavedChanges) return;

      const target = event.currentTarget;
      if (!target) return;

      const href = target.getAttribute("href");

      if (!href || href.startsWith("#")) return;

      event.preventDefault();
      event.stopPropagation();

      setNextUrl(href);
      setShowDialog(true);
    };

    // Add listeners
    document.addEventListener("click", handleClick, true);

    // Add listeners to all MUI Links
    const muiLinks = document.querySelectorAll('[role="link"]');
    muiLinks.forEach((link) => {
      link.addEventListener("click", handleMuiLinkClick, true);
    });

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
      document.removeEventListener("click", handleClick, true);

      // Clean up MUI Link listeners
      const muiLinks = document.querySelectorAll('[role="link"]');
      muiLinks.forEach((link) => {
        link.removeEventListener("click", handleMuiLinkClick, true);
      });
    };
  }, [hasUnsavedChanges, pathname]);

  const handleContinue = () => {
    setShowDialog(false);
    if (nextUrl) {
      router.push(nextUrl);
    }
  };

  return (
    <>
      <Dialog
        open={showDialog}
        onClose={() => setShowDialog(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Unsaved Changes?</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            You may have unsaved changes. Are you sure you want to leave this
            page? All unsaved changes will be lost.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)} color="primary">
            Stay
          </Button>
          <Button onClick={handleContinue} color="error" autoFocus>
            Leave anyway
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default UnsavedChangesAlert;
