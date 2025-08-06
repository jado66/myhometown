"use client";

import React, { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Grid,
  Chip,
  Button,
  RadioGroup,
  FormControlLabel,
  Radio,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon,
  Person,
  Business,
  LocationCity,
  Group,
} from "@mui/icons-material";

interface FilterState {
  searchTerm: string;
  statusFilter: string;
  assignmentLevel: "all" | "state" | "city" | "community";
  selectedCityId: string | null;
  selectedCommunityId: string | null;
}

interface City {
  _id: string;
  id: string;
  name: string;
  state: string;
}

interface Community {
  _id: string;
  id: string;
  name: string;
  city: string;
}

interface UnifiedSearchFilterProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  cities: City[];
  communities: Community[];
  resultCount: number;
}

export function SearchAndFilter({
  filters,
  onFiltersChange,
  cities,
  communities,
  resultCount,
}: UnifiedSearchFilterProps) {
  const [expanded, setExpanded] = useState(false);
  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };

    // Reset dependent filters when assignment level changes
    if (key === "assignmentLevel") {
      newFilters.selectedCityId = null;
      newFilters.selectedCommunityId = null;
    }

    // Reset community when city changes
    if (key === "selectedCityId") {
      newFilters.selectedCommunityId = null;
    }

    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: "",
      statusFilter: "all",
      assignmentLevel: "all",
      selectedCityId: null,
      selectedCommunityId: null,
    });
  };

  const getFilteredCommunities = () => {
    if (!filters.selectedCityId) return [];
    const selectedCity = cities.find(
      (city) => city._id === filters.selectedCityId
    );
    if (!selectedCity) return [];
    return communities.filter((c) => c.city === selectedCity.name);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.statusFilter !== "all") count++;
    if (filters.assignmentLevel !== "all") count++;
    if (filters.selectedCityId) count++;
    if (filters.selectedCommunityId) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded((prev) => !prev)}
      sx={{ mb: 4 }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FilterIcon color="action" />
          <Typography variant="h6">Search & Filter</Typography>
          {activeFiltersCount > 0 && (
            <Chip
              label={`${activeFiltersCount} active`}
              size="small"
              color="primary"
              variant="outlined"
            />
          )}
        </Box>
        {activeFiltersCount > 0 && (
          <Button
            variant="text"
            size="small"
            startIcon={<ClearIcon />}
            onClick={(e) => {
              e.stopPropagation();
              clearAllFilters();
            }}
          >
            Clear All
          </Button>
        )}
      </AccordionSummary>
      <AccordionDetails>
        {/* Search and Status Row */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Search missionaries..."
              variant="outlined"
              value={filters.searchTerm}
              onChange={(e) => updateFilter("searchTerm", e.target.value)}
              placeholder="Search by name, email, title, or group"
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "action.active" }} />
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Status Filter</InputLabel>
              <Select
                value={filters.statusFilter}
                label="Status Filter"
                onChange={(e) => updateFilter("statusFilter", e.target.value)}
              >
                <MenuItem value="all">All Status</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="inactive">Inactive</MenuItem>
                <MenuItem value="pending">Pending</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>

        {/* Assignment Level Selection */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom>
            Assignment Level
          </Typography>
          <RadioGroup
            value={filters.assignmentLevel}
            onChange={(e) => updateFilter("assignmentLevel", e.target.value)}
            row
          >
            <Grid container spacing={2}>
              {[
                {
                  value: "all",
                  label: "All Levels",
                  icon: Person,
                  description: "Show all missionaries",
                },
                {
                  value: "state",
                  label: "State Level",
                  icon: Business,
                  description: "Utah state-wide assignments",
                },
                {
                  value: "city",
                  label: "City Level",
                  icon: LocationCity,
                  description: "City-specific assignments",
                },
                {
                  value: "community",
                  label: "Community Level",
                  icon: Group,
                  description: "Community assignments",
                },
              ].map((level) => {
                const Icon = level.icon;
                const isSelected = filters.assignmentLevel === level.value;
                return (
                  <Grid item xs={12} md={3} key={level.value}>
                    <Card
                      sx={{
                        p: 2,
                        cursor: "pointer",
                        border: 2,
                        borderColor: isSelected ? "primary.main" : "grey.300",
                        "&:hover": { borderColor: "primary.main" },
                      }}
                      onClick={() =>
                        updateFilter("assignmentLevel", level.value)
                      }
                    >
                      <FormControlLabel
                        value={level.value}
                        control={<Radio />}
                        label={
                          <Box
                            sx={{
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <Icon />
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {level.label}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {level.description}
                              </Typography>
                            </Box>
                          </Box>
                        }
                      />
                    </Card>
                  </Grid>
                );
              })}
            </Grid>
          </RadioGroup>
        </Box>

        {/* City and Community Selection */}
        {(filters.assignmentLevel === "city" ||
          filters.assignmentLevel === "community") && (
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={6}>
              <FormControl fullWidth>
                <InputLabel>Select City</InputLabel>
                <Select
                  value={filters.selectedCityId ?? ""}
                  label="Select City"
                  onChange={(e) =>
                    updateFilter(
                      "selectedCityId",
                      e.target.value === "" ? null : e.target.value
                    )
                  }
                >
                  <MenuItem value="">All Cities</MenuItem>
                  {cities.map((city) => (
                    <MenuItem key={city._id} value={city._id}>
                      {city.name}, {city.state}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {filters.assignmentLevel === "community" &&
              filters.selectedCityId && (
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel>Select Community</InputLabel>
                    <Select
                      value={filters.selectedCommunityId ?? ""}
                      label="Select Community"
                      onChange={(e) =>
                        updateFilter(
                          "selectedCommunityId",
                          e.target.value === "" ? null : e.target.value
                        )
                      }
                    >
                      <MenuItem value="">All Communities</MenuItem>
                      {getFilteredCommunities().map((community) => (
                        <MenuItem key={community._id} value={community._id}>
                          {community.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              )}
          </Grid>
        )}

        {/* Active Filters and Results */}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            pt: 2,
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              flexWrap: "wrap",
            }}
          >
            {/* If there are active filters */}
            {(filters.searchTerm ||
              filters.statusFilter !== "all" ||
              filters.assignmentLevel !== "all") && (
              <Typography variant="body2" color="text.secondary">
                Active filters:
              </Typography>
            )}
            {filters.searchTerm && (
              <Chip
                label={`Search: "${filters.searchTerm}"`}
                size="small"
                sx={{ textTransform: "capitalize" }}
                onDelete={() => updateFilter("searchTerm", "")}
                variant="outlined"
              />
            )}
            {filters.statusFilter !== "all" && (
              <Chip
                label={`Status: ${filters.statusFilter}`}
                size="small"
                sx={{ textTransform: "capitalize" }}
                onDelete={() => updateFilter("statusFilter", "all")}
                variant="outlined"
              />
            )}
            {filters.assignmentLevel !== "all" && (
              <Chip
                label={`Level: ${filters.assignmentLevel}`}
                size="small"
                sx={{ textTransform: "capitalize" }}
                onDelete={() => updateFilter("assignmentLevel", "all")}
                variant="outlined"
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary">
            {resultCount} result{resultCount !== 1 ? "s" : ""}
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
