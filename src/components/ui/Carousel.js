import React from "react";
import Slider from "react-slick";
import { Box, Typography, Container, Paper } from "@mui/material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const CarouselComponent = ({ images }) => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3, // Display three images at once
    slidesToScroll: 1,
    autoplay: true, // Enable autoplay
    autoplaySpeed: 3000, // Slide transition every 2 seconds
  };

  return (
    <Box my={3}>
      <Slider {...settings}>
        {images.map((image, index) => (
          <Box
            key={index}
            sx={{
              padding: 1,
            }}
          >
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
      </Slider>
    </Box>
  );
};

export default CarouselComponent;
