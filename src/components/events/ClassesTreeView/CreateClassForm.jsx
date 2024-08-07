import React, { useState } from "react";
import { Button, Grid, Typography, TextField, Divider } from "@mui/material";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

export const CreateClassForm = ({
  category,
  onCreateSubclass,
  onClose,
  showIframeHelpDialog,
}) => {
  const [title, setTitle] = useState("");
  const [googleFormIframe, setGoogleFormIframe] = useState("");
  const [icon, setIcon] = useState("None");

  const MAX_TITLE_LENGTH = 50;

  const extractGoogleFormId = (iframe) => {
    const match = iframe.match(
      /<iframe[^>]*src="https:\/\/docs\.google\.com\/forms\/d\/e\/([^"]+)\/viewform/
    );
    return match ? match[1] : null;
  };

  const googleFormId = extractGoogleFormId(googleFormIframe);

  // Debugging output
  console.log("Title:", title);
  console.log("Google Form Iframe:", googleFormIframe);
  console.log("Google Form ID:", googleFormId);

  const isFormValid = () => {
    const valid =
      title.length > 0 &&
      title.length <= MAX_TITLE_LENGTH &&
      googleFormId !== null;

    // More debugging output
    console.log("Is Form Valid:", valid);

    return valid;
  };

  return (
    <>
      <Divider />
      <Grid
        container
        item
        xs={12}
        display="flex"
        flexDirection="row"
        spacing={1}
        sx={{ p: 2 }}
        alignItems="center"
      >
        <Grid item xs={12}>
          <Typography variant="h6" textAlign="center">
            Add New Class
          </Typography>
        </Grid>
        <Grid
          container
          xs={12}
          display="flex"
          flexDirection="row"
          spacing={1}
          sx={{ px: 2 }}
          alignItems="center"
        >
          <Grid item xs={3} sm={3}>
            <IconSelect onSelect={(e) => setIcon(e.target.value)} icon={icon} />
          </Grid>
          <Grid item xs={9} sm={9}>
            <TextField
              fullWidth
              size="small"
              value={title}
              label="Class Title"
              onChange={(e) => {
                e.stopPropagation();
                setTitle(e.target.value);
              }}
              margin="normal"
              InputProps={{
                style: { height: "47px" },
              }}
              error={title.length > MAX_TITLE_LENGTH}
              helperText={
                title.length > MAX_TITLE_LENGTH ? "Title is too long." : ""
              }
            />
          </Grid>
          <Grid item xs={12} sm={7}>
            <Divider sx={{ mb: 3 }} />
          </Grid>
          <Grid item xs={12} sm={7} display="flex" flexDirection="column">
            <Grid item xs={12}>
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
              fullWidth
              size="small"
              value={googleFormIframe}
              onChange={(e) => {
                e.stopPropagation();
                setGoogleFormIframe(e.target.value);
              }}
              placeholder="Google Form iframe code"
              margin="normal"
              error={googleFormId === null && googleFormIframe.length > 0}
              helperText={
                googleFormId === null && googleFormIframe.length > 0
                  ? "Invalid iframe code."
                  : ""
              }
            />
          </Grid>
        </Grid>
        <Grid item xs={12} display="flex" flexDirection="row">
          <Grid item xs={4} sm={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={() => {
                onCreateSubclass(category.id, icon, title, googleFormId);
                setTitle(""); // Reset after adding
                setGoogleFormIframe(""); // Reset after adding
                onClose();
              }}
              disabled={!isFormValid()}
            >
              Add Class
            </Button>
          </Grid>
          <Grid item xs={4} sm={8} />
          <Grid item xs={4} sm={2}>
            <Button variant="contained" fullWidth onClick={onClose}>
              Cancel
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
