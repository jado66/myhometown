"use client";

import { ThemeProvider } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import getTheme from "@/theme";
import Paper from "@mui/material/Paper";
import { UserProvider } from "./UserProvider";
import { AuthProvider } from "./AuthContext";
import { SimpleAuthProvider } from "./SimpleAuthProvider";
import { PasswordAuthProvider } from "./PasswordAuthProvider";

const ProviderWrapper = ({ children, theme = "default" }) => {
  return (
    <ThemeProvider theme={getTheme(theme)}>
      <AuthProvider>
        <SimpleAuthProvider>
          <UserProvider>
            {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
            <CssBaseline />
            <Paper elevation={0} id="paper-root">
              {children}
            </Paper>
          </UserProvider>
        </SimpleAuthProvider>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default ProviderWrapper;
