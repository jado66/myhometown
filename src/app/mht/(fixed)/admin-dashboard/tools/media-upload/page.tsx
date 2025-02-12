"use client";
import React, { useState, useRef } from "react";
import {
  Container,
  Grid,
  Tooltip,
  LinearProgress,
  Typography,
  Paper,
  Button,
} from "@mui/material";
import { useUploadFile } from "@/hooks/use-upload-file";
import { VideoLibrary } from "@mui/icons-material";
import { toast } from "react-toastify";
import Loading from "@/components/util/Loading";

function UploadMedia({ setUrl }) {
  const { uploadToS3, uploading, progress } = useUploadFile();
  const fileInput = useRef();

  const handleFileUpload = async (event) => {
    event.stopPropagation();

    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      const result = await uploadToS3(file);

      if (result) {
        console.log("Successfully uploaded file.");
        toast.success("Media uploaded successfully!", {
          toastId: "video-uploaded-successfully",
          autoClose: 10000,
        });
      }
    } else {
      console.log("No file selected.");
    }
  };

  const handleClick = (event) => {
    event.nativeEvent.stopImmediatePropagation();
    event.stopPropagation();
    fileInput.current.click();
  };

  return (
    <Container>
      <Typography variant="h4" gutterBottom>
        Upload Media
      </Typography>
      <Paper elevation={3} sx={{ padding: "1em" }}>
        <Grid
          container
          direction="column"
          alignItems="center"
          justifyContent="center"
          sx={{
            position: "relative",
            width: "100%",
            height: "200px",
            padding: "1em",
          }}
        >
          <input
            type="file"
            onChange={handleFileUpload}
            style={{ display: "none" }}
            ref={fileInput}
            multiple={false}
            accept="video/*,image/*,.pdf,image/webp"
          />
          {!uploading ? (
            <Button
              variant="outlined"
              sx={{
                position: "absolute",
                top: "50%",
                transform: "translateY(-50%)",
                margin: "0.5em",
              }}
              onClick={handleClick}
            >
              Click to Upload Media{" "}
              <VideoLibrary fontSize="large" sx={{ ml: 2 }} />
            </Button>
          ) : (
            <Grid item xs={12} sx={{ width: "100%", position: "relative" }}>
              <LinearProgress variant="determinate" value={progress} />
              <Typography
                variant="body2"
                color="textSecondary"
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                }}
              >
                {`${Math.round(progress)}%`}
              </Typography>
            </Grid>
          )}
        </Grid>
      </Paper>
    </Container>
  );
}

export default UploadMedia;
