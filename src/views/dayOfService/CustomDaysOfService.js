"use client";
import { useState, useEffect, useRef } from "react";
import {
  useTheme,
  Typography,
  Grid,
  Box,
  Button,
  TextField,
} from "@mui/material";
import { Edit, Save, Cancel, Link as LinkIcon } from "@mui/icons-material";
import useMediaQuery from "@mui/material/useMediaQuery";
import WysiwygEditor from "./WysiwygEditor";
import UploadImage from "@/components/util/UploadImage";
import { toast } from "react-toastify";

// Assuming you have this component available or will create it

export const CustomDaysOfServiceContent = ({
  isEditMode = false,
  onSave,
  initialContent = {},
}) => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const contentRef = useRef("");

  const [editing, setEditing] = useState(false);
  const [headerText] = useState(initialContent.headerText || "Days of Service");
  const [secondaryHeaderText, setSecondaryHeaderText] = useState(
    initialContent.secondaryHeaderText || ""
  );
  const [daysOfServiceImage, setImage] = useState(
    initialContent.daysOfServiceImage || ""
  );
  const [bodyContent, setBodyContent] = useState(
    initialContent.bodyContent ||
      `We're here to breathe new life into the community. We'll re-landscape
          yards and parks, refurbish homes, repaint fences, fix code violations
          and more. If there's a need, we're here to help.`
  );

  useEffect(() => {
    if (initialContent) {
      if (initialContent.secondaryHeaderText)
        setSecondaryHeaderText(initialContent.secondaryHeaderText);
      if (initialContent.daysOfServiceImage)
        setImage(initialContent.daysOfServiceImage);
      if (initialContent.bodyContent) {
        setBodyContent(initialContent.bodyContent);
        contentRef.current = initialContent.bodyContent;
      }
    }
  }, [initialContent]);

  const handleSave = () => {
    if (onSave) {
      onSave({
        headerText, // Keep the uneditable header text
        secondaryHeaderText,
        daysOfServiceImage: daysOfServiceImage,
        bodyContent,
        videoUrl: initialContent.videoUrl || "...",
        posterUrl: initialContent.posterUrl || "...",
      });
    }
    setEditing(false);
  };

  const handleCancel = () => {
    if (initialContent) {
      if (initialContent.secondaryHeaderText)
        setSecondaryHeaderText(initialContent.secondaryHeaderText);
      if (initialContent.daysOfServiceImage)
        setImage(initialContent.daysOfServiceImage);
      if (initialContent.bodyContent) {
        setBodyContent(initialContent.bodyContent);
        contentRef.current = initialContent.bodyContent;
      }
    }
    setEditing(false);
  };

  const handleContentChange = (html) => {
    setBodyContent(html);
    contentRef.current = html;
  };

  const handleChangeImage = (url) => {
    setImage(url);
  };

  return (
    <>
      {/* 1. Uneditable header at the top */}
      <Box sx={{ width: "100%", position: "relative" }}>
        <Typography
          variant="h2"
          textAlign="center"
          color="black"
          sx={{
            mt: 3,
            mb: { md: 0, xs: 3 },
            mx: "auto",
            fontWeight: 700,
          }}
        >
          {headerText}
        </Typography>
      </Box>

      {/* 2. Uneditable video section */}
      <Grid
        item
        xs={12}
        sx={{
          padding: { md: 4, xs: 3 },
          pb: 0,
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Box
          component="video"
          controls
          playsInline
          poster="https://myhometown-bucket.s3.us-west-1.amazonaws.com/uploads/DOS_Thumbnail.webp"
          sx={{
            mx: "auto",
            width: { md: "50%", xs: "100%" },
            height: "100%",
            borderRadius: "12px",
          }}
          src="https://myhometown-bucket.s3.us-west-1.amazonaws.com/videos/Days+of+Service+(Hey)+.webm"
          title="Video 1"
        />
      </Grid>

      <Grid
        item
        xs={12}
        sx={{
          padding: 4,
          pt: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* 3. Editable header */}
        {editing ? (
          <TextField
            fullWidth
            value={secondaryHeaderText}
            onChange={(e) => setSecondaryHeaderText(e.target.value)}
            variant="outlined"
            label="Section Header"
            InputProps={{
              style: {
                fontSize: "1.25rem",
                textAlign: "center",
              },
            }}
            sx={{
              mb: 3,
            }}
          />
        ) : (
          <>
            {secondaryHeaderText && (
              <Typography
                variant="h4"
                sx={{ textAlign: "center", mb: 3 }}
                id="days-of-service"
              >
                {secondaryHeaderText}
                {isEditMode && (
                  <Button
                    onClick={
                      // copy to clipboard
                      () => {
                        navigator.clipboard.writeText(
                          `${window.location.href}#days-of-service`.replace(
                            /edit\//g,
                            ""
                          )
                        );
                        toast.success("Link copied to clipboard");
                      }
                    }
                    variant="text"
                    sx={{ mb: 1 }}
                  >
                    <LinkIcon sx={{ mr: 1 }} />
                  </Button>
                )}
              </Typography>
            )}
          </>
        )}

        {/* 4. Editable image section */}
        <Grid
          item
          xs={12}
          display="flex"
          justifyContent="center"
          sx={{ mb: 3 }}
        >
          <Grid item xs={12}>
            <Box
              display="flex"
              justifyContent="center"
              alignItems="center"
              position="relative"
              sx={{
                width: "100%",
                height: "100%",
                backgroundColor: "transparent",
              }}
            >
              {editing && <UploadImage setUrl={handleChangeImage} />}
              {daysOfServiceImage ? (
                <img
                  src={daysOfServiceImage}
                  style={{
                    width: "100%",
                    height: "auto",
                    objectFit: "cover",
                  }}
                  alt="Community map"
                />
              ) : (
                <>
                  {editing ? (
                    <Typography
                      variant="h6"
                      component="h2"
                      align="center"
                      sx={{
                        height: "200px",
                        width: "100%",
                        backgroundColor: "lightgray",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      Banner Image
                    </Typography>
                  ) : null}
                </>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* 5. WYSIWYG editor */}
        {editing ? (
          <Box sx={{ mb: 3 }}>
            <WysiwygEditor
              content={bodyContent}
              onChange={handleContentChange}
              placeholder="Start writing..."
            />
          </Box>
        ) : (
          <Typography
            variant="body1"
            sx={{
              flexGrow: 1,
              color: "black",
              mb: 3,
              fontSize: "larger",
            }}
            dangerouslySetInnerHTML={{ __html: bodyContent }}
          />
        )}

        {isEditMode && (
          <>
            {!editing ? (
              <Button
                startIcon={<Edit />}
                variant="outlined"
                onClick={() => setEditing(true)}
                sx={{ alignSelf: "flex-end" }}
              >
                Edit Content
              </Button>
            ) : (
              <Box sx={{ display: "flex", gap: 2, alignSelf: "flex-end" }}>
                <Button
                  startIcon={<Cancel />}
                  variant="outlined"
                  color="error"
                  onClick={handleCancel}
                >
                  Cancel
                </Button>
                <Button
                  startIcon={<Save />}
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                >
                  Save Changes
                </Button>
              </Box>
            )}
          </>
        )}
      </Grid>
    </>
  );
};
