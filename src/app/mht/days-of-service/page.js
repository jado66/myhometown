import React from "react";
import {
  Container,
  Typography,
  Card,
  CardContent,
  Button,
  Grid,
} from "@mui/material";

const DaysOfServicePage = () => {
  return (
    <Container sx={{ pt: 3 }}>
      <Typography variant="h3" component="h1" gutterBottom>
        Days of Service
      </Typography>
      <Card>
        <CardContent>
          <Typography variant="h5" component="h2" gutterBottom>
            One Saturday morning each month, in the spring and summer, My
            Hometown volunteers converge on a community neighborhood to clean up
            homes, yards and public areas.
          </Typography>
          <Typography variant="body1" gutterBottom>
            We plant trees and flowers to beautify parks and homes. We also
            repair, paint, and upgrade homes and public buildings. Join us to
            help serve the community! We would love your support!
          </Typography>
          <Grid container justifyContent="center" style={{ marginTop: "20px" }}>
            <Button variant="contained" color="primary">
              Join Us
            </Button>
          </Grid>
        </CardContent>
      </Card>
    </Container>
  );
};

export default DaysOfServicePage;
