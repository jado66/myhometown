import React from "react";
import Slider from "react-slick";
import { Box, Button } from "@mui/material";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const LogoCarouselComponent = ({ images, noDots, speed }) => {
  const settings = {
    dots: noDots ? false : true,
    infinite: true,
    speed: 1500,
    slidesToShow: 4,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 1500,
  };

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
            <Box
              component="img"
              src={image}
              alt={`slide ${index}`}
              sx={{
                width: "80%",
                mx: "auto",
                borderRadius: "12px",
              }}
            />
          </Box>
        ))}
      </Slider>
    </Box>
  );
};

export default LogoCarouselComponent;
