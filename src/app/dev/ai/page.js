import { Container, Typography, Box, Link } from '@mui/material';
import { Grid } from '@mui/material';

export default function Home() {
    return (
        <Container>
            {/* Header */}
            <Box sx={{ my: 4 }}>
                <Typography variant="h1" component="h2" gutterBottom>
                    Welcome to MyHometown
                </Typography>
            </Box>

            {/* Navigation */}
            <Box sx={{ my: 2 }}>
                <Grid container spacing={2}>
                    <Grid item xs={2}><Link href="#">Home</Link></Grid>
                    <Grid item xs={2}><Link href="#">About</Link></Grid>
                    <Grid item xs={2}><Link href="#">Contact</Link></Grid>
                </Grid>
            </Box>

            {/* Main Content */}
            <Box sx={{ my: 4 }}>
                {/* About Section */}
                <Typography variant="h2" component="h2" gutterBottom>
                    About Me
                </Typography>
                <Typography variant="body1" gutterBottom>
                    This is a brief description about myself.
                </Typography>

                {/* Contact Section */}
                <Typography variant="h2" component="h2" gutterBottom>
                    Contact Information
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Email: example@example.com
                </Typography>
                <Typography variant="body1" gutterBottom>
                    Phone: 123-456-7890
                </Typography>
            </Box>

            {/* Footer */}
            <Box sx={{ my: 4 }}>
                <Typography variant="body1" color="text.secondary">
                    &copy; 2021 MyHometown. All rights reserved.
                </Typography>
            </Box>
        </Container>
    );
}
