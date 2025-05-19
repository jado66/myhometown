import React from "react";
import { Box, Typography, TextField, Button, Divider } from "@mui/material";
import { AttachFile, Image } from "@mui/icons-material";
import MediaPreview from "./MediaPreview";
import { toast } from "react-toastify";

const MAX_ATTACHMENTS = 10;
const MAX_TOTAL_SIZE_MB = 5;
const MAX_TOTAL_SIZE_BYTES = MAX_TOTAL_SIZE_MB * 1024 * 1024;

const MessageComposer = ({
  message,
  onMessageChange,
  mediaFiles,
  setMediaFiles,
  totalFileSize,
  setTotalFileSize,
  isUploading,
  setIsUploading,
}) => {
  const handleFileSelect = async (event) => {
    const files = Array.from(event.target.files);
    if (mediaFiles.length + files.length > MAX_ATTACHMENTS) {
      toast.error(`Maximum ${MAX_ATTACHMENTS} attachments allowed`);
      return;
    }
    const newTotalSize = files.reduce(
      (acc, file) => acc + file.size,
      totalFileSize
    );
    if (newTotalSize > MAX_TOTAL_SIZE_BYTES) {
      toast.error(
        `Total file size must be less than ${MAX_TOTAL_SIZE_MB}MB. Current total: ${formatFileSize(
          newTotalSize
        )}`
      );
      return;
    }
    setIsUploading(true);
    try {
      for (const file of files) {
        const sanitizedFilename = file.name.replace(/\s+/g, "_");
        const response = await fetch("/api/database/media/s3/getPresignedUrl", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            filename: sanitizedFilename,
            contentType: file.type,
            originalFilename: sanitizedFilename,
          }),
        });
        if (!response.ok) throw new Error("Failed to get presigned URL");
        const { url, fields } = await response.json();
        const formData = new FormData();
        Object.entries(fields).forEach(([key, value]) =>
          formData.append(key, value)
        );
        formData.append("file", file);
        const uploadResponse = await fetch(url, {
          method: "POST",
          body: formData,
        });
        if (!uploadResponse.ok) throw new Error("Upload failed");
        const bucketName =
          fields.bucket || process.env.NEXT_PUBLIC_AWS_BUCKET_NAME;
        const mediaUrl = `https://${bucketName}.s3.us-west-1.amazonaws.com/${encodeURIComponent(
          fields.key
        )}`;
        setMediaFiles((prev) => [
          ...prev,
          {
            url: mediaUrl,
            preview: URL.createObjectURL(file),
            type: file.type,
            size: file.size,
          },
        ]);
        setTotalFileSize((prev) => prev + file.size);
      }
      toast.success("Media uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload media: " + error.message);
    } finally {
      setIsUploading(false);
      event.target.value = "";
    }
  };

  const handleRemoveMedia = (index) => {
    setMediaFiles((prev) => {
      const removedFile = prev[index];
      setTotalFileSize((prevSize) => prevSize - (removedFile.size || 0));
      return prev.filter((_, i) => i !== index);
    });
  };

  return (
    <Box>
      <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
        Message Content
      </Typography>
      <TextField
        fullWidth
        multiline
        rows={4}
        variant="outlined"
        value={message}
        onChange={(e) => onMessageChange(e.target.value)}
        sx={{ mb: 2 }}
        error={message.length > 1600}
        helperText={
          message.length > 1600 && "MMS messages are limited to 1600 characters"
        }
      />
      <Divider sx={{ mb: 2 }} />
      <Box sx={{ mb: 2 }}>
        <input
          type="file"
          accept="image/*,video/*"
          multiple
          style={{ display: "none" }}
          id="media-upload"
          onChange={handleFileSelect}
        />
        <label htmlFor="media-upload">
          <Button
            variant="outlined"
            component="span"
            startIcon={<Image />}
            disabled={isUploading || mediaFiles.length >= MAX_ATTACHMENTS}
          >
            {isUploading ? "Uploading..." : "Attach Image"}
          </Button>
        </label>

        {mediaFiles.length > 0 && (
          <MediaPreview
            files={mediaFiles}
            onRemove={handleRemoveMedia}
            showRemove
          />
        )}
      </Box>
    </Box>
  );
};

export default MessageComposer;
