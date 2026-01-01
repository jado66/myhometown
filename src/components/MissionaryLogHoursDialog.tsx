"use client";

import React, { type ReactNode } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  IconButton,
  Box,
  Typography,
  Grid,
  Paper,
  TextField,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Close } from "@mui/icons-material";
import moment, { type Moment } from "moment";
import ThemedReactSelect from "@/components/ThemedReactSelect";

interface DetailedActivity {
  id: string;
  category: string;
  description: string;
  hours: string;
}

interface Category {
  value: string;
  label: string;
  description: string | ReactNode;
}

const categories: Category[] = [
  {
    value: "crc",
    label: "Community Resource Center",
    description:
      "Log any hours associated with Community Resource Center activities, including community events, tutoring, meetings, planning, travel, etc.",
  },
  {
    value: "dos",
    label: "Days Of Service",
    description:
      "Log any hours associated with Days Of Service activities, including meeting, planning, travel, etc.",
  },
  {
    value: "administrative",
    label: "Administrative Work",
    description: (
      <>
        <strong>ONLY</strong> log hours in this category if you are a myHometown
        Utah, City, or Community Executive.
      </>
    ),
  },
];

function getMonthOptions() {
  const options = [];
  const currentYear = moment().year();
  for (let month = 0; month < 12; month++) {
    const date = moment().year(currentYear).month(month).startOf("month");
    if (date.isAfter(moment())) {
      continue;
    }
    options.push({
      value: date.toISOString(),
      label: date.format("MMMM YYYY"),
    });
  }
  return options.reverse();
}
function getWeekOptions() {
  const options = [];
  for (let i = 0; i < 13; i++) {
    const weekStart = moment().subtract(i, "weeks").startOf("week");
    const weekEnd = moment().subtract(i, "weeks").endOf("week");
    options.push({
      value: weekStart.toISOString(),
      label:
        i === 0
          ? `This Week (${weekStart.format("MMM D ")} - ${weekEnd.format(
              "MMM D, YYYY"
            )})`
          : `${weekStart.format("MMM D")} - ${weekEnd.format("MMM D, YYYY")}`,
    });
  }
  return options;
}

interface MissionaryLogHoursDialogProps {
  open: boolean;
  onClose: () => void;
  entryMethod: "weekly" | "monthly" | "";
  setEntryMethod: (m: "weekly" | "monthly") => void;
  selectedDate: Moment;
  setSelectedDate: (d: Moment) => void;
  totalHours: string; // Keep for compatibility but not used for input
  setTotalHours: (h: string) => void; // Keep for compatibility
  activities: DetailedActivity[];
  setActivities: (a: DetailedActivity[]) => void;
  addActivity: () => void;
  removeActivity: (id: string) => void;
  updateActivity: (
    id: string,
    field: keyof Omit<DetailedActivity, "id">,
    value: string
  ) => void;
  location: string;
  setLocation: (l: string) => void;
  error: string | null;
  submitting: boolean;
  handleSubmit: () => void;
  editingId: string | null;
  resetForm: () => void;
  isVolunteer: boolean;
}

export default function MissionaryLogHoursDialog({
  open,
  onClose,
  entryMethod,
  setEntryMethod,
  selectedDate,
  setSelectedDate,
  totalHours,
  setTotalHours,
  activities,
  setActivities,
  addActivity,
  removeActivity,
  updateActivity,
  location,
  setLocation,
  error,
  submitting,
  handleSubmit,
  editingId,
  resetForm,
  isVolunteer = true,
}: MissionaryLogHoursDialogProps) {
  const periodStart = selectedDate.clone().startOf("month");
  const periodEnd = selectedDate.clone().endOf("month");

  // Ensure we always have one activity object per defined category when the dialog opens.
  // Previous logic only initialized when activities.length === 0, but the parent provided
  // an initial placeholder item with an empty category, preventing proper setup and making
  // the TextFields appear non-editable (updates targeted ids that didn't exist in state).
  React.useEffect(() => {
    if (!open) return; // Only reconcile when dialog is open to avoid unwanted resets.
    setActivities((prev) => {
      const byCategory = new Map(prev.map((a) => [a.category, a]));
      let changed = false;
      const normalized = categories.map((cat) => {
        if (byCategory.has(cat.value)) return byCategory.get(cat.value)!;
        changed = true;
        return {
          id: cat.value,
          category: cat.value,
          description: "",
          hours: "",
        } as DetailedActivity;
      });
      // Preserve any extra (legacy) activities whose category isn't in the current list
      const extras = prev.filter(
        (a) => !categories.some((c) => c.value === a.category)
      );
      if (extras.length) {
        changed = true;
        return [...normalized, ...extras];
      }
      return changed ? normalized : prev;
    });
  }, [open, setActivities]);

  return (
    <Dialog
      open={open}
      onClose={() => {
        onClose();
        resetForm();
      }}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle sx={{ display: "flex", alignItems: "center", pr: 8 }}>
        <Box sx={{ flexGrow: 1 }}>
          {editingId ? "Edit" : "Log"} Your{" "}
          {isVolunteer ? "Volunteer" : "Missionary"} Hours
        </Box>
        <IconButton
          onClick={() => {
            onClose();
            resetForm();
          }}
          sx={{ position: "absolute", right: 8, top: 8 }}
        >
          <Close />
        </IconButton>
      </DialogTitle>
      <DialogContent>
        <Box sx={{ pt: 1 }}>
          {/* Period Selection */}
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12}>
              <Typography variant="subtitle2" sx={{ mb: 0, fontWeight: 500 }}>
                Select Month
              </Typography>
              <ThemedReactSelect
                options={getMonthOptions()}
                value={getMonthOptions().find((opt) =>
                  moment(opt.value).isSame(selectedDate, "month")
                )}
                onChange={(option) =>
                  option && setSelectedDate(moment(option.value))
                }
                placeholder="Choose month..."
                height={56}
              />
            </Grid>
          </Grid>

          {/* Activity Breakdown */}
          <Typography variant="h6" sx={{ mb: 1, mt: 2 }}>
            Activity Breakdown
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Enter hours for applicable categories (You can leave categories
            blank)
          </Typography>

          <Box sx={{ border: 1, borderColor: "divider", borderRadius: 1 }}>
            {categories.map((category, index) => {
              const activity = activities.find(
                (a) => a.category === category.value
              ) || {
                id: category.value,
                category: category.value,
                description: "",
                hours: "",
              };

              return (
                <Box
                  key={category.value}
                  sx={{
                    p: 2,
                    borderBottom: index !== categories.length - 1 ? 1 : 0,
                    borderColor: "divider",
                    "&:hover": { bgcolor: "action.hover" },
                  }}
                >
                  <Grid container spacing={1}>
                    <Grid item xs={12}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: 600, color: "primary.main" }}
                      >
                        {category.label}
                      </Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{}}
                      >
                        {category.description}
                      </Typography>
                    </Grid>
                    <Grid item xs={6} sm={2}>
                      <TextField
                        fullWidth
                        type="number"
                        label="Hours"
                        value={activity.hours}
                        onChange={(e) =>
                          updateActivity(activity.id, "hours", e.target.value)
                        }
                        inputProps={{ step: "0.25", min: "0" }}
                        size="small"
                      />
                    </Grid>
                    <Grid item xs={6} sm={6}>
                      <TextField
                        fullWidth
                        label="Description (optional)"
                        value={activity.description}
                        onChange={(e) =>
                          updateActivity(
                            activity.id,
                            "description",
                            e.target.value
                          )
                        }
                        placeholder={`Describe activities...`}
                        size="small"
                      />
                    </Grid>
                  </Grid>
                </Box>
              );
            })}
          </Box>

          {/* Total Hours Display */}
          <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
            <Box
              sx={{
                px: 3,
                py: 1,
                backgroundColor: "primary.main",
                borderRadius: 1,
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{ color: "primary.contrastText", fontWeight: 600 }}
              >
                Total:{" "}
                {activities
                  .reduce((sum, act) => sum + (Number(act.hours) || 0), 0)
                  .toFixed(0)}{" "}
                hours
              </Typography>
            </Box>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={() => {
            onClose();
            resetForm();
          }}
        >
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={submitting}
        >
          {submitting ? (
            <CircularProgress size={20} />
          ) : editingId ? (
            "Update Hours"
          ) : (
            "Log Hours"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
