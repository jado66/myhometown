import { Box } from "@mui/material";

export const ResponsiveVideoBanner = ({ src }) => {
  // Aspect ratio of 3440:1000 (from the original video dimensions)
  const aspectRatio = (1000 / 3440) * 100;

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        paddingTop: `${aspectRatio}%`, // This creates the aspect ratio
        overflow: "hidden",
      }}
    >
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
        muted
        loop
        // controls
        playsInline
      >
        <source src={src} type="video/webm" />
        Your browser does not support the video tag.
      </Box>
    </Box>
  );
};
