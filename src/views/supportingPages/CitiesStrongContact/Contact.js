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
    <Container
      maxWidth="xl"
      sx={{
        mx: "auto",
        pt: "50px !important",
        pb: "0 !important",
      }}
    >
      {" "}
      <Container px={{ md: 5, xs: 0 }} paddingTop={"0 !important"}>
        <Grid container spacing={isMd ? 4 : 4}>
          <Grid item container xs={12} alignItems={"center"}>
            <Form />
          </Grid>
          <Grid item xs={12} alignItems={"center"}>
            <Divider sx={{ borderWidth: 3, borderColor: "black" }} />
          </Grid>

          <Grid item xs={12} sx={{ px: { xs: 2 } }}>
            <Map themeMode={themeMode} />
          </Grid>
        </Grid>
      </Container>
    </Container>
  );
};

Contact.propTypes = {
  themeMode: PropTypes.string.isRequired,
};

export default Contact;
