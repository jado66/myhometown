import { Close } from "@mui/icons-material";
import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@mui/material";
import { toast } from "react-toastify";

const EmailPreviewDialog = ({ open, onClose, fromName, email, message }) => {
  const handleButtonClick = () => {
    // Use window.location.href to get the complete current URL
    const fullUrl = window.location.href;
    toast.info(`This button will link them to ${fullUrl}`);
  };

  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        Email Preview
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            padding: "8px",
          }}
        >
          <Close sx={{ fontSize: "1rem" }} />
        </IconButton>
      </DialogTitle>

      <DialogContent
        sx={{ display: "flex", flexDirection: "column", gap: "1rem" }}
      >
        <div>
          To: {email || "Collaborator Email"}
          <br />
          Subject: Invitation to Collaborate
        </div>

        <div
          style={{
            backgroundColor: "#f9fafb",
            padding: "1rem",
            borderRadius: "6px",
            fontFamily: "monospace",
            fontSize: "0.875rem",
            whiteSpace: "pre-line",
          }}
        >
          Hi there, You've been invited to collaborate on a Days Of Service
          project by {fromName || "[Your Name]"}. Here is their message to you:
          <br />
          <br />
          <hr />
          <br />
          <div>
            <div>{(message || "[Your message goes here.]").trim()}</div>
            <br />
            Thanks, {fromName || "[Your Name]"}
            <br />
            <br />
            <hr />
            <div style={{ marginTop: "2em" }}>
              <Button variant="contained" fullWidth onClick={handleButtonClick}>
                Go To This Project
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default EmailPreviewDialog;
