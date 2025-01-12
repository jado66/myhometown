import Link from "next/link";
import { Button, Container, Paper, Typography, Box } from "@mui/material";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";

export default function ThankYou() {
  return (
    <Box
      sx={{
        minHeight: { sm: "100vh" },
        padding: { xs: 10, sm: 4 },
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        mx: "auto",
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={3}
          sx={{
            p: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 4,
          }}
        >
          <Box textAlign="center">
            <Typography
              variant="h4"
              component="h2"
              gutterBottom
              fontWeight="bold"
              color="text.primary"
            >
              Thank You!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Your submission has been received. We appreciate your feedback and
              will review it shortly.
            </Typography>
          </Box>

          <CheckCircleOutlineIcon color="success" sx={{ fontSize: 64 }} />

          <Typography variant="body2" color="text.secondary" textAlign="center">
            If you have any additional information or questions, please
            don&apos;t hesitate to contact our support team.
          </Typography>

          <Link href="/" style={{ width: "100%" }}>
            <Button variant="contained" fullWidth>
              Return to Home
            </Button>
          </Link>
        </Paper>
      </Container>
    </Box>
  );
}
