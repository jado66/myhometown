import React from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import { Map, Form, Faq } from "./components";
import Container from "@/components/util/Container";
import { Divider } from "@mui/material";

const Contact = ({ themeMode = "light" }) => {
  const theme = useTheme();
  const isMd = useMediaQuery(theme.breakpoints.up("md"), {
    defaultMatches: true,
  });

  return (
    <Box>
      <Container px={{ md: 5, xs: 0 }}>
        <Grid container spacing={isMd ? 8 : 4}>
          <Grid item container xs={12} alignItems={"center"}>
            <Form />
          </Grid>
          <Grid item xs={12} sx={{ px: { xs: 2 } }}>
            <Map themeMode={themeMode} />
          </Grid>
        </Grid>
      </Container>
      <Divider sx={{ borderWidth: 3, mx: 5, borderColor: "black" }} />

      <Box bgcolor={theme.palette.alternate.main}>
        <Container maxWidth={800}>
          <Faq />
        </Container>
      </Box>
    </Box>
  );
};

Contact.propTypes = {
  themeMode: PropTypes.string.isRequired,
};

export default Contact;
