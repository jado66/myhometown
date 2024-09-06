"use client";
import { Box, Grid, Typography } from "@mui/material";

import Link from "next/link";

export const CommunityCard = ({ imageSrc, title, href, index }) => {
  return (
    <Grid
      item
      xs={12}
      sm={6}
      sx={{ mx: "auto" }}
      display="flex"
      justifyContent="center"
      flexDirection="column"
    >
      <Typography variant="h5" textAlign="center" mb={2} mt={index > 1 ? 2 : 0}>
        {title}
      </Typography>
      <Link href={href}>
        <Grid item>
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
          </Box>
        </Grid>
      </Link>
    </Grid>
  );
};
