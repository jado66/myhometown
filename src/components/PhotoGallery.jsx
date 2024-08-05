import React, { useState } from "react";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import ImageList from "@mui/material/ImageList";
import ImageListItem from "@mui/material/ImageListItem";
import UploadImage from "@/components/util/UploadImage";
import { Image as ImageIcon } from "@mui/icons-material";
import { LightBox } from "./LightBox";

const PhotoGallery = ({ isEdit, photos, changePhoto, variant = "default" }) => {
  const theme = useTheme();
  const [selectedImage, setSelectedImage] = useState();

  const isMd = useMediaQuery(theme.breakpoints.up("md"), {
    defaultMatches: true,
  });

  if (!photos) {
    return null;
  }

  const openImageDialog = (image) => {
    if (isEdit) return;
    setSelectedImage(image);
  };

  const closeImageDialog = () => {
    setSelectedImage(null);
  };

  const handlePhotoChange = (url, key) => {
    changePhoto(url, key);
  };

  // Define different photo layouts based on the variant
  const getPhotoLayout = () => {
    switch (variant) {
      case "variant1":
        return isMd
          ? [
              { key: 1, cols: 2, rows: 2 },
              { key: 2, cols: 2, rows: 1 },
              { key: 3, cols: 2, rows: 1 },
              { key: 4, cols: 1, rows: 1 },
              { key: 5, cols: 1, rows: 1 },
            ]
          : [
              { key: 1, cols: 2, rows: 2 },
              { key: 2, cols: 2, rows: 1 },
              { key: 3, cols: 1, rows: 1 },
              { key: 4, cols: 1, rows: 1 },
            ];
      case "variant2":
        return [{ key: 1, cols: 12, rows: 2 }];
      default:
        return isMd
          ? [
              { key: 1, cols: 3, rows: 3 },
              { key: 2, cols: 6, rows: 1.5 },
              { key: 3, cols: 3, rows: 1.5 },
              { key: 4, cols: 3, rows: 1.5 },
              { key: 5, cols: 6, rows: 1.5 },
            ]
          : [
              { key: 2, cols: 12, rows: 2 },
              { key: 1, cols: 6, rows: 4 },
              { key: 3, cols: 6, rows: 2 },
              { key: 4, cols: 6, rows: 2 },

              { key: 5, cols: 12, rows: 2 },
            ];
    }
  };

  const photoLayout = getPhotoLayout();

  return (
    <Box>
      <ImageList
        variant="quilted"
        cols={12}
        rowHeight={isMd ? 150 : 110}
        gap={isMd ? 16 : 8}
        sx={{ overflow: "visible" }} // Allow overflow to show box shadow
      >
        {photoLayout.map(({ key, cols, rows }) => {
          let item = photos[key];
          return (
            <ImageListItem
              key={key}
              cols={cols}
              rows={rows}
              sx={{
                position: "relative",
                overflow: "visible", // Allow overflow to show box shadow
                borderRadius: "16px", // Apply border radius to ImageListItem
              }}
              onClick={() => openImageDialog(item?.src)}
            >
              {isEdit && (
                <UploadImage setUrl={(url) => handlePhotoChange(url, key)} />
              )}
              {item?.src ? (
                <Box
                  component="img"
                  src={item.src}
                  alt="..."
                  loading="lazy"
                  sx={{
                    height: "100%",
                    width: "100%",
                    objectFit: "cover",
                    cursor: "pointer",
                    borderRadius: "16px",
                    boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
                    transition: "box-shadow 0.3s ease-in-out",
                    "&:hover": {
                      boxShadow: "0px 4px 12px 0px rgba(0, 0, 0, 0.7)",
                    },
                  }}
                />
              ) : (
                <Box
                  sx={{
                    height: "100%",
                    width: "100%",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    backgroundColor: "lightgrey",
                    fontSize: "48px",
                    borderRadius: "16px",
                  }}
                >
                  <ImageIcon fontSize="inherit" />
                </Box>
              )}
            </ImageListItem>
          );
        })}
      </ImageList>
      <LightBox closeImageDialog={closeImageDialog} image={selectedImage} />
    </Box>
  );
};

export default PhotoGallery;
