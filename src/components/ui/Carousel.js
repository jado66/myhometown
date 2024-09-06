import React, { useRef } from "react";
import Slider from "react-slick";
import { Box, Typography, Container, Paper, Button } from "@mui/material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import UploadImage from "../util/UploadImage";
import { AddPhotoAlternate } from "@mui/icons-material";
import { useImageUpload } from "@/hooks/use-upload-image";

const CarouselComponent = ({
  images,
  isEdit,
  addCarouselImage,
  editCarouselImage,
  removeCarouselImage,
}) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: !isEdit,
    autoplaySpeed: 3000,
  };
  const fileInputRef = useRef(null);

  const { handleFileUpload, loading, error } = useImageUpload((newUrl) =>
    addCarouselImage(newUrl)
  );

  if (!images) {
    return null;
  }

  return (
    <Box my={3}>
      <Slider {...settings}>
        {images.map((image, index) => (
          <Box
            key={index}
            sx={{
              padding: 1,
              position: "relative",
            }}
          >
            {isEdit && (
              <UploadImage
                setUrl={(newUrl) => editCarouselImage(index, newUrl)}
                onRemove={() => {
                  removeCarouselImage(index);
                }}
                right="5%"
              />
            )}
            <img
              src={image}
              alt={`slide ${index}`}
              style={{
                width: "100%",
                borderRadius: "12px",
                boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
              }}
            />
          </Box>
        ))}
        {isEdit && (
          <Box
            sx={{
              padding: 1,
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
              my: "auto",
              borderRadius: "12px",
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
              onClick={() => fileInputRef.current.click()}
              sx={{
                width: "100%",
                height: "80px",
              }}
              // variant="outlined"
            >
              {loading ? (
                <Loading size={25} />
              ) : (
                <AddPhotoAlternate fontSize="large" />
              )}{" "}
              Add Slide
            </Button>
            {error && <p>Error: {error}</p>}
          </Box>
        )}
      </Slider>
    </Box>
  );
};

export default CarouselComponent;
