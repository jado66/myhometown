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

export function AggregateStats({ cards, sx }: AggregateStatsProps) {
  return (
    <Grid container spacing={3} sx={{ mb: 3, ...sx }}>
      {cards.map((card, idx) => (
        <Grid item xs={12} sm={6} md={3} key={idx}>
          <Card>
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
                {card.value}
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
