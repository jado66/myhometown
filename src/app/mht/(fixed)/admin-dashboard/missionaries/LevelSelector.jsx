import React from "react";
import {
  Card,
  CardContent,
  Typography,
  Grid,
  Box,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Paper,
} from "@mui/material";
import {
  Business as BusinessIcon,
  LocationCity as LocationCityIcon,
  Group as GroupIcon,
} from "@mui/icons-material";
import { POSITIONS_BY_LEVEL } from "./positions";

const LevelSelector = ({
  level,
  onLevelChange,
  cities,
  communities,
  selectedCity,
  selectedCommunity,
  onCityChange,
  onCommunityChange,
}) => {
  const levelCards = [
    {
      value: "state",
      icon: BusinessIcon,
      title: "State Level",
      desc: "Utah state-wide assignments",
    },
    {
      value: "city",
      icon: LocationCityIcon,
      title: "City Level",
      desc: "City-specific assignments",
    },
    {
      value: "community",
      icon: GroupIcon,
      title: "Community Level",
      desc: "Community assignments",
    },
  ];

  return (
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Select Assignment Level
        </Typography>

        <Grid container spacing={2} sx={{ mb: 2 }}>
          {levelCards.map(({ value, icon: Icon, title, desc }) => (
            <Grid item xs={12} md={4} key={value}>
              <Paper
                elevation={level === value ? 3 : 1}
                sx={{
                  p: 2,
                  cursor: "pointer",
                  border: level === value ? "2px solid" : "1px solid",
                  borderColor: level === value ? "primary.main" : "divider",
                  backgroundColor:
                    level === value ? "primary.50" : "background.paper",
                  "&:hover": {
                    borderColor:
                      level === value ? "primary.main" : "primary.light",
                  },
                }}
                onClick={() => onLevelChange(value)}
              >
                <Box
                  sx={{ display: "flex", alignItems: "flex-start", gap: 1.5 }}
                >
                  <Icon
                    sx={{
                      color:
                        level === value ? "primary.main" : "text.secondary",
                      fontSize: 24,
                    }}
                  />
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold">
                      {title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {desc}
                    </Typography>
                  </Box>
                </Box>
              </Paper>
            </Grid>
          ))}
        </Grid>

        {(level === "city" || level === "community") && (
          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select City</InputLabel>
                <Select
                  value={selectedCity}
                  onChange={(e) => onCityChange(e.target.value)}
                  label="Select City"
                >
                  <MenuItem value="">All Cities</MenuItem>
                  {cities.map((city) => (
                    <MenuItem key={city.id} value={city.id}>
                      {city.name}, {city.state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {level === "community" && selectedCity && (
              <Grid item xs={12} md={6}>
                <FormControl fullWidth>
                  <InputLabel>Select Community</InputLabel>
                  <Select
                    value={selectedCommunity}
                    onChange={(e) => onCommunityChange(e.target.value)}
                    label="Select Community"
                  >
                    <MenuItem value="">All Communities</MenuItem>
                    {communities
                      .filter((c) => c.city_id === selectedCity)
                      .map((community) => (
                        <MenuItem key={community.id} value={community.id}>
                          {community.name}
                        </MenuItem>
                      ))}
                  </Select>
                </FormControl>
              </Grid>
            )}
          </Grid>
        )}

        {/* Display available positions */}
        <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: "divider" }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Available Groups & Titles:
          </Typography>
          <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
            {Object.entries(POSITIONS_BY_LEVEL[level] || {}).map(
              ([group, titles]) => (
                <Chip
                  key={group}
                  label={`${group} (${titles.length})`}
                  variant="outlined"
                  size="small"
                />
              )
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export { LevelSelector };
