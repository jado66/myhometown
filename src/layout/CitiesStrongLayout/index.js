"use client";
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Divider from "@mui/material/Divider";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Slide from "@mui/material/Slide";
import { Topbar, Sidebar, Footer } from "./components";
import Container from "@/components/util/Container";
import Head from "next/head";
import { Grid } from "@mui/material";

// import { Roboto } from '@next/font/google';
// import '../../styles/cities-strong.css'; // Ensure you have a global stylesheet for custom styles

const HideOnScroll = ({ children }) => {
  const trigger = useScrollTrigger();

  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
};

HideOnScroll.propTypes = {
  children: PropTypes.node.isRequired,
};

export const metadata = {
  title: "Cities Strong",
  description: "Description of Cities Strong.", //#TODO
};

// const roboto = Roboto({
//   subsets: ['latin'], // Define the subsets you need
//   weight: ['100', '300', '400', '500', '700', '900'], // Specify the weights you need
// });

const CitiesStrongLayout = ({ children }) => {
  const theme = useTheme();
  const [openSidebar, setOpenSidebar] = useState(false);

  useEffect(() => {
    document.title = metadata.title;
  }, []);

  const handleSidebarOpen = () => {
    setOpenSidebar(true);
  };

  const handleSidebarClose = () => {
    setOpenSidebar(false);
  };

  return (
    <>
      <Head>
        {/* Change metadata dynamically */}
        <title>{metadata.title}</title>
        <meta name="description" content={metadata.description} />
        <link
          rel="apple-touch-icon"
          sizes="180x180"
          href="/apple-touch-icon.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="32x32"
          href="/favicon-32x32.png"
        />
        <link
          rel="icon"
          type="image/png"
          sizes="16x16"
          href="/favicon-16x16.png"
        />
        <link rel="manifest" href="/site.webmanifest" />
        <meta name="msapplication-TileColor" content="#f3fbfb" />
        <meta name="theme-color" content="#ffffff" />s
      </Head>

      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <HideOnScroll>
          <AppBar
            position={"fixed"}
            sx={{
              backgroundColor: theme.palette.primary.main,
            }}
            elevation={1}
          >
            <Container paddingY={{ xs: 1 / 2, sm: 1 }}>
              <Topbar theme={theme} onSidebarOpen={handleSidebarOpen} />
            </Container>
          </AppBar>
        </HideOnScroll>
        <Sidebar
          onClose={handleSidebarClose}
          open={openSidebar}
          variant="temporary"
        />
        <main>
          <Box height={{ xs: 56, xs: 36 }} sx={{ mx: "auto" }} />
          <Grid
            container
            sx={{
              backgroundColor: "#fafafa",
              mx: "auto",
              boxShadow: "rgba(0, 0, 0, 0.24) 0px 3px 8px",
              maxWidth: {
                lg: "md",
                xl: "lg",
              },
            }}
          >
            {children}
            <Divider />
            <Footer />
          </Grid>
        </main>
      </div>
    </>
  );
};

CitiesStrongLayout.propTypes = {
  children: PropTypes.node,
  themeToggler: PropTypes.func.isRequired,
  themeMode: PropTypes.string.isRequired,
  setThemePalette: PropTypes.func.isRequired,
  paletteType: PropTypes.string.isRequired,
};

export { CitiesStrongLayout };
