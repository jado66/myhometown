"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  Switch,
  Checkbox,
  IconButton,
  Box,
  FormControlLabel,
  Divider,
  Paper,
  Select,
  MenuItem,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { supabase } from "@/util/supabase";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import BrightnessLowIcon from "@mui/icons-material/BrightnessLow";
import BedtimeIcon from "@mui/icons-material/Bedtime";
import StarBorderIcon from "@mui/icons-material/StarBorder";

// Styled components

const PRIORITY_CONFIG = {
  urgent: {
    icon: <PriorityHighIcon color="error" />,
    label: "Urgent",
    value: 4,
    borderColor: "error.main",
    bgColor: "rgba(211, 47, 47, 0.05)", // Light red
  },
  high: {
    icon: <BrightnessLowIcon color="warning" />,
    label: "High",
    value: 3,
    borderColor: "warning.main",
    bgColor: "rgba(237, 108, 2, 0.05)",
  },
  medium: {
    icon: <BedtimeIcon color="info" />,
    label: "Medium",
    value: 2,
    borderColor: "info.main",
    bgColor: "rgba(2, 136, 209, 0.05)",
  },
  low: {
    icon: <StarBorderIcon color="action" />,
    label: "Low",
    value: 1,
    borderColor: "grey.300",
    bgColor: "rgba(0, 0, 0, 0.03)",
  },
};

const ItemContainer = styled(Paper, {
  shouldForwardProp: (prop) => prop !== "isArchived",
})(({ theme, isArchived }) => ({
  borderRadius: theme.shape.borderRadius,
  transition: theme.transitions.create("all"),
  backgroundColor: isArchived
    ? theme.palette.grey[50]
    : theme.palette.background.paper,
  marginBottom: theme.spacing(1),
}));

function ItemsList({ type }) {
  const [items, setItems] = useState([]);
  const [showArchived, setShowArchived] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState(new Set());

  useEffect(() => {
    fetchItems();
  }, [showArchived, type]);

  const fetchItems = useCallback(async () => {
    let query = supabase.from(type).select("*");
    if (!showArchived) {
      query = query.eq("is_archived", false);
    }

    const { data, error } = await query;
    if (error) {
      console.error(`Error fetching ${type}:`, error);
    } else {
      // Sort items by priority
      const sortedData = (data || []).sort((a, b) => {
        const priorityA = PRIORITY_CONFIG[a.priority || "low"].value;
        const priorityB = PRIORITY_CONFIG[b.priority || "low"].value;
        return priorityB - priorityA;
      });
      setItems(sortedData);
    }
    setIsLoading(false);
  }, [type, showArchived]);

  useEffect(() => {
    fetchItems();
  }, []);

  const updatePriority = useCallback(
    async (id, priority) => {
      try {
        const { error } = await supabase
          .from(type)
          .update({ priority })
          .eq("id", id);

        if (error) {
          console.error(`Error updating priority:`, error);
          return;
        }

        await fetchItems();
      } catch (err) {
        console.error("Error in updatePriority:", err);
      }
    },
    [type, fetchItems]
  );

  const toggleArchive = useCallback(
    async (id, currentStatus) => {
      console.log("Attempting to toggle archive:", { id, currentStatus });

      try {
        const { error } = await supabase
          .from(type)
          .update({ is_archived: !currentStatus })
          .eq("id", id);

        if (error) {
          console.error(`Error updating ${type}:`, error);
          return;
        }

        console.log("Successfully toggled archive status");
        await fetchItems();
      } catch (err) {
        console.error("Error in toggleArchive:", err);
      }
    },
    [type, fetchItems]
  );

  const toggleExpand = (id) => {
    const newExpanded = new Set(expandedItems);
    if (expandedItems.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedItems(newExpanded);
  };

  if (isLoading) {
    return (
      <Box p={2}>
        <Typography>Loading {type.replace("_", " ")}...</Typography>
      </Box>
    );
  }

  // Convert textColorClass to MUI color
  const getColor = () => {
    return type === "bug_reports" ? "error" : "primary";
  };

  return (
    <Card>
      <CardContent>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          pb={2}
        >
          <Typography variant="h6" color={getColor()}>
            {type === "bug_reports" ? "Bugs" : "Feature Requests"}
          </Typography>
          <FormControlLabel
            control={
              <Switch
                checked={showArchived}
                onChange={(e) => setShowArchived(e.target.checked)}
              />
            }
            label={
              <Typography variant="body2" color="text.secondary">
                Show Archived
              </Typography>
            }
          />
        </Box>

        <Divider />

        <Box mt={2}>
          {items.length === 0 ? (
            <Typography align="center" variant="body2" color="text.secondary">
              Awesome! We are caught up on {type.replace("_", " ")}.
            </Typography>
          ) : (
            items.map((item) => (
              <Paper
                key={item.id}
                elevation={0}
                sx={{
                  mb: 1,
                  borderRadius: 1,
                  transition: "all 0.2s",
                  backgroundColor: item.is_archived
                    ? "grey.100"
                    : PRIORITY_CONFIG[item.priority || "low"].bgColor,
                  borderLeft: (theme) =>
                    `6px solid ${
                      theme.palette[
                        PRIORITY_CONFIG[
                          item.priority || "low"
                        ].borderColor.split(".")[0]
                      ][
                        PRIORITY_CONFIG[
                          item.priority || "low"
                        ].borderColor.split(".")[1]
                      ]
                    }`,
                  opacity: item.is_archived ? 0.7 : 1,
                }}
              >
                <Box display="flex" alignItems="flex-start" p={0.5}>
                  <Select
                    size="small"
                    value={item.priority || "low"}
                    onChange={(e) => updatePriority(item.id, e.target.value)}
                    sx={{
                      padding: 0,
                      "& .MuiSelect-select": {
                        padding: 1,
                      },
                      "& .MuiOutlinedInput-input": {
                        paddingRight: "14px !important",
                        paddingTop: 1.25,
                      },
                      "& .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      "&:hover .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                        border: "none",
                      },
                      "& .MuiSelect-icon": {
                        display: "none",
                      },
                      "&:before, &:after": {
                        borderColor: "transparent",
                      },
                    }}
                    renderValue={(selected) => PRIORITY_CONFIG[selected].icon}
                  >
                    {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                      <MenuItem key={key} value={key}>
                        <Box display="flex" alignItems="center" gap={1}>
                          {config.icon}
                          <Typography>{config.label}</Typography>
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>

                  <Box flexGrow={1}>
                    <Box
                      display="flex"
                      alignItems="center"
                      justifyContent="space-between"
                      sx={{ mt: 0.5, flexGrow: 1 }}
                      flexGrow={1}
                    >
                      <Box
                        display="flex"
                        alignItems="center"
                        justifyContent="space-between"
                        flexGrow={1}
                      >
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight: 500,
                            color: item.is_archived
                              ? "text.secondary"
                              : type === "bug_reports"
                              ? "error.main"
                              : "primary.main",
                          }}
                        >
                          {item.title}
                        </Typography>
                        <Box>
                          <Checkbox
                            checked={item.is_archived}
                            onChange={() =>
                              toggleArchive(item.id, item.is_archived)
                            }
                            size="small"
                          />
                        </Box>
                      </Box>

                      <IconButton
                        size="small"
                        onClick={() => toggleExpand(item.id)}
                      >
                        {expandedItems.has(item.id) ? (
                          <ExpandLessIcon fontSize="small" />
                        ) : (
                          <ExpandMoreIcon fontSize="small" />
                        )}
                      </IconButton>
                    </Box>
                    {expandedItems.has(item.id) && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ mt: 1 }}
                      >
                        {item.description}
                      </Typography>
                    )}
                  </Box>
                </Box>
              </Paper>
            ))
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export default ItemsList;
