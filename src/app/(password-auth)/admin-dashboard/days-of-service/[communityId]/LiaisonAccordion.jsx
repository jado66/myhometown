"use client";

import { Typography, Grid, Button } from "@mui/material";
import { ExpandMore } from "@mui/icons-material";

import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";

export const ContactAccordion = ({ stake, onViewProjects }) => {
  return (
    <Accordion square elevation={0} onClick={(e) => e.stopPropagation()}>
      <AccordionSummary expandIcon={<ExpandMore />} sx={{ px: 1, py: 1 }}>
        <Grid item xs={7}>
          <Button
            variant="outlined"
            color="primary"
            sx={{ mt: 1 }}
            onClick={(e) => {
              e.stopPropagation();
              onViewProjects();
            }}
          >
            View Projects
          </Button>
        </Grid>
        <Typography variant="h6" sx={{ fontSize: "16px !important;", ml: 1 }}>
          Organization Contact Information
        </Typography>
      </AccordionSummary>
      <AccordionDetails sx={{ px: 2, pt: 2, pb: 1 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} lg={6}>
            {stake.liaison_name_1 && (
              <Typography variant="h6">{stake.liaison_name_1}</Typography>
            )}
            {stake.partner_stake_liaison_title_1 && (
              <Typography variant="body2" color="text.secondary">
                Title: {stake.partner_stake_liaison_title_1}
              </Typography>
            )}
            {stake.liaison_email_1 && (
              <Typography variant="body2" color="text.secondary">
                Email: {stake.liaison_email_1}
              </Typography>
            )}
            {stake.liaison_phone_1 && (
              <Typography variant="body2" color="text.secondary">
                Phone: {stake.liaison_phone_1}
              </Typography>
            )}
          </Grid>
          <Grid item xs={12} lg={6}>
            {stake.liaison_name_2 && (
              <Typography variant="h6">{stake.liaison_name_2}</Typography>
            )}
            {stake.partner_stake_liaison_title_2 && (
              <Typography variant="body2" color="text.secondary">
                Title: {stake.partner_stake_liaison_title_2}
              </Typography>
            )}
            {stake.liaison_email_2 && (
              <Typography variant="body2" color="text.secondary">
                Email: {stake.liaison_email_2}
              </Typography>
            )}
            {stake.liaison_phone_2 && (
              <Typography variant="body2" color="text.secondary">
                Phone: {stake.liaison_phone_2}
              </Typography>
            )}
          </Grid>
        </Grid>
        {!stake.liaison_name_1 && !stake.liaison_name_2 && (
          <Typography variant="body2" color="text.secondary">
            No contact information details available. Please click edit to add
            details.
          </Typography>
        )}
      </AccordionDetails>
    </Accordion>
  );
};
