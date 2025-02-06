"use client";
import UploadImage from "@/components/util/UploadImage";
import { Box, Button, Grid, Typography } from "@mui/material";
import Link from "next/link";

export const CommunityCard = ({
  imageSrc,
  title,
  href,
  index,
  isEdit,
  setUrl,
  totalCommunities,
}) => {
  const ImageContent = (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      position="relative"
      sx={{
        width: "100%",
        height: "100%",
        backgroundColor: "transparent",
      }}
    >
      <Box
        component="img"
        src={imageSrc}
        style={{
          cursor: "pointer",
          width: "100%",
          height: "auto",
          objectFit: "cover",
          borderRadius: "12px",
          boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
        }}
      />
      {isEdit && <UploadImage setUrl={setUrl} />}
    </Box>
  );

  return (
    <Grid
      item
      xs={12}
      sm={totalCommunities > 3 ? 6 : 4}
      sx={{ mx: "auto" }}
      display="flex"
      justifyContent="center"
      flexDirection="column"
    >
      <Typography variant="h5" textAlign="center" mb={2} mt={index > 1 ? 2 : 0}>
        {title}
      </Typography>

      {isEdit ? (
        <>
          {ImageContent}
          <Button href={href} variant="outlined" sx={{ mt: 2, mx: "auto" }}>
            Edit Community
          </Button>
        </> // Render the image content directly without link
      ) : (
        <Link href={href}>{ImageContent}</Link> // Wrap the image content with a link
      )}
    </Grid>
  );
};
