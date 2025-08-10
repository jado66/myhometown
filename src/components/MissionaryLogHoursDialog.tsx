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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  CircularProgress,
  Divider,
} from "@mui/material";
import { Close, SwapHoriz, Add, Delete } from "@mui/icons-material";
import moment, { type Moment } from "moment";
import ThemedReactSelect from "@/components/ThemedReactSelect";

interface DetailedActivity {
  id: string;
  category: string;
  description: string;
  hours: string;
}

const categories = [
  { value: "outreach", label: "Community Outreach" },
  { value: "community_service", label: "Community Service" },
  { value: "administrative", label: "Administrative Work" },
];

function getMonthOptions() {
  const options = [];
  for (let i = 0; i < 3; i++) {
    const date = moment().subtract(i, "months").startOf("month");
    options.push({
      value: date.toISOString(),
      label:
        i === 0
          ? `This Month (${date.format("MMMM YYYY")})`
          : date.format("MMMM YYYY"),
    });
  }
  return options;
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
  totalHours: string;
  setTotalHours: (h: string) => void;
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
}: MissionaryLogHoursDialogProps) {
  const periodStart = selectedDate
    .clone()
    .startOf(entryMethod === "weekly" ? "week" : "month");
  const periodEnd = selectedDate
    .clone()
    .endOf(entryMethod === "weekly" ? "week" : "month");

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
          {editingId ? "Edit" : "Log"} Your Volunteer Hours
        </Box>
        {entryMethod && !editingId && (
          <Button
            size="small"
            onClick={() => {
              setEntryMethod(entryMethod === "weekly" ? "monthly" : "weekly");
            }}
            sx={{
              mr: 1,
              border: 1,
              borderColor: "divider",
              "&:hover": {
                backgroundColor: "action.hover",
              },
            }}
            title={`Switch to ${
              entryMethod === "weekly" ? "monthly" : "weekly"
            } input`}
          >
            <SwapHoriz fontSize="small" sx={{ mr: 1 }} />
            Switch To {entryMethod === "weekly" ? "Monthly" : "Weekly"} Input
          </Button>
        )}
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
        <Box sx={{ pt: 2 }}>
          {/* Period Selection */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                {entryMethod === "monthly" ? "Select Month" : "Select Week"}
              </Typography>
              {entryMethod === "monthly" ? (
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
              ) : (
                <ThemedReactSelect
                  options={getWeekOptions()}
                  value={getWeekOptions().find((opt) =>
                    moment(opt.value).isSame(selectedDate, "week")
                  )}
                  onChange={(option) =>
                    option && setSelectedDate(moment(option.value))
                  }
                  placeholder="Choose week..."
                  height={56}
                />
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2" sx={{ mb: 1, fontWeight: 500 }}>
                Total Hours
              </Typography>
              <TextField
                fullWidth
                type="number"
                value={totalHours}
                onChange={(e) => setTotalHours(e.target.value)}
                inputProps={{ step: "0.25", min: "0" }}
              />
            </Grid>
          </Grid>

          {/* Location */}
          <TextField
            fullWidth
            label="Location (Optional)"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            sx={{ mb: 2 }}
          />

          <Divider sx={{ my: 2 }} />

          {/* Activities */}
          <Typography variant="h6" sx={{ mb: 2 }}>
            Activity Breakdown
          </Typography>
          {activities.map((activity, idx) => {
            const selectedCategories = activities
              .filter((a, i) => i !== idx)
              .map((a) => a.category)
              .filter(Boolean);

            return (
              <Box key={activity.id} sx={{ px: 2, mb: 1 }}>
                <Grid container spacing={2} alignItems="center">
                  <Grid item xs={12} sm={4}>
                    <FormControl fullWidth>
                      <InputLabel>Category</InputLabel>
                      <Select
                        value={activity.category}
                        label="Category"
                        onChange={(e) =>
                          updateActivity(
                            activity.id,
                            "category",
                            e.target.value
                          )
                        }
                      >
                        {categories.map((cat) => (
                          <MenuItem
                            key={cat.value}
                            value={cat.value}
                            disabled={selectedCategories.includes(cat.value)}
                          >
                            {cat.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={8} sm={3}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Hours"
                      value={activity.hours}
                      onChange={(e) =>
                        updateActivity(activity.id, "hours", e.target.value)
                      }
                      inputProps={{ step: "0.25", min: "0" }}
                    />
                  </Grid>

                  <Grid item xs={12} sm={4}>
                    <TextField
                      fullWidth
                      label="Description"
                      value={activity.description}
                      onChange={(e) =>
                        updateActivity(
                          activity.id,
                          "description",
                          e.target.value
                        )
                      }
                      multiline
                      rows={1}
                    />
                  </Grid>
                  <Grid item xs={4} sm={1}>
                    {activities.length > 1 && (
                      <IconButton
                        onClick={() => removeActivity(activity.id)}
                        color="error"
                      >
                        <Delete />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              </Box>
            );
          })}

          {activities.length < 3 && (
            <Button
              startIcon={<Add />}
              onClick={addActivity}
              sx={{ mb: 2, ml: 2 }}
            >
              Add Activity
            </Button>
          )}

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
