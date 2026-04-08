import React from "react";
import {
  Container,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ItemsList from "@/components/admin/ItemsList";

const MyPage = () => {
  return (
    <Container sx={{ minHeight: "75%" }}>
      <Typography variant="h4" sx={{ mb: 3, textAlign: "center" }}>
        App Development Lists
      </Typography>
      <Grid container spacing={2}>
        <Grid item xs={6} sx={{ maxHeight: "70vh", overflow: "auto" }}>
          <ItemsList type="bug_reports" />
        </Grid>
        <Grid item xs={6} sx={{ maxHeight: "70vh", overflow: "auto" }}>
          <ItemsList type="feature_requests" />
        </Grid>
      </Grid>
      <Grid sx={{ grow: 1 }} />
    </Container>
  );
};

export default MyPage;
