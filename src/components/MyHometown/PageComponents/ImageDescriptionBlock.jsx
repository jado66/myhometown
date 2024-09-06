"use client";
import UploadImage from "@/components/util/UploadImage";
import { Box, Grid, Typography } from "@mui/material";
import StyledTextField from "./StyledTextField";

export const ImageDescriptionBlock = ({
  index,
  content,
  imageSrc,
  setImageSrc,
  editText,
  isEdit,
}) => {
  const descriptionContent = (
    <Grid
      item
      xs={12}
      sm={6}
      sx={{
        padding: 4,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {isEdit ? (
        <StyledTextField
          variant="outlined" // Assuming you meant 'outlined' instead of 'h6'
          sx={{
            color: "black",
            fontSize: "larger",
            mt: "auto",
            mb: "auto",
            fontSize: "larger",
          }}
          value={content}
          onChange={(newText) => editText(index, newText)}
        />
      ) : (
        <Typography
          variant="body1"
          sx={{
            color: "black",
            fontSize: "larger",
            mt: "auto",
            mb: "auto",
            fontSize: "larger",
          }}
        >
          {content}
        </Typography>
      )}
    </Grid>
  );
  const imageContent = (
    <Grid item xs={12} sm={6} sx={{ padding: 2, pt: { xs: 0, sm: 2 } }}>
      <Grid
        item
        xs={12}
        sx={{
          backgroundColor: "grey",
          height: "150px",
          overflow: "hidden",
          position: "relative",
          boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
          borderRadius: 3,
        }}
      >
        <Box
          component="img"
          src={imageSrc}
          alt="Mental Health"
          // Lazy load the image
          sx={{
            borderRadius: 3,
            width: "100%",
            height: "100%",
            objectFit: "cover", // Ensures the image covers the entire area
            position: "absolute",
            objectPosition: "center", // Centers the image horizontally
            top: "0",
            left: "0px",
          }}
        />
        {isEdit && (
          // <span>HE</span>
          <>
            <UploadImage
              setUrl={(newUrl) => setImageSrc(index, newUrl)}
              alwaysShow
            />
          </>
        )}
      </Grid>
    </Grid>
  );

  return (
    <>
      {index % 2 !== 0 ? (
        <>
          {imageContent}
          {descriptionContent}
        </>
      ) : (
        <>
          {descriptionContent}
          {imageContent}
        </>
      )}
    </>
  );
};
