import { Box, useMediaQuery } from "@mui/material";

export const ResponsiveVideoBanner = ({ src }) => {
  // Aspect ratio of 3440:1000 (from the original video dimensions)

  const isMd = useMediaQuery((theme) => theme.breakpoints.up("md"));

  const aspectRatio = (1000 / 3440) * 100;

  return (
    <Box
      sx={{
        position: "relative",
        top: { md: "14px", sm: "8px" },
        width: "100%",
        paddingTop: `calc(${aspectRatio}% + 24px)`, // This creates the aspect ratio
        overflow: "hidden",
      }}
    >
      {isMd ? (
        <Box
          component="video"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          autoPlay
          loop
          muted
          controls
          playsInline
        >
          <source src={src} type="video/webm" />
          Your browser does not support the video tag.
        </Box>
      ) : (
        <Box
          component="video"
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
          }}
          autoPlay
          loop
          muted
          // controls
          playsInline
        >
          <source src={src} type="video/webm" />
          Your browser does not support the video tag.
        </Box>
      )}
    </Box>
  );
};
