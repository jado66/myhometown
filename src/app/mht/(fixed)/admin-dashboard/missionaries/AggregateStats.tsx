"use client";

import React from "react";
import { Grid, Card, CardContent, Typography, Avatar } from "@mui/material";

export interface StatCardConfig {
  label: string;
  value: number | string;
  color?: string;
  icon?: React.ReactNode;
}

export interface AggregateStatsProps {
  cards: StatCardConfig[];
  sx?: object;
}

export function AggregateStats({ cards, sx, size }: AggregateStatsProps) {
  const formatValue = (value: number | string) => {
    const num =
      typeof value === "number"
        ? value
        : Number(value.toString().replace(/,/g, ""));
    if (!isNaN(num)) {
      return num.toLocaleString();
    }
    return value;
  };

  // Filter out cards with 0 values
  // const visibleCards = cards.filter((card) => {
  //   const numValue =
  //     typeof card.value === "number" ? card.value : parseFloat(card.value);
  //   return !isNaN(numValue) && numValue !== 0;
  // });

  return (
    <Grid container spacing={3} justifyContent="center" sx={{ mb: 3, ...sx }}>
      {cards.map((card, idx) => (
        <Grid item xs={12} sm={6} md={size || 3} key={idx}>
          <Card variant="outlined">
            <CardContent sx={{ textAlign: "center" }}>
              {card.icon && (
                <Avatar
                  sx={{
                    mx: "auto",
                    mb: 2,
                    width: 48,
                    height: 48,
                    bgcolor: card.color || "primary.main",
                  }}
                >
                  {card.icon}
                </Avatar>
              )}
              <Typography
                variant="h4"
                color={card.color || "primary"}
                fontWeight="bold"
              >
                {formatValue(card.value)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {card.label}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}
