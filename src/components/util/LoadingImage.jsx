import React, { useState, useEffect } from "react";
import { Box, Skeleton } from "@mui/material";

const LoadingImage = ({
  src,
  alt,
  height = "350px",
  objectPosition = "center",
  boxSx,
  sx,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    const img = new Image();
    img.src = src;

    if (img.complete) {
      setImageLoaded(true);
    }

    const handleLoad = () => {
      setImageLoaded(true);
    };

    img.addEventListener("load", handleLoad);

    return () => {
      img.removeEventListener("load", handleLoad);
    };
  }, [src]);

  return (
    <Box
      sx={{
        height: height,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
        display: "flex",
        justifyContent: "center",
        ...boxSx,
      }}
    >
      <Skeleton
        variant="rectangular"
        width="100%"
        height="100%"
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          zIndex: 1,
          opacity: imageLoaded ? 0 : 1,
          transition: "opacity 0.3s ease-in-out",
        }}
      />

      <Box
        component="img"
        src={src}
        alt={alt}
        sx={{
          height: "100%",
          width: "auto",
          objectFit: "cover",
          objectPosition: objectPosition,
          display: "block",
          opacity: imageLoaded ? 1 : 0,
          transition: "opacity 0.3s ease-in-out",
          zIndex: 2,
          ...sx,
        }}
      />
    </Box>
  );
};

export default LoadingImage;
