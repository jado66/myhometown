import React, { useState } from "react";
import {
  Button,
  Grid,
  Card,
  Typography,
  TextField,
  styled,
  useTheme,
} from "@mui/material";
import { TreeItem } from "@mui/x-tree-view/TreeItem";

import InputAdornment from "@mui/material/InputAdornment";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { IframeHelpDialog } from "./events/IframeHelpDialog";

const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
  "& .MuiTreeItem-content": {
    paddingTop: "12px",
    paddingBottom: "12px",
    flexDirection: "row-reverse",
  },
}));

export const VolunteerSignUps = ({
  isEdit,
  volunteerHeaderText,
  setVolunteerHeaderText,
  signUpFormId,
  setSignUpFormId,
}) => {
  const [isEditingValues, setEditingValues] = useState(false);
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

  if (isEditingValues || !signUpFormId) {
    return (
      <>
        <IframeHelpDialog
          open={isShowIframeHelpDialog}
          handleClose={hideIframeHelpDialog}
        />
        <Grid item xs={12} display="flex" flexDirection="column">
          <Typography
            variant="h4"
            component="h2"
            color="primary"
            textAlign="center"
            gutterBottom
          >
            {volunteerHeaderText
              ? volunteerHeaderText
              : "Sign Up as a Volunteer"}
            <Button>Close Form</Button>
          </Typography>

          <Grid
            item
            xs={12}
            display="flex"
            flexDirection="row"
            alignItems="center"
          >
            <Typography variant="body" textAlign="left">
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
            error={error}
            helperText={error ? error : ""}
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
        <Typography
          variant="h4"
          component="h2"
          color="primary"
          textAlign="center"
          gutterBottom
        >
          {volunteerHeaderText ? volunteerHeaderText : "Sign up as a Volunteer"}
        </Typography>

        <Card sx={{ padding: 2, marginTop: 2 }}>
          <Grid
            item
            xs={12}
            display="flex"
            justifyContent="center"
            flexDirection="column"
          >
            <iframe
              src={`https://docs.google.com/forms/d/e/${signUpFormId}/viewform?embedded=true`}
              width="100%"
              height="500px"
              frameBorder="0"
              marginHeight="0"
              marginWidth="0"
            >
              Loading…
            </iframe>
            {isEdit && (
              <Button
                sx={{ mx: "auto" }}
                variant="outlined"
                onClick={toggleEditing}
              >
                Edit
              </Button>
            )}
          </Grid>
        </Card>
      </div>
    );
  }
};
