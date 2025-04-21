import React from "react";
import { Box, Typography, IconButton } from "@mui/material";
import { Clear } from "@mui/icons-material";
import { formatFileSize } from "@/util/texting/utils";

const MediaPreview = ({ files, onRemove, showRemove = false }) => (
  <Box sx={{ display: "flex", flexWrap: "wrap", gap: 2, mt: 2 }}>
    {files.map((file, index) => (
      <Box key={index} sx={{ position: "relative", display: "inline-block" }}>
        {file.type.startsWith("image/") ? (
          <img
            src={file.preview}
            alt={`Media ${index + 1}`}
            style={{
              width: "150px",
              height: "150px",
              objectFit: "cover",
              borderRadius: "4px",
            }}
          />
        ) : (
          <Box
            sx={{
              width: "150px",
              height: "150px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              bgcolor: "grey.200",
              borderRadius: "4px",
            }}
          >
            <Typography variant="body2">
              {file.type.split("/")[1].toUpperCase()} File
            </Typography>
          </Box>
        )}
        <Typography
          variant="caption"
          sx={{
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            bgcolor: "rgba(0, 0, 0, 0.6)",
            color: "white",
            padding: "4px",
            textAlign: "center",
          }}
        >
          {formatFileSize(file.size)}
        </Typography>
        {showRemove && (
          <IconButton
            size="small"
            sx={{
              position: "absolute",
              top: -8,
              right: -8,
              backgroundColor: "white",
              "&:hover": { backgroundColor: "grey.100" },
            }}
            onClick={() => onRemove(index)}
          >
            <Clear />
          </IconButton>
        )}
      </Box>
    ))}
  </Box>
);

export default MediaPreview;
