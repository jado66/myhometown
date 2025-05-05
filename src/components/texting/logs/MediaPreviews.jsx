import { LightBox } from "@/components/LightBox";
import { Box, Typography, ImageList, ImageListItem } from "@mui/material";
import React, { useState } from "react";

/**
 * MediaPreviews component to display media attachments with thumbnails and lightbox
 *
 * @param {Object} props - Component props
 * @param {Array|string} props.mediaUrls - Array of media URLs or JSON string
 * @param {number} props.thumbnailSize - Size of thumbnails in pixels (default: 100)
 * @param {number} props.columns - Number of columns in the image grid (default: 3)
 * @returns {JSX.Element|null} The MediaPreviews component or null if no media
 */
const MediaPreviews = ({ mediaUrls, thumbnailSize = 100, columns = 3 }) => {
  // State to track the currently selected image for the lightbox
  const [selectedImage, setSelectedImage] = useState(null);

  // Handle closing the lightbox dialog
  const closeImageDialog = () => {
    setSelectedImage(null);
  };

  if (!mediaUrls || mediaUrls.length === 0) return null;

  let urls = [];
  try {
    urls = typeof mediaUrls === "string" ? JSON.parse(mediaUrls) : mediaUrls;
  } catch (error) {
    console.error("Error parsing media URLs:", error);
    return <Typography color="error">Error loading media</Typography>;
  }

  return (
    <>
      <Box sx={{ mt: 2, mb: 1 }}>
        <ImageList
          cols={columns}
          gap={8}
          sx={{
            maxWidth: thumbnailSize * columns + (columns - 1) * 8,
            overflow: "visible",
          }}
        >
          {urls.map((url, index) => (
            <ImageListItem
              key={index}
              sx={{
                width: thumbnailSize,
                height: thumbnailSize,
                cursor: "pointer",
                "&:hover": {
                  opacity: 0.8,
                  transition: "opacity 0.3s",
                },
              }}
              onClick={() => setSelectedImage(url)}
            >
              <img
                src={url}
                alt={`Media ${index + 1}`}
                loading="lazy"
                style={{
                  width: thumbnailSize,
                  height: thumbnailSize,
                  objectFit: "cover",
                  borderRadius: "4px",
                  border: "1px solid #e0e0e0",
                }}
              />
            </ImageListItem>
          ))}
        </ImageList>
      </Box>

      {/* LightBox component for full-size image viewing */}
      <LightBox image={selectedImage} closeImageDialog={closeImageDialog} />
    </>
  );
};

export default MediaPreviews;
