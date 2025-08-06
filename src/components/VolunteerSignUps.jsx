import React, { useState } from "react";
import {
  Button,
  Grid,
  Card,
  Typography,
  TextField,
  styled,
  useTheme,
  Box,
} from "@mui/material";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import InputAdornment from "@mui/material/InputAdornment";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";
import { IframeHelpDialog } from "./events/IframeHelpDialog";
import { Edit } from "@mui/icons-material";
import UploadImage from "./util/UploadImage";

const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
  "& .MuiTreeItem-content": {
    paddingTop: "12px",
    paddingBottom: "12px",
    flexDirection: "row-reverse",
  },
}));

export const VolunteerSignUps = ({
  isEdit,
  volunteerHeaderImage,
  setVolunteerHeaderImage,
  volunteerHeaderText,
  setVolunteerHeaderText,
  signUpFormId,
  setSignUpFormId,
  toggleDaysOfServiceVisibiltity,
  onClose,
}) => {
  const [isEditingValues, setEditingValues] = useState(isEdit);
  const [rawIframeCode, setRawIframeCode] = useState("");
  const [error, setError] = useState("");
  const toggleEditing = () => setEditingValues((p) => !p);

  const theme = useTheme();

  const [isShowIframeHelpDialog, setShowIframeHelpDialog] = useState(false);
  const showIframeHelpDialog = () => setShowIframeHelpDialog(true);
  const hideIframeHelpDialog = () => setShowIframeHelpDialog(false);

  const extractGoogleFormId = (iframe) => {
    const match = iframe.match(
      /<iframe[^>]*src="https:\/\/docs\.google\.com\/forms\/d\/e\/([^"]+)\/viewform/
    );
    return match ? match[1] : null;
  };

  const handleSave = () => {
    const googleFormId = extractGoogleFormId(rawIframeCode);

    if (googleFormId) {
      toggleEditing();
      setSignUpFormId(googleFormId);
      setError(null);
    } else {
      setError("This is not a valid Google Form iframe.");
    }
  };

  if (!isEdit && !signUpFormId) {
    return null;
  }

  const HeaderWithCloseButton = () => (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      sx={{ position: "relative" }}
      mb={2}
    >
      {isEdit ? (
        <TextField
          variant="standard"
          value={volunteerHeaderText || "Sign Up as a Volunteer"}
          onChange={(event) => setVolunteerHeaderText(event.target.value)}
          fullWidth
          InputProps={{
            disableUnderline: true,
            sx: {
              fontSize: "2rem",
              textAlign: "center",
              color: (theme) => theme.palette.primary.main,
              textTransform: "capitalize",
              display: "flex",
              justifyContent: "center",
              "& .Mui-focused": {
                backgroundColor: "#f0f0f0",
                borderRadius: "4px",
              },
            },
          }}
          sx={{
            fontFamily: "inherit",
            fontSize: "2rem",
            border: "none",
            margin: 0,
            padding: "10px 16px",
            textAlign: "center",
            "& .MuiInputBase-input": {
              textAlign: "center",
            },
            "& .MuiInput-underline:before": {
              borderBottom: "none",
            },
            "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
              borderBottom: "none",
            },
            "& .MuiInput-underline:after": {
              borderBottom: "none",
            },
          }}
        />
      ) : (
        <Typography variant="h4" component="h2" color="primary">
          {volunteerHeaderText ? volunteerHeaderText : "Sign Up as a Volunteer"}
        </Typography>
      )}
      {!isEdit ? (
        <Button
          variant="outlined"
          onClick={onClose}
          startIcon={<CloseIcon />}
          sx={{
            position: { md: "absolute", xs: "relative" },
            top: 25,
            right: 0,
            mr: 3,
            mt: { md: 0, xs: 2 },
          }}
        >
          Close Form
        </Button>
      ) : (
        <>
          <Button
            variant="outlined"
            onClick={toggleEditing}
            startIcon={<Edit />}
            sx={{
              position: "absolute",
              top: 25,
              right: 0,
              mr: 3,
              mb: { xs: 4, md: 0 },
            }}
          >
            Edit
          </Button>
        </>
      )}
    </Box>
  );

  if (isEditingValues || !signUpFormId) {
    return (
      <>
        <IframeHelpDialog
          open={isShowIframeHelpDialog}
          handleClose={hideIframeHelpDialog}
        />
        <Grid item xs={12} display="flex" flexDirection="column">
          {/* isEdit: {JSON.stringify(isEdit)} */}
          {isEdit ? (
            <TextField
              variant="standard"
              value={volunteerHeaderText || "Sign Up as a Volunteer"}
              onChange={(event) => setVolunteerHeaderText(event.target.value)}
              fullWidth
              InputProps={{
                disableUnderline: true,
                sx: {
                  fontSize: "2rem",
                  textAlign: "center",
                  color: (theme) => theme.palette.primary.main,
                  textTransform: "capitalize",
                  display: "flex",
                  justifyContent: "center",
                  "& .Mui-focused": {
                    backgroundColor: "#f0f0f0",
                    borderRadius: "4px",
                  },
                },
              }}
              sx={{
                fontFamily: "inherit",
                fontSize: "2rem",
                border: "none",
                margin: 0,
                padding: "10px 16px",
                textAlign: "center",
                "& .MuiInputBase-input": {
                  textAlign: "center",
                },
                "& .MuiInput-underline:before": {
                  borderBottom: "none",
                },
                "& .MuiInput-underline:hover:not(.Mui-disabled):before": {
                  borderBottom: "none",
                },
                "& .MuiInput-underline:after": {
                  borderBottom: "none",
                },
              }}
            />
          ) : (
            <Typography
              variant="h4"
              component="h2"
              color="primary"
              textAlign="center"
              gutterBottom
            >
              {volunteerHeaderText || "Sign Up as a Volunteer"}
            </Typography>
          )}
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            position="relative"
            sx={{
              px: 1,
              width: "100%",
              height: "100%",
              minHeight: "100px",
              backgroundColor: "transparent",
            }}
          >
            <UploadImage setUrl={(url) => setVolunteerHeaderImage(url)} />

            {volunteerHeaderImage ? (
              <Box
                component="img"
                src={volunteerHeaderImage}
                sx={{
                  width: "100%",
                  borderRadius: 4,
                  height: "auto",
                  boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
                  objectFit: "cover",
                }}
              />
            ) : (
              <Typography variant="h4" component="h2" align="center">
                Volunteer Header Image
              </Typography>
            )}
          </Box>
          {/* Always show the helper and button, even in edit mode */}
          <Grid
            item
            xs={12}
            display="flex"
            flexDirection="row"
            alignItems="center"
            mt={2}
          >
            <Typography variant="body1" textAlign="left">
              Copy the link from Google Forms
            </Typography>
            <Button
              variant="outlined"
              onClick={showIframeHelpDialog}
              sx={{ ml: 2 }}
            >
              Get Help <HelpOutlineIcon sx={{ ml: 1 }} />
            </Button>
          </Grid>
          <TextField
            size="small"
            value={rawIframeCode}
            onChange={(e) => setRawIframeCode(e.target.value)}
            placeholder="Google Form iframe code"
            margin="normal"
            error={!!error}
            helperText={error || ""}
            InputProps={{
              endAdornment: (
                <InputAdornment
                  position="end"
                  sx={{
                    borderLeft: `2px solid ${theme.palette.divider}`,
                    paddingLeft: theme.spacing(1),
                  }}
                >
                  <Button sx={{ mx: "auto" }} onClick={handleSave}>
                    Save
                  </Button>
                </InputAdornment>
              ),
            }}
          />
        </Grid>
      </>
    );
  } else {
    return (
      <div id="volunteer">
        <HeaderWithCloseButton />

        <Box sx={{ padding: 2 }}>
          <Grid
            item
            xs={12}
            display="flex"
            justifyContent="center"
            flexDirection="column"
          >
            {volunteerHeaderImage && (
              <Box
                component="img"
                src={volunteerHeaderImage}
                sx={{
                  width: "100%",
                  borderRadius: 4,
                  mb: 3,
                  height: "auto",
                  boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
                  objectFit: "cover",
                }}
              />
            )}

            <iframe
              src={`https://docs.google.com/forms/d/e/${signUpFormId}/viewform?embedded=true`}
              width="100%"
              height="500px"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
              title="Volunteer Sign Up Form"
            >
              Loading…
            </iframe>
          </Grid>
        </Box>
      </div>
    );
  }
};
