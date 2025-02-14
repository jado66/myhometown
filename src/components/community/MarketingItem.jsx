import React from "react";
import { Grid, Box, Typography } from "@mui/material";

const MarketingItem = ({
  index = 1,
  marginTop = 0,
  content,
  communityData,
  openImageDialog,
}) => {
  const headerKey = `marketingHeader${index === 1 ? "" : index}`;
  const imageKey = `marketingImage${index}`;

  return (
    <Grid item xs={12} md={6} display="flex" flexDirection="column">
      <Typography
        variant="h4"
        sx={{
          fontSize: "2rem",
          textAlign: "center",
          color: "#00357d",
          textTransform: "capitalize",
          fontFamily: "inherit",
          margin: 0,
          padding: "10px 16px",
          mt: { md: 0, xs: marginTop },
        }}
      >
        {content?.[headerKey] || "Flyer Title"}
      </Typography>

      <Box
        display="flex"
        justifyContent="center"
        position="relative"
        sx={{
          px: 1,
          display: "flex",
          width: "100%",
          backgroundColor: "transparent",
          flexGrow: index === 2 ? 1 : "unset",
          minHeight: index === 2 ? "100px" : "unset",
        }}
      >
        {communityData.content?.[imageKey] ? (
          <Box
            component="img"
            src={communityData.content[imageKey]}
            sx={{
              width: "100%",
              height: "auto",
              flexGrow: 1,
              objectFit: "cover",
              boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
              borderRadius: 4,
              aspectRatio: "8 / 11",
              cursor: openImageDialog ? "pointer" : "default",
            }}
            onClick={() => openImageDialog?.(communityData.content[imageKey])}
          />
        ) : (
          <Typography variant="h4" component="h2" align="center">
            Marketing Image {index}
          </Typography>
        )}
      </Box>
    </Grid>
  );
};

export default MarketingItem;
