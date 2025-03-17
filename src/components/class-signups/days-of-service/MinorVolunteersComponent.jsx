import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  IconButton,
  Grid,
  Paper,
  RadioGroup,
  Radio,
  FormControl,
  FormControlLabel,
  FormLabel,
  FormHelperText,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { useClassSignup } from "../ClassSignupContext";

// Minor Volunteers Component using MUI
export const MinorVolunteersComponent = ({
  field,
  config,
  value,
  onChange,
  error,
}) => {
  const { resetKey } = useClassSignup();

  // State to track form values for a new minor
  const [newMinor, setNewMinor] = useState({
    name: "",
    age: "",
  });

  // State to track validation errors
  const [errors, setErrors] = useState({
    name: "",
    age: "",
  });

  // Local state to control the Yes/No selection

  // Get minors array from props or initialize empty array
  const minors = value || [];

  const [hasMinors, setHasMinors] = useState(value?.length > 0);

  // Validate the form
  const validateForm = () => {
    const newErrors = {
      name: "",
      age: "",
    };

    let isValid = true;

    if (!newMinor.name.trim()) {
      newErrors.name = "Name is required";
      isValid = false;
    }

    const age = parseInt(newMinor.age, 10);
    if (isNaN(age) || age < 1) {
      newErrors.age = "Age must be at least 1";
      isValid = false;
    } else if (age >= 18) {
      newErrors.age = "Age must be less than 18";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  useEffect(() => {
    // Reset form fields when the key changes
    setNewMinor({
      name: "",
      age: "",
    });
    setErrors({
      name: "",
      age: "",
    });
  }, [resetKey]);

  // Handle radio button change
  const handleRadioChange = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Convert string "true"/"false" to actual boolean
    const hasMinors = e.target.value === "true";

    // Update local state
    setHasMinors(hasMinors);

    // Update parent component with hasMinors flag
    onChange(
      hasMinors ? minors : [] // Clear minors if "No" is selected
    );
  };

  // Handle form submission to add a new minor
  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (validateForm()) {
      const formattedMinor = {
        name: newMinor.name,
        age: parseInt(newMinor.age, 10),
        hours: parseFloat(newMinor.hours),
      };

      const updatedMinors = [...minors, formattedMinor];

      // Update parent component with new list
      onChange(updatedMinors);

      // Reset form fields
      setNewMinor({
        name: "",
        age: "",
        hours: "",
      });
    }
  };

  // Handle input changes
  const handleInputChange = (field, value) => {
    setNewMinor({
      ...newMinor,
      [field]: value,
    });

    // Clear error when field is edited
    if (errors[field]) {
      setErrors({
        ...errors,
        [field]: "",
      });
    }
  };

  // Handle deleting a minor
  const handleDelete = (index) => {
    const updatedMinors = [...value];
    updatedMinors.splice(index, 1);

    onChange(updatedMinors);
  };

  // Calculate total hours
  const totalHours = minors
    .reduce((sum, minor) => sum + (parseFloat(minor.hours) || 0), 0)
    .toFixed(1);

  const shouldShowMinorsSection = hasMinors || value?.length > 0;

  return (
    <Box sx={{ mb: 3 }}>
      <FormControl required={config.required} error={!!error} fullWidth>
        <FormLabel id={`${field}-label`}>{config.label}</FormLabel>
        <RadioGroup
          aria-labelledby={`${field}-label`}
          name={field}
          value={hasMinors ? "true" : "false"}
          onChange={handleRadioChange}
          row
        >
          <FormControlLabel value="true" control={<Radio />} label="Yes" />
          <FormControlLabel value="false" control={<Radio />} label="No" />
        </RadioGroup>
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
      {shouldShowMinorsSection && (
        <Card
          sx={{
            mt: 2,
            mb: 4,
          }}
          variant="outlined"
        >
          <CardContent
            sx={{
              backgroundColor: "grey.100",
            }}
          >
            {/* Volunteer List Section */}
            <Box sx={{ mb: 3 }}>
              {minors.length === 0 ? (
                <Typography color="text.secondary">
                  Please add minor volunteers below
                </Typography>
              ) : (
                <Box sx={{ mb: 2 }}>
                  {/* Column Headers */}
                  <Grid container spacing={2} sx={{ px: 2, mb: 1 }}>
                    <Grid item xs={4}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Name
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Age
                      </Typography>
                    </Grid>

                    <Grid item xs={1}></Grid>
                  </Grid>

                  {/* Volunteer List */}
                  <Box sx={{ mb: 2 }}>
                    {minors.map((minor, index) => (
                      <Paper
                        key={index}
                        sx={{
                          p: 1,
                          mb: 1,
                          borderBottom: 1,
                          borderColor: "divider",

                          display: "flex",
                          alignItems: "center",
                        }}
                        variant="ghost"
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={4}>
                            <Typography>{minor.name}</Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography>{minor.age}</Typography>
                          </Grid>

                          <Grid item xs={1}>
                            <IconButton
                              size="small"
                              onClick={() => handleDelete(index)}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Box>

                  {/* Total Hours */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "flex-end",
                      pt: 1,
                    }}
                  >
                    <Typography>
                      <strong>
                        Total Hours:
                        {totalHours}
                      </strong>
                    </Typography>
                  </Box>
                </Box>
              )}
            </Box>

            {/* Add New Volunteer Form */}
            <Box>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Add Minor Volunteer
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="First and Last Name"
                    value={newMinor.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                    size="medium"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Age"
                    type="number"
                    inputProps={{ min: 1, max: 17 }}
                    value={newMinor.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    error={!!errors.age}
                    helperText={errors.age}
                    required
                    size="medium"
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    fullWidth
                    label="Hours Volunteered"
                    type="number"
                    inputProps={{ step: "0.1", min: "0.1" }}
                    value={newMinor.hours}
                    onChange={(e) => handleInputChange("hours", e.target.value)}
                    error={!!errors.hours}
                    helperText={errors.hours}
                    required
                    size="medium"
                  />
                </Grid>
              </Grid>
              <Box sx={{ mt: 2 }}>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  color="primary"
                >
                  Add Minor Volunteer
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
