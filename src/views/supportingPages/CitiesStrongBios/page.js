// pages/bios.js

import * as React from "react";
import {
  Container,
  Grid,
  Box,
  Typography,
  Divider,
  Button,
} from "@mui/material";
import {
  boardOfDirectors,
  executiveCommittee,
} from "@/constants/boardOfDirectors";
import { KeyboardBackspace } from "@mui/icons-material";

export default function CitiesStrongBiosPage() {
  React.useEffect(() => {
    const urlHash = window.location.hash;
    if (urlHash) {
      const element = document.querySelector(urlHash);
      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "center" });
      }
    }
  }, []);

  return (
    <Container
      maxWidth="xl"
      sx={{
        mx: "auto",
        pb: "0 !important",
        pt: "50px !important",
      }}
    >
      <Grid container>
        <Box marginBottom={2}>
          <Button
            href="/about"
            sx={{
              fontWeight: "medium",
              justifyContent: "left",
              mt: 2,
              display: "flex",
              padding: 0, // This ensures the padding doesn't change
              textTransform: "none", // Prevents the button from uppercasing the text
            }}
          >
            <Typography
              sx={{
                fontWeight: "inherit", // Inherit parent font weight
                display: "flex",
              }}
              gutterBottom
              align="left"
            >
              <KeyboardBackspace sx={{ mr: 1 }} />
              Back to About Us
            </Typography>
          </Button>
          <Typography
            variant="h2"
            sx={{
              fontWeight: 700,
              textAlign: "center",
            }}
          >
            Our Team
          </Typography>
        </Box>

        {[...executiveCommittee, ...boardOfDirectors].map((person, index) => (
          <>
            <Grid
              container
              spacing={2}
              alignItems="start"
              key={index}
              id={`bio-${person.name.replace(/\s+/g, "-").toLowerCase()}`} // Adding the id here
              direction={index % 2 === 0 ? "row" : "row-reverse"}
            >
              <Grid item xs={12} md={4}>
                <Box
                  component="img"
                  src={person.avatar}
                  alt={`Picture of ${person.name}`}
                  sx={{
                    width: "100%",
                    height: "auto",
                    borderRadius: "8px",
                    boxShadow: "0px 2px 8px 0px rgba(0, 0, 0, 0.5)",
                  }}
                />
              </Grid>
              <Grid item xs={12} md={8}>
                <Typography variant="h5" gutterBottom>
                  {person.name}
                  {person.position
                    ? ` - ${person.position}`
                    : ` - Board Member`}
                </Typography>
                <Typography variant="body1">{person.bio}</Typography>
              </Grid>
            </Grid>
            {index <
              [...executiveCommittee, ...boardOfDirectors].length - 1 && (
              <Grid item xs={12}>
                <Divider sx={{ my: 3 }} />
              </Grid>
            )}
          </>
        ))}
      </Grid>
    </Container>
  );
}
