"use client";
import React, { useState, useRef } from "react";
import { Grid, IconButton, Tooltip, LinearProgress } from "@mui/material";
import { useUploadFile } from "@/hooks/use-upload-file";
import { VideoLibrary } from "@mui/icons-material";
import Loading from "./Loading";
import { toast } from "react-toastify";

function UploadMedia({ setUrl }) {
  const { uploadToS3, uploading, progress } = useUploadFile();
  const fileInput = useRef();

  const [isVisible, setIsVisible] = useState(false);

  const handleFileUpload = async (event) => {
    event.stopPropagation();

    if (event.target.files.length > 0) {
      const file = event.target.files[0];
      try {
        console.log("Starting file upload...");
        const result = await uploadToS3(file);

        if (result) {
          console.log("Successfully uploaded file. Result:", result);
          toast.success(
            "Video uploaded successfully. Make sure to save your changes.",
            {
              toastId: "video-uploaded-successfully",
            }
          );
          setUrl(result.url);
        } else {
          console.error("Upload failed: No result returned");
          toast.error("Upload failed. Please try again.");
        }
      } catch (error) {
        console.error("Error during file upload:", error);
        toast.error(`Upload failed: ${error.message}`);
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
    <Grid
      container
      alignItems="center"
      justifyContent="center"
      sx={{
        position: "absolute",
        zIndex: 2,
        width: "100%",
        height: "100%",
      }}
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      <input
        type="file"
        onChange={handleFileUpload}
        style={{ display: "none" }}
        ref={fileInput}
        multiple={false}
        accept="video/*"
      />
      {!uploading ? (
        <IconButton
          sx={{
            position: "absolute",
            top: "0%",
            right: "0%",
            color: "black",
            backgroundColor: "lightgrey",
            margin: "0.5em",
            opacity: isVisible ? 1 : 0,
            transition: "visibility 0.05s, opacity 0.5s linear",
            "&:hover": {
              backgroundColor: "white",
            },
          }}
          onClick={handleClick}
        >
          <VideoLibrary fontSize="12px" />
        </IconButton>
      ) : (
        <Grid
          item
          xs={12}
          sx={{ padding: "1em", display: "flex", justifyContent: "center" }}
        >
          <LinearProgress variant="determinate" value={progress} />
        </Grid>
      )}

      {uploading && <Loading size={25} />}
    </Grid>
  );
}

export default UploadMedia;
