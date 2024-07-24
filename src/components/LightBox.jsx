import { Dialog } from "@mui/material";
import React, { useState, useEffect } from "react";

export const LightBox = ({ closeImageDialog, image }) => {
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [hasCalculated, setHasCalculated] = useState(false);

  const getImageDimensions = (src) => {
    return new Promise((resolve) => {
      let img = new Image();
      img.onload = () => resolve({ width: img.width, height: img.height });
      img.src = src;
    });
  };

  useEffect(() => {
    if (image) {
      setHasCalculated(false);
      getImageDimensions(image).then((dims) => {
        setImageSize(dims);
        setHasCalculated(true);
      });
    }
  }, [image]);

  const isPortrait = imageSize.height > imageSize.width;

  return (
    <Dialog
      open={!!image}
      onClose={closeImageDialog}
      fullScreen
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
      }}
      PaperProps={{
        style: {
          backgroundColor: "transparent",
          boxShadow: "none",
        },
      }}
      onClick={closeImageDialog}
    >
      <div
        style={{
          backgroundColor: "transparent",
          margin: "auto",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: isPortrait ? "90vh" : "auto",
          width: isPortrait ? "auto" : "90vw",
        }}
      >
        {hasCalculated && (
          <img
            src={image}
            alt="dialog"
            style={{
              maxHeight: isPortrait ? "100%" : "90vh",
              maxWidth: isPortrait ? "auto" : "100%",
              objectFit: "contain",
            }}
          />
        )}
      </div>
    </Dialog>
  );
};
