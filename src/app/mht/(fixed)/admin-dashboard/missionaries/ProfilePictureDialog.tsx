import React from "react";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import IconButton from "@mui/material/IconButton";
import CloseIcon from "@mui/icons-material/Close";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

interface ProfilePictureDialogProps {
  open: boolean;
  onClose: () => void;
  profilePicUrl: string | null;
}

const ProfilePictureDialog: React.FC<ProfilePictureDialogProps> = ({
  open,
  onClose,
  profilePicUrl,
  profilePicName,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogContent sx={{ position: "relative", p: 3 }}>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        {profilePicUrl ? (
          <Box display="flex" flexDirection="column" alignItems="center">
            <img
              src={profilePicUrl}
              alt="Profile"
              style={{
                width: 180,
                height: 180,
                objectFit: "cover",
                borderRadius: "50%",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                marginBottom: 16,
              }}
            />
            <Typography variant="subtitle1">{profilePicName}</Typography>
          </Box>
        ) : (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            justifyContent="center"
            minHeight={200}
          >
            <Typography variant="body2" color="text.secondary">
              No profile picture available.
            </Typography>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default ProfilePictureDialog;
