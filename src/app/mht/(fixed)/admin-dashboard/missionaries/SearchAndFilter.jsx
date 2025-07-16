import React from "react";
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Typography,
  Grid,
  Paper,
} from "@mui/material";
import {
  Search as SearchIcon,
  FilterList as FilterIcon,
} from "@mui/icons-material";

interface SearchAndFilterProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  resultCount: number;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchTerm,
  setSearchTerm,
  statusFilter,
  setStatusFilter,
  resultCount,
}) => {
  return (
    <Paper elevation={1} sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
        <SearchIcon color="action" />
        <Typography variant="h6">Search & Filter</Typography>
      </Box>

      <Grid container spacing={3} alignItems="center">
        <Grid item xs={12} md={6}>
          <TextField
            fullWidth
            label="Search missionaries..."
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, email, title, or group"
            InputProps={{
              startAdornment: <SearchIcon sx={{ mr: 1, color: "action.active" }} />,
            }}
          />
        </Grid>

        <Grid item xs={12} md={4}>
          <FormControl fullWidth>
            <InputLabel>Status Filter</InputLabel>
            <Select
              value={statusFilter}
              label="Status Filter"
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <MenuItem value="all">All Status</MenuItem>
              <MenuItem value="active">Active</MenuItem>
              <MenuItem value="inactive">Inactive</MenuItem>
              <MenuItem value="pending">Pending</MenuItem>
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} md={2}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FilterIcon color="action" />
            <Typography variant="body2" color="text.secondary">
              {resultCount} results
            </Typography>
          </Box>
        </Grid>
      </Grid>

      {/* Active Filters Display */}
      <Box sx={{ mt: 2, display: "flex", flexWrap: "wrap", gap: 1 }}>
        {searchTerm && (
          <Chip
            label={`Search: "${searchTerm}"`}
            onDelete={() => setSearchTerm("")}
            color="primary"
            variant="outlined"
            size="small"
          />
        )}
        {statusFilter !== "all" && (
          <Chip
            label={`Status: ${statusFilter}`}
            onDelete={() => setStatusFilter("all")}
            color="primary"
            variant="outlined"
            size="small"
          />
        )}
      </Box>
    </Paper>
  );
};
