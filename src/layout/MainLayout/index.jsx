"use client";
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { useTheme } from "@mui/material/styles";
import useScrollTrigger from "@mui/material/useScrollTrigger";
import Divider from "@mui/material/Divider";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Slide from "@mui/material/Slide";
import { Topbar, Sidebar, Footer } from "./components";
import { pages } from "../navigation";
import Container from "@/components/util/Container";
import Head from "next/head";
import { Grid } from "@mui/material";

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
  title: "MyHometown",
  description: "Description of MyHometown.", //#TODO
};

const MainLayout = ({
  children,
  themeToggler,
  themeMode,
  setThemePalette,
  paletteType,
}) => {
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
        <meta name="theme-color" content="#ffffff" />
      </Head>

      <div style={{ backgroundColor: "#fff" }}>
        <HideOnScroll>
          <AppBar
            position={"fixed"}
            sx={{
              backgroundColor: theme.palette.background.paper,
            }}
            elevation={1}
          >
            <Container paddingY={{ xs: 1 / 2, sm: 1 }}>
              <Topbar onSidebarOpen={handleSidebarOpen} />
            </Container>
          </AppBar>
        </HideOnScroll>
        <Sidebar
          onClose={handleSidebarClose}
          open={openSidebar}
          variant="temporary"
          pages={pages}
        />
        <main>
          <Box height={{ xs: 56, md: 48 }} />
          <Grid
            container
            sx={{
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
            <Container paddingY={4}></Container>
          </Grid>
        </main>
      </div>
    </>
  );
};

MainLayout.propTypes = {
  children: PropTypes.node,
  themeToggler: PropTypes.func.isRequired,
  themeMode: PropTypes.string.isRequired,
  setThemePalette: PropTypes.func.isRequired,
  paletteType: PropTypes.string.isRequired,
};

export { MainLayout };
