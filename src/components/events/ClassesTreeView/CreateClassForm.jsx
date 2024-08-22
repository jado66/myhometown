import React, { useEffect, useState } from "react";
import {
  Button,
  Grid,
  Typography,
  TextField,
  Divider,
  FormControlLabel,
  Checkbox,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Box,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { IconSelect } from "./IconSelect";
import UploadImage from "@/components/util/UploadImage";

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
  const [contentType, setContentType] = useState(
    initialData.contentType || "form"
  );
  const [headerImage, setHeaderImage] = useState(initialData.headerImage || "");
  const [information, setInformation] = useState(initialData.information || "");

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

  const isFormValid = () => {
    if (contentType === "form") {
      return (
        title.length > 0 &&
        title.length <= MAX_TITLE_LENGTH &&
        googleFormId !== null
      );
    } else {
      return (
        title.length > 0 &&
        title.length <= MAX_TITLE_LENGTH &&
        information.trim().length > 0
      );
    }
  };

  const handleSubmit = () => {
    const data = {
      icon,
      title,
      contentType,
      headerImage,
      ...(contentType === "form" ? { googleFormId } : { information }),
    };

    if (initialData) {
      onUpdateSubclass(category.id, initialData.id, data);
    } else {
      onCreateSubclass(category.id, data);
    }

    setTitle("");
    setGoogleFormIframe("");
    setInformation("");
    setHeaderImage("");
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
        flexDirection="column"
        spacing={2}
        sx={{ p: 2 }}
      >
        <Grid item xs={12}>
          <Typography variant="h6" textAlign="center">
            {initialData ? "Edit Class" : `Add Class to ${category.title}`}
          </Typography>
        </Grid>

        <Grid item xs={12}>
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
              mb: 2,
            }}
          >
            <UploadImage setUrl={setHeaderImage} />
            {headerImage ? (
              <Box
                component="img"
                src={headerImage}
                sx={{
                  width: "100%",
                  borderRadius: 4,
                  height: "auto",
                  objectFit: "cover",
                }}
              />
            ) : (
              <Typography variant="h4" component="h2" align="center">
                Class Header Image
              </Typography>
            )}
          </Box>
        </Grid>
        <Divider sx={{ my: 3 }} />

        <Grid item xs={12}>
          <FormControlLabel
            control={
              <Checkbox
                checked={isOnlyClass}
                onChange={(e) => setIsOnlyClass(e.target.checked)}
              />
            }
            label="Is this the only class in this category?"
          />
        </Grid>

        <Grid item container spacing={2}>
          <Grid item xs={12} sm={3} display={isOnlyClass ? "none" : "block"}>
            <IconSelect
              onSelect={(e) => setIcon(e.target.value)}
              icon={icon}
              disabled={isOnlyClass}
            />
          </Grid>
          <Grid item xs={12} sm={9} display={isOnlyClass ? "none" : "block"}>
            <TextField
              fullWidth
              size="small"
              value={title}
              label="Class Title"
              onChange={(e) => setTitle(e.target.value)}
              error={title.length > MAX_TITLE_LENGTH}
              helperText={
                title.length > MAX_TITLE_LENGTH ? "Title is too long." : ""
              }
              disabled={isOnlyClass}
            />
          </Grid>
        </Grid>

        <Divider sx={{ my: 3 }} />
        <Grid item xs={12}>
          <FormControl component="fieldset">
            <FormLabel component="legend">Content Type</FormLabel>
            <RadioGroup
              row
              value={contentType}
              onChange={(e) => setContentType(e.target.value)}
            >
              <FormControlLabel value="form" control={<Radio />} label="Form" />
              <FormControlLabel
                value="information"
                control={<Radio />}
                label="Information"
              />
            </RadioGroup>
          </FormControl>
        </Grid>
        <Divider sx={{ my: 3 }} />

        {contentType === "form" ? (
          <Grid item xs={12}>
            <Typography variant="body2">
              Copy the link from Google Forms
            </Typography>
            <Button
              variant="outlined"
              onClick={showIframeHelpDialog}
              sx={{ ml: 2 }}
            >
              Get Help <HelpOutlineIcon sx={{ ml: 1 }} />
            </Button>
            <TextField
              fullWidth
              size="small"
              value={googleFormIframe}
              onChange={(e) => setGoogleFormIframe(e.target.value)}
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
        ) : (
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              rows={4}
              value={information}
              onChange={(e) => {
                setInformation(e.target.value);
                e.stopPropagation();
              }}
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
              label="Information"
              placeholder="Enter class information here"
            />
          </Grid>
        )}

        <Grid item container justifyContent="space-between">
          <Grid item>
            <Button onClick={onClose}>Cancel</Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
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
