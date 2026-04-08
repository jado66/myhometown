// UploadMedia.jsx
"use client";
import React, { useState, useRef } from "react";
import {
  Grid,
  Button,
  LinearProgress,
  List,
  ListItem,
  Typography,
  Box,
  Paper,
} from "@mui/material";
import { useUploadFile } from "@/hooks/use-upload-file";
import { VideoLibrary, ContentCopy, Delete } from "@mui/icons-material";
import { toast } from "react-toastify";

function UploadMedia() {
  const { uploadToS3, uploading, progress } = useUploadFile();
  const fileInput = useRef();
  const [uploadedUrls, setUploadedUrls] = useState([]);

  const handleFileUpload = async (event) => {
    event.stopPropagation();
    const file = event.target.files[0];
    if (!file) return;

    try {
      const result = await uploadToS3(file);
      if (result?.url) {
        const newUpload = {
          url: result.url,
          filename: file.name,
          timestamp: new Date().toLocaleString(),
        };

        setUploadedUrls((prev) => [...prev, newUpload]);
        toast.success("Media uploaded successfully!", {
          toastId: `upload-${Date.now()}`,
        });
      }
    } catch (error) {
      toast.error(`Upload failed: ${error.message}`);
    }
  };

  const copyUrlToClipboard = (url) => {
    navigator.clipboard.writeText(url);
    toast.info("URL copied to clipboard!");
  };

  const copyAllUrls = () => {
    const allUrls = uploadedUrls.map((item) => item.url).join("\n");
    navigator.clipboard.writeText(allUrls);
    toast.info("All URLs copied to clipboard!");
  };

  const removeUrl = (index) => {
    setUploadedUrls((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center"
      sx={{ width: "100%", height: "100%", p: 2 }}
    >
      <input
        type="file"
        onChange={handleFileUpload}
        style={{ display: "none" }}
        ref={fileInput}
        accept="video/*,image/*,application/pdf,image/webp"
      />

      {!uploading ? (
        <Button
          variant="contained"
          color="primary"
          startIcon={<VideoLibrary />}
          onClick={() => fileInput.current.click()}
          sx={{ mb: 2 }}
        >
          Upload Media
        </Button>
      ) : (
        <Box sx={{ width: "50%", maxWidth: 400, mb: 2 }}>
          <LinearProgress
            variant="determinate"
            value={progress}
            sx={{ width: "100%" }}
          />
          <Typography variant="caption" align="center" display="block">
            Uploading: {Math.round(progress)}%
          </Typography>
        </Box>
      )}

      {uploadedUrls.length > 0 && (
        <Box sx={{ width: "100%", maxWidth: 600 }}>
          <Paper
            elevation={3}
            sx={{
              maxHeight: 400,
              overflow: "auto",
              p: 1,
              bgcolor: "white",
            }}
          >
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                mb: 1,
              }}
            >
              <Typography variant="subtitle2" sx={{ fontWeight: "bold" }}>
                Uploaded Media ({uploadedUrls.length})
              </Typography>
              <Button
                size="small"
                onClick={copyAllUrls}
                startIcon={<ContentCopy />}
              >
                Copy All
              </Button>
            </Box>
            <List
              dense
              sx={{
                userSelect: "text", // Allows text selection
              }}
            >
              {uploadedUrls.map((item, index) => (
                <ListItem
                  key={index}
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 0.5,
                  }}
                >
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: "medium" }}>
                      {item.filename}
                    </Typography>
                    <Typography
                      variant="caption"
                      sx={{ color: "text.secondary" }}
                    >
                      {item.timestamp} - {item.url}
                    </Typography>
                  </Box>
                  <Box>
                    <Button
                      size="small"
                      onClick={() => copyUrlToClipboard(item.url)}
                      startIcon={<ContentCopy />}
                      sx={{ minWidth: 0, mr: 1 }}
                    >
                      Copy
                    </Button>
                    <Button
                      size="small"
                      onClick={() => removeUrl(index)}
                      startIcon={<Delete />}
                      sx={{ minWidth: 0 }}
                    >
                      Delete
                    </Button>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Box>
      )}
    </Grid>
  );
}

export default UploadMedia;
