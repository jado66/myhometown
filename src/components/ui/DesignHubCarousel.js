import React, { useRef } from "react";
import Slider from "react-slick";
import {
  Box,
  Button,
  useMediaQuery,
  useTheme,
  CircularProgress,
} from "@mui/material";
import { AddPhotoAlternate } from "@mui/icons-material";
import UploadImage from "../util/UploadImage";
import { useImageUpload } from "@/hooks/use-upload-image";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

// Carousel component with optional uniform height that preserves full image (no cropping)
// If `height` is provided: container gets fixed height, image scales by height (height:100%, width:auto)
// If `height` is omitted: image fills width (width:100%) and natural height flows.
const CarouselComponent = ({
  images = [],
  isEdit,
  addCarouselImage,
  editCarouselImage,
  removeCarouselImage,
  noDots,
  speed,
  onImageClick,
  height,
}) => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"));
  const fileInputRef = useRef(null);

  const settings = {
    dots: true,
    infinite: true,
    speed: speed || 500,
    slidesToShow: isMd ? 3 : 1,
    slidesToScroll: 1,
    autoplay: !isEdit,
    autoplaySpeed: 5000,
  };

  const { handleFileUpload, loading, error } = useImageUpload((newUrl) => {
    addCarouselImage && addCarouselImage(newUrl);
  });

  if (!images.length) return null;

  const resolvedHeight = height
    ? typeof height === "number"
      ? `${height}px`
      : height
    : undefined;

  return (
    <Box my={3}>
      <Slider {...settings}>
        {images.map((image, index) => (
          <Box key={index} sx={{ padding: 1, position: "relative" }}>
            {isEdit && (
              <UploadImage
                setUrl={(newUrl) =>
                  editCarouselImage && editCarouselImage(index, newUrl)
                }
                onRemove={() =>
                  removeCarouselImage && removeCarouselImage(index)
                }
                right="5%"
              />
            )}
            <Box
              sx={{
                width: "100%",
                height: resolvedHeight,
                borderRadius: "12px",
                position: "relative",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
              onClick={() => onImageClick && onImageClick(image)}
            >
              <Box
                component="img"
                src={image}
                alt={`slide ${index}`}
                sx={{
                  height: resolvedHeight ? "100%" : "auto",
                  width: resolvedHeight ? "auto" : "100%",
                  maxWidth: "100%",
                  objectFit: "contain",
                  cursor: onImageClick ? "pointer" : undefined,
                  display: "block",
                }}
              />
            </Box>
          </Box>
        ))}
        {isEdit && (
          <Box sx={{ padding: 1, position: "relative" }}>
            <Box
              sx={{
                width: "100%",
                height: resolvedHeight || 200,
                borderRadius: "12px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",

                border: "1px dashed #ccc",
                flexDirection: "column",
                gap: 1,
              }}
            >
              <input
                type="file"
                onChange={handleFileUpload}
                style={{ display: "none" }}
                ref={fileInputRef}
                multiple={false}
                accept="image/*"
              />
              <Button
                onClick={() =>
                  fileInputRef.current && fileInputRef.current.click()
                }
                sx={{ width: "100%", height: 80 }}
              >
                {loading ? (
                  <CircularProgress size={24} />
                ) : (
                  <AddPhotoAlternate fontSize="large" />
                )}
                &nbsp;Add Slide
              </Button>
              {error && (
                <p style={{ color: "red", margin: 0, fontSize: 12 }}>
                  Error: {error}
                </p>
              )}
            </Box>
          </Box>
        )}
      </Slider>
    </Box>
  );
};

export default CarouselComponent;
