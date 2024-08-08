import React, { useEffect, useState } from "react";
import {
  Button,
  Grid,
  Typography,
  TextField,
  Divider,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { IconSelect } from "./IconSelect";

export const CreateClassForm = ({
  category,
  initialData,
  onCreateSubclass,
  onUpdateSubclass,
  onClose,
  showIframeHelpDialog,
}) => {
  const [title, setTitle] = useState(initialData ? initialData.title : "");
  const [googleFormIframe, setGoogleFormIframe] = useState(
    initialData
      ? `<iframe src="https://docs.google.com/forms/d/e/${initialData.googleFormID}/viewform?embedded=true" width="640" height="551" frameborder="0" marginheight="0" marginwidth="0">Loading…</iframe>`
      : ""
  );
  const [icon, setIcon] = useState(initialData ? initialData.icon : "None");
  const [isOnlyClass, setIsOnlyClass] = useState(false);

  useEffect(() => {
    if (isOnlyClass) {
      setIcon(category.icon);
      setTitle(category.title);
    }
  }, [isOnlyClass]);

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

  const handleSubmit = () => {
    if (initialData) {
      onUpdateSubclass(category.id, initialData.id, icon, title, googleFormId);
    } else {
      onCreateSubclass(category.id, icon, title, googleFormId);
    }
    setTitle(""); // Reset after submission
    setGoogleFormIframe(""); // Reset after submission
    onClose();
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
            {initialData ? "Edit Class" : `Add Class to ${category.title}`}
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
          <Grid item xs={9} sm={9}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isOnlyClass}
                  onChange={(e) => {
                    e.stopPropagation();
                    setIsOnlyClass((prev) => !prev);
                  }}
                  color="primary"
                />
              }
              label="Is this the only class in this category?"
            />
          </Grid>

          <Grid item xs={12}>
            <Divider />
          </Grid>
          <Grid item xs={3} sm={3} display={isOnlyClass ? "none" : "block"}>
            <IconSelect
              onClick={(e) => {
                e.stopPropagation();
              }}
              onSelect={(e) => {
                setIcon(e.target.value);
                e.stopPropagation();
              }}
              icon={icon}
              disabled={isOnlyClass}
            />
          </Grid>
          <Grid item xs={9} sm={9} display={isOnlyClass ? "none" : "block"}>
            <TextField
              fullWidth
              size="small"
              value={title}
              label="Class Title"
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
              onChange={(e) => {
                setTitle(e.target.value);
                e.stopPropagation();
              }}
              margin="normal"
              InputProps={{
                style: { height: "47px" },
              }}
              error={title.length > MAX_TITLE_LENGTH}
              helperText={
                title.length > MAX_TITLE_LENGTH ? "Title is too long." : ""
              }
              disabled={isOnlyClass}
            />
          </Grid>
          <Grid item xs={12} display={isOnlyClass ? "none" : "block"}>
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
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
              onChange={(e) => {
                setGoogleFormIframe(e.target.value);
                e.stopPropagation();
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
            <Button fullWidth onClick={onClose}>
              Cancel
            </Button>
          </Grid>
          <Grid item xs={4} sm={8} />

          <Grid item xs={4} sm={2}>
            <Button
              variant="contained"
              fullWidth
              onClick={handleSubmit}
              disabled={!isFormValid()}
            >
              {initialData ? "Update Class" : "Add Class"}
            </Button>
          </Grid>
        </Grid>
      </Grid>
    </>
  );
};
