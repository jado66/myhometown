"use client";

import {
  Typography,
  Box,
  Card,
  CardContent,
  Button,
  IconButton,
  Divider,
} from "@mui/material";
import { Edit, Assignment } from "@mui/icons-material";

import { LiaisonAccordion } from "./LiaisonAccordion";

export const StakeCard = ({
  stake,
  day,
  onClick,
  onEdit,
  onGenerateReport,
}) => {
  return (
    <Card
      sx={{
        cursor: "pointer",
        "&:hover": { boxShadow: 6 },
        position: "relative",
      }}
      variant="outlined"
      onClick={() => onClick(day, stake)}
    >
      <Box
        sx={{ position: "absolute", top: 8, right: 8, color: "primary.main" }}
      >
        <Button
          variant="outlined"
          onClick={(e) => {
            e.stopPropagation();
            onGenerateReport(stake.id, day.end_date, day);
          }}
        >
          <Assignment sx={{ mr: 1 }} /> Print
        </Button>
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onEdit(day.id, stake);
          }}
        >
          <Edit />
        </IconButton>
      </Box>
      <CardContent>
        <Typography variant="h6" sx={{ ml: 2, mt: { xs: 0, sm: 5, xl: 0 } }}>
          {stake.name}
        </Typography>
        <Divider sx={{ my: 2 }} />
        <LiaisonAccordion
          stake={stake}
          day={day}
          onViewProjects={() => onClick(day, stake)}
        />
      </CardContent>
    </Card>
  );
};
