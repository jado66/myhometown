import { useState, useEffect } from "react";
import {
  Typography,
  TextField,
  Box,
  RadioGroup,
  Radio,
  FormControl,
  FormControlLabel,
  FormLabel,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useClassSignup } from "../ClassSignupContext";
import JsonViewer from "@/components/util/debug/DebugOutput";
import { Info } from "@mui/icons-material";

// Modified Volunteer Hours Component without minors section
export const VolunteerHours = ({ value, onChange, config }) => {
  const { resetKey, formData } = useClassSignup();

  // State for prep day question
  const [workingPrepDay, setWorkingPrepDay] = useState(
    value?.workingPrepDay || false
  );
  const [prepDayHours, setPrepDayHours] = useState(value?.prepDayHours || "");
  const [serviceDayHours, setServiceDayHours] = useState(
    value?.serviceDayHours || ""
  );

  useEffect(() => {
    // Reset form fields when the key changes
    setPrepDayHours("");
    setServiceDayHours("");
    setWorkingPrepDay(false);
  }, [resetKey]);

  // Update parent component with all values
  const updateParentComponent = (updates) => {
    onChange({
      workingPrepDay,
      prepDayHours: workingPrepDay ? prepDayHours : "",
      serviceDayHours,
      ...updates,
    });
  };

  // Handle prep day radio button change
  const handlePrepDayRadioChange = (e) => {
    const isWorking = e.target.value === "true";
    setWorkingPrepDay(isWorking);

    // Clear prep day hours if "No" is selected
    if (!isWorking) {
      setPrepDayHours("");
    }

    // Update parent with all current values
    updateParentComponent({
      workingPrepDay: isWorking,
      prepDayHours: isWorking ? prepDayHours : "",
    });
  };

  // Handle prep day hours change
  const handlePrepDayHoursChange = (e) => {
    setPrepDayHours(e.target.value);
    updateParentComponent({ prepDayHours: e.target.value });
  };

  // Handle service day hours change
  const handleServiceDayHoursChange = (e) => {
    setServiceDayHours(e.target.value);
    updateParentComponent({ serviceDayHours: e.target.value });
  };

  const totalVolunteers = formData.minorVolunteers?.length + 1 || 0;

  const hasMinors = formData.minorVolunteers?.length > 0;

  const totalHours =
    parseInt(prepDayHours || 0) +
    parseInt(serviceDayHours || 0) * totalVolunteers;

  return (
    <Box sx={{ mb: 3 }}>
      {/* Prep Day Section */}
      {/* Service Day Hours Section */}

      {/* <JsonViewer data={formData} /> */}

      <Box sx={{ mb: 4 }}>
        <TextField
          fullWidth
          label="How many hours are you working on the Day of Service?"
          type="number"
          inputProps={{ step: "0.5", min: "0.5" }}
          InputProps={{
            endAdornment: <Typography sx={{ ml: 1 }}>hours</Typography>,
          }}
          helperText={
            hasMinors &&
            "* This will be multiplied by the number of volunteers, please do not include minors' hours in this number"
          }
          value={serviceDayHours}
          onChange={handleServiceDayHoursChange}
          required
          size="medium"
        />
      </Box>

      <Box sx={{ mb: 4 }}>
        {formData.whoAreYou?.hasPrepDay && (
          <FormControl required fullWidth>
            <FormLabel id="prep-day-label">
              Are you working on the project's prep day?
            </FormLabel>
            <RadioGroup
              aria-labelledby="prep-day-label"
              name="workingPrepDay"
              value={workingPrepDay ? "true" : "false"}
              onChange={handlePrepDayRadioChange}
              row
            >
              <FormControlLabel value="false" control={<Radio />} label="No" />
              <FormControlLabel value="true" control={<Radio />} label="Yes" />
            </RadioGroup>
          </FormControl>
        )}

        {workingPrepDay && (
          <Box sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="How many hours are you working on the prep day?"
              type="number"
              inputProps={{ step: "0.5", min: "0.5" }}
              InputProps={{
                endAdornment: <Typography sx={{ ml: 1 }}>hours</Typography>,
              }}
              value={prepDayHours}
              onChange={handlePrepDayHoursChange}
              required
              size="medium"
            />
          </Box>
        )}

        <Box sx={{ mt: 2 }}>
          <TextField
            fullWidth
            label="Total Hours"
            type="number"
            InputProps={{
              readOnly: true,
              endAdornment: (
                <>
                  <Typography sx={{ ml: 1 }}>hours</Typography>
                  <Tooltip title="Total hours = Prep Day Hours + ( Service Day Hours * Number of Volunteers )">
                    <IconButton
                      size="large"
                      edge="end"
                      title="Copy Project ID to clipboard"
                      color="primary"
                    >
                      <Info fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </>
              ),
            }}
            value={totalHours}
            onChange={handlePrepDayHoursChange}
            required
            size="medium"
          />
        </Box>
      </Box>
    </Box>
  );
};
