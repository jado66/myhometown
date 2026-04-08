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
  Schedule,
  Refresh as RefreshIcon,
} from "@mui/icons-material";
import CommunitySelect from "@/components/data-tables/selects/CommunitySelect";
import CitySelect from "@/components/data-tables/selects/CitySelect";
import MultiSelect from "@/components/data-tables/selects/MultiSelect";

interface FilterState {
  searchTerm: string;
  statusFilter: string;
  assignmentLevels: string[];
  assignmentStatus: string[];
  selectedCityId: string | null;
  selectedCommunityId: string | null;
  personType: "all" | "missionary" | "volunteer";
  upcomingReleaseDays?: 30 | 60 | 90;
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
  showUpcomingReleaseFilter?: boolean;
}

export function SearchAndFilter({
  filters,
  onFiltersChange,
  cities,
  communities,
  resultCount,
  showUpcomingReleaseFilter = false,
}: UnifiedSearchFilterProps) {
  const [expanded, setExpanded] = useState(true);

  // Debug logging for communities
  React.useEffect(() => {
    console.log(
      "SearchAndFilter - communities:",
      communities,
      "length:",
      communities?.length,
      "isArray:",
      Array.isArray(communities),
    );
  }, [communities]);

  const updateFilter = (key: keyof FilterState, value: any) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const clearAllFilters = () => {
    onFiltersChange({
      searchTerm: "",
      statusFilter: "all",
      assignmentLevels: [],
      assignmentStatus: ["pending", "active"],
      selectedCityId: null,
      selectedCommunityId: null,
      personType: "all",
      ...(showUpcomingReleaseFilter && { upcomingReleaseDays: 90 }),
    });
  };

  const levelOptions = [
    { value: "state", label: "State Level" },
    { value: "city", label: "City Level" },
    { value: "community", label: "Community Level" },
  ];

  const statusOptions = [
    { value: "pending", label: "Pending" },
    { value: "active", label: "Active" },
    { value: "released", label: "Released" },
  ];

  const getFilteredCommunities = () => {
    if (!filters.selectedCityId) return [];
    const selectedCity = cities.find(
      (city) => city._id === filters.selectedCityId,
    );
    if (!selectedCity) return [];
    return communities.filter((c) => c.city === selectedCity.name);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.statusFilter !== "all") count++;
    if (filters.assignmentLevels?.length > 0) count++;
    if (
      filters.assignmentStatus?.length > 0 &&
      !(
        filters.assignmentStatus.length === 2 &&
        filters.assignmentStatus.includes("pending") &&
        filters.assignmentStatus.includes("active")
      )
    )
      count++;
    if (filters.selectedCityId) count++;
    if (filters.selectedCommunityId) count++;
    if (filters.personType !== "all") count++;
    if (showUpcomingReleaseFilter && filters.upcomingReleaseDays) count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <Accordion
      expanded={expanded}
      onChange={() => setExpanded((prev) => !prev)}
      sx={{ mb: 4 }}
      variant="outlined"
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
        {/* Search and Type Row */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Search..."
              variant="outlined"
              value={filters.searchTerm}
              onChange={(e) => updateFilter("searchTerm", e.target.value)}
              placeholder="Search by name (e.g. Kathy Craven), email, title..."
              InputProps={{
                startAdornment: (
                  <SearchIcon sx={{ mr: 1, color: "action.active" }} />
                ),
              }}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth>
              <InputLabel>Type Filter</InputLabel>
              <Select
                value={filters.personType}
                label="Type Filter"
                onChange={(e) => updateFilter("personType", e.target.value)}
              >
                <MenuItem value="all">All Types</MenuItem>
                <MenuItem value="missionary">Only Missionaries</MenuItem>
                <MenuItem value="volunteer">Only Volunteers</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} md={4}>
            <MultiSelect
              label="Assignment Status"
              options={statusOptions}
              value={statusOptions.filter((opt) =>
                filters.assignmentStatus?.includes(opt.value),
              )}
              onChange={(selected: any) => {
                const values = selected
                  ? selected.map((s: any) => s.value)
                  : [];
                // Reset to defaults if cleared completely
                updateFilter(
                  "assignmentStatus",
                  values.length === 0 ? ["pending", "active"] : values,
                );
              }}
              placeholder="Assignment Status"
              height="56px"
              clearIcon={<RefreshIcon fontSize="small" />}
              isClearable={
                !(
                  filters.assignmentStatus?.length === 2 &&
                  filters.assignmentStatus.includes("pending") &&
                  filters.assignmentStatus.includes("active")
                )
              }
            />
          </Grid>
        </Grid>

        {/* Levels, City, and Community Row */}
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <MultiSelect
              label="Assignment Levels"
              options={levelOptions}
              value={levelOptions.filter((opt) =>
                filters.assignmentLevels?.includes(opt.value),
              )}
              onChange={(selected: any) =>
                updateFilter(
                  "assignmentLevels",
                  selected ? selected.map((s: any) => s.value) : [],
                )
              }
              placeholder="Assignment Levels"
              height="56px"
            />
          </Grid>

          {
            // if there are no options hide this filter
            Array.isArray(cities) && cities.length > 1 && (
              <Grid item xs={12} md={4}>
                <FormControl fullWidth>
                  <CitySelect
                    value={filters.selectedCityId}
                    onChange={(value: string | null) =>
                      updateFilter("selectedCityId", value)
                    }
                    onLabelChange={() => {}}
                    isNewIds={true}
                    placeholder="Filter by City"
                    height="56px"
                    includeNullOption
                  />
                </FormControl>
              </Grid>
            )
          }

          {Array.isArray(communities) && communities.length > 0 && (
            <Grid item xs={12} md={4}>
              <FormControl fullWidth>
                <CommunitySelect
                  value={filters.selectedCommunityId}
                  onChange={(value: string | null) =>
                    updateFilter("selectedCommunityId", value)
                  }
                  onLabelChange={() => {}}
                  isMulti={false}
                  concatCityName={true}
                  isNewIds={true}
                  placeholder="Filter by Community"
                  height="56px"
                  includeNullOption
                />
              </FormControl>
            </Grid>
          )}
        </Grid>

        {/* Upcoming Release Filter - Only show on Upcoming Releases tab */}
        {showUpcomingReleaseFilter && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              <Schedule sx={{ mr: 1, verticalAlign: "middle" }} />
              Release Timeline
            </Typography>
            <RadioGroup
              value={filters.upcomingReleaseDays || 90}
              onChange={(e) =>
                updateFilter("upcomingReleaseDays", parseInt(e.target.value))
              }
              row
            >
              <Grid container spacing={2}>
                {[
                  {
                    value: 30,
                    label: "Within 30 Days",
                    description: "Releases in the next month",
                    color: "#f44336",
                  },
                  {
                    value: 60,
                    label: "Within 60 Days",
                    description: "Releases in the next 2 months",
                    color: "#ff9800",
                  },
                  {
                    value: 90,
                    label: "Within 90 Days",
                    description: "Releases in the next 3 months",
                    color: "#4caf50",
                  },
                ].map((option) => {
                  const isSelected =
                    (filters.upcomingReleaseDays || 90) === option.value;
                  return (
                    <Grid item xs={12} md={4} key={option.value}>
                      <Card
                        sx={{
                          p: 2,
                          cursor: "pointer",
                          border: 2,
                          borderColor: isSelected ? option.color : "grey.300",
                          "&:hover": { borderColor: option.color },
                        }}
                        onClick={() =>
                          updateFilter("upcomingReleaseDays", option.value)
                        }
                      >
                        <FormControlLabel
                          value={option.value}
                          control={<Radio sx={{ color: option.color }} />}
                          label={
                            <Box>
                              <Typography variant="subtitle1" fontWeight="bold">
                                {option.label}
                              </Typography>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                              >
                                {option.description}
                              </Typography>
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
            {(filters.searchTerm ||
              filters.statusFilter !== "all" ||
              filters.assignmentLevels?.length > 0 ||
              filters.assignmentStatus?.length > 0 ||
              filters.personType !== "all" ||
              (showUpcomingReleaseFilter && filters.upcomingReleaseDays)) && (
              <Typography variant="body2" color="text.secondary">
                Active filters:
              </Typography>
            )}
            {filters.searchTerm && (
              <Chip
                label={`Search: "${filters.searchTerm}"`}
                size="small"
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
            {filters.assignmentLevels?.length > 0 && (
              <Chip
                label={`Levels: ${filters.assignmentLevels.join(", ")}`}
                size="small"
                sx={{ textTransform: "capitalize" }}
                onDelete={() => updateFilter("assignmentLevels", [])}
                variant="outlined"
              />
            )}
            {filters.assignmentStatus?.length > 0 && (
              <Chip
                label={`Status: ${filters.assignmentStatus.join(", ")}`}
                size="small"
                sx={{ textTransform: "capitalize" }}
                onDelete={() =>
                  updateFilter("assignmentStatus", ["pending", "active"])
                }
                variant="outlined"
              />
            )}
            {filters.personType !== "all" && (
              <Chip
                label={`Type: ${filters.personType}`}
                size="small"
                sx={{ textTransform: "capitalize" }}
                onDelete={() => updateFilter("personType", "all")}
                variant="outlined"
              />
            )}
            {showUpcomingReleaseFilter && filters.upcomingReleaseDays && (
              <Chip
                label={`Within ${filters.upcomingReleaseDays} days`}
                size="small"
                onDelete={() => updateFilter("upcomingReleaseDays", undefined)}
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
