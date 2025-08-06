"use client";

import React, { useMemo } from "react";
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Avatar,
  Box,
} from "@mui/material";
import {
  Group as GroupIcon,
  CheckCircle as CheckCircleIcon,
  Business as BusinessIcon,
  LocationCity as LocationCityIcon,
} from "@mui/icons-material";

interface Missionary {
  id: string;
  assignment_status: "active" | "inactive" | "pending";
  assignment_level?: "state" | "city" | "community";
}

interface AggregateStatsProps {
  missionaries: Missionary[];
}

export function AggregateStats({ missionaries }: AggregateStatsProps) {
  const stats = useMemo(() => {
    const active = missionaries.filter(
      (m) => m.assignment_status === "active"
    ).length;
    const byLevel = missionaries.reduce((acc, m) => {
      const level = m.assignment_level || "unassigned";
      acc[level] = (acc[level] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: missionaries.length,
      active,
      byLevel,
    };
  }, [missionaries]);

  return (
    <Grid container spacing={3} sx={{ mb: 3 }}>
      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ textAlign: "center" }}>
            <Avatar
              sx={{
                mx: "auto",
                mb: 2,
                width: 48,
                height: 48,
                bgcolor: "primary.main",
              }}
            >
              <GroupIcon />
            </Avatar>
            <Typography variant="h4" color="primary" fontWeight="bold">
              {stats.total}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total Missionaries
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ textAlign: "center" }}>
            <Avatar
              sx={{
                mx: "auto",
                mb: 2,
                width: 48,
                height: 48,
                bgcolor: "success.main",
              }}
            >
              <CheckCircleIcon />
            </Avatar>
            <Typography variant="h4" color="success.main" fontWeight="bold">
              {stats.active}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Active
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ textAlign: "center" }}>
            <Avatar
              sx={{
                mx: "auto",
                mb: 2,
                width: 48,
                height: 48,
                bgcolor: "secondary.main",
              }}
            >
              <BusinessIcon />
            </Avatar>
            <Typography variant="h4" color="secondary.main" fontWeight="bold">
              {stats.byLevel.state || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              State Level
            </Typography>
          </CardContent>
        </Card>
      </Grid>

      <Grid item xs={12} sm={6} md={3}>
        <Card>
          <CardContent sx={{ textAlign: "center" }}>
            <Avatar
              sx={{
                mx: "auto",
                mb: 2,
                width: 48,
                height: 48,
                bgcolor: "warning.main",
              }}
            >
              <LocationCityIcon />
            </Avatar>
            <Typography variant="h4" color="warning.main" fontWeight="bold">
              {(stats.byLevel.city || 0) + (stats.byLevel.community || 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Local Level
            </Typography>
          </CardContent>
        </Card>
      </Grid>
    </Grid>
  );
}
