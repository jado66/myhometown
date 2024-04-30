'use client'

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import getTheme from '@/theme';
import Paper from '@mui/material/Paper';
import { UserProvider } from './UserProvider';
import { UserProvider as AuthProvider } from '@auth0/nextjs-auth0/client';

const ProviderWrapper = ({ children, theme = 'default' }) => {
    return (
        <ThemeProvider theme={getTheme(theme)}>
            <AuthProvider>
                <UserProvider>
                    {/* CssBaseline kickstart an elegant, consistent, and simple baseline to build upon. */}
                    <CssBaseline />
                    <Paper elevation={0} id = 'paper-root'>
                        {children}
                    </Paper>
                </UserProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}

export default ProviderWrapper;
