import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  FormControl,
  FormHelperText,
  Box,
  CircularProgress,
  Typography,
  Paper,
} from "@mui/material";
import { useParams } from "next/navigation";
import { useDaysOfService } from "@/hooks/useDaysOfService";
import moment from "moment";
import Select from "react-select";
import { InfoOutlined } from "@mui/icons-material";

export const DayOfServiceAssignmentDialog = ({
  open,
  onClose,
  onConfirm,
  currentValue = null,
  title = "Assign to Day of Service & Organization",
  allowNoAssignment = true, // New prop to control whether to show the "No Assignment" option
}) => {
  const [selectedOption, setSelectedOption] = useState(currentValue);
  const [groupedOptions, setGroupedOptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);

  const params = useParams();
  const { fetchDaysOfServiceByCommunity } = useDaysOfService();

  useEffect(() => {
    const fetchServiceOptions = async () => {
      if (!params?.communityId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const communityId = params.communityId;

        const { data } = await fetchDaysOfServiceByCommunity(communityId);

        if (!data) {
          throw new Error("No data returned");
        }

        // Sort the data by end_date
        const sortedData = [...data].sort(
          (a, b) => moment(a.end_date).valueOf() - moment(b.end_date).valueOf()
        );

        // Create grouped options structure
        const groups = sortedData.map((day) => {
          // Format day label with date
          const dayLabel = moment(day.end_date).format("dddd, MMMM Do, YYYY");

          // Create organization options from partner_stakes
          const orgOptions = Array.isArray(day.partner_stakes)
            ? day.partner_stakes.map((stake) => {
                // Handle both string and object formats
                const stakeData =
                  typeof stake === "string" ? JSON.parse(stake) : stake;
                return {
                  value: `${day.id}|${stakeData.id}`,
                  label: stakeData.name,
                  dayId: day.id,
                  stakeId: stakeData.id,
                };
              })
            : [];

          return {
            label: dayLabel,
            options: orgOptions,
          };
        });

        // Filter out any groups with no organization options
        const filteredGroups = groups.filter(
          (group) => group.options.length > 0
        );

        setGroupedOptions(filteredGroups);
      } catch (err) {
        console.error("Error fetching service days and organizations:", err);
        setFetchError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      fetchServiceOptions();
    }
  }, [open, params, fetchDaysOfServiceByCommunity]);

  const handleChange = (option) => {
    setSelectedOption(option);
  };

  const handleConfirm = () => {
    if (selectedOption) {
      // Check if this is the "No Assignment" option
      if (selectedOption.value === "no-assignment") {
        onConfirm(null);
      } else {
        // Parse the combined value to get dayId and stakeId
        const [dayId, stakeId] = selectedOption.value.split("|");
        onConfirm({
          dayId,
          stakeId,
          fullOption: selectedOption,
        });
      }
    } else {
      // If nothing is selected, pass null
      onConfirm(null);
    }
    onClose();
  };

  // Generate the final options list with an optional "No Assignment" at the top
  const finalOptions = () => {
    const options = [...groupedOptions];

    if (allowNoAssignment) {
      // Add the "No Assignment" option at the top level
      options.unshift({
        label: "No Assignment",
        options: [
          {
            value: "no-assignment",
            label: "No Assignment (Clear current assignment)",
          },
        ],
      });
    }

    return options;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: 2,
          height: "80vh",
          boxShadow: "0 8px 32px rgba(0, 0, 0, 0.1)",
        },
      }}
    >
      <DialogTitle
        sx={{
          bgcolor: "primary.main",
          color: "primary.contrastText",
          py: 2,
        }}
      >
        {title}
      </DialogTitle>

      <DialogContent sx={{ mt: 2, pb: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: 2,
            mb: 3,
            bgcolor: "info.lighter",
            border: "1px solid",
            borderColor: "info.light",
            display: "flex",
            alignItems: "flex-start",
          }}
        >
          <InfoOutlined sx={{ mr: 1, color: "info.main", mt: 0.5 }} />
          <DialogContentText sx={{ color: "text.primary" }}>
            <Typography variant="subtitle1" fontWeight="medium">
              Important Assignment Information
            </Typography>
            <Typography variant="body2" sx={{ mt: 1 }}>
              This assignment will determine which day of service and
              organization this project belongs to. Once set, this assignment
              should not be changed without careful consideration, as it affects
              volunteer coordination, reporting, and resource allocation.
              {allowNoAssignment && (
                <>
                  {" "}
                  You can select "No Assignment" to clear the current
                  assignment.
                </>
              )}
            </Typography>
          </DialogContentText>
        </Paper>

        <FormControl fullWidth>
          {loading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 3 }}>
              <CircularProgress size={32} />
            </Box>
          ) : fetchError ? (
            <FormHelperText
              error
              sx={{ textAlign: "center", fontSize: "1rem", mt: 2 }}
            >
              {fetchError}
            </FormHelperText>
          ) : groupedOptions.length === 0 && !allowNoAssignment ? (
            <Typography color="error" sx={{ textAlign: "center", my: 2 }}>
              No organizations are available. Please create a day of service and
              add organizations first.
            </Typography>
          ) : (
            <>
              <Typography variant="subtitle2" gutterBottom sx={{ ml: 1 }}>
                Select Day of Service & Organization:
              </Typography>
              <Select
                placeholder="Select a day of service and organization"
                options={finalOptions()}
                value={selectedOption}
                onChange={handleChange}
                className="react-select-container"
                classNamePrefix="react-select"
                isClearable={false}
                isSearchable
                styles={{
                  control: (baseStyles) => ({
                    ...baseStyles,
                    minHeight: "56px",
                    borderRadius: "4px",
                  }),
                  placeholder: (baseStyles) => ({
                    ...baseStyles,
                    color: "#757575",
                  }),
                  groupHeading: (baseStyles) => ({
                    ...baseStyles,
                    fontWeight: "bold",
                    fontSize: "0.9em",
                    color: "#212121",
                    padding: "8px 12px",
                    backgroundColor: "#f5f5f5",
                  }),
                }}
              />
            </>
          )}
        </FormControl>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit" variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          color="primary"
          variant="contained"
          disabled={loading}
        >
          Confirm Assignment
        </Button>
      </DialogActions>
    </Dialog>
  );
};
