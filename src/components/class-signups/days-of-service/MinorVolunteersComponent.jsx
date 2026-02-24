import { useState, useEffect, useRef, useCallback } from "react";
import {
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Box,
  Divider,
  Grid,
  Paper,
  RadioGroup,
  Radio,
  FormControl,
  FormControlLabel,
  FormLabel,
  FormHelperText,
  Alert,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { useClassSignup } from "../ClassSignupContext";

export const MinorVolunteersComponent = ({
  field,
  config,
  value,
  onChange,
  error,
}) => {
  const { resetKey } = useClassSignup();

  const [newMinor, setNewMinor] = useState({
    name: "",
    age: "",
  });

  const [errors, setErrors] = useState({
    name: "",
    age: "",
  });

  const [hasMinors, setHasMinors] = useState(null);

  // Index of the most recently added minor, used for the green flash highlight
  const [lastAddedIndex, setLastAddedIndex] = useState(null);

  // Refs for focus management and blur detection
  const nameInputRef = useRef(null);
  const formAreaRef = useRef(null);

  const minors = value || [];

  // Derived: does the user have unsaved data in the fields?
  const hasUnsavedData = newMinor.name.trim() !== "" || newMinor.age !== "";

  // ── Validation ──────────────────────────────────────────────

  const validateForm = useCallback(() => {
    const newErrors = { name: "", age: "" };
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
  }, [newMinor]);

  // Silent check – returns whether both fields are valid without setting
  // error messages (used for auto-add on blur so we don't flash red when
  // the user simply hasn't finished typing yet).
  const isFormSilentlyValid = useCallback(() => {
    if (!newMinor.name.trim()) return false;
    const age = parseInt(newMinor.age, 10);
    if (isNaN(age) || age < 1 || age >= 18) return false;
    return true;
  }, [newMinor]);

  // ── Reset on resetKey ───────────────────────────────────────

  useEffect(() => {
    setNewMinor({ name: "", age: "" });
    setErrors({ name: "", age: "" });
    setHasMinors(null);
    setLastAddedIndex(null);
  }, [resetKey]);

  // ── Handlers ────────────────────────────────────────────────

  const handleRadioChange = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const selected = e.target.value === "true";
    setHasMinors(selected);
    onChange(selected ? minors : []);
  };

  // Core add logic – shared by button click, Enter key, and blur
  const addMinor = useCallback(
    (opts = {}) => {
      const { silent = false } = opts;

      // For auto-add (silent), only proceed if valid without showing errors
      if (silent && !isFormSilentlyValid()) return false;
      if (!silent && !validateForm()) return false;

      const formattedMinor = {
        name: newMinor.name.trim(),
        age: parseInt(newMinor.age, 10),
      };

      const updatedMinors = [...minors, formattedMinor];
      onChange(updatedMinors);

      // Flash the new row green
      const newIndex = updatedMinors.length - 1;
      setLastAddedIndex(newIndex);
      setTimeout(() => setLastAddedIndex(null), 2000);

      // Reset form
      setNewMinor({ name: "", age: "" });
      setErrors({ name: "", age: "" });

      // Return focus to name field for sequential entry
      setTimeout(() => nameInputRef.current?.focus(), 50);

      return true;
    },
    [newMinor, minors, onChange, isFormSilentlyValid, validateForm],
  );

  // Explicit button click
  const handleSubmit = (e) => {
    e.preventDefault();
    e.stopPropagation();
    addMinor({ silent: false });
  };

  // Enter key in either field
  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      addMinor({ silent: false });
    }
  };

  // Auto-add when focus leaves the form area entirely
  const handleBlurForm = (e) => {
    // relatedTarget is the element receiving focus. If it's still inside our
    // form wrapper, the user is just tabbing between fields – do nothing.
    if (formAreaRef.current && formAreaRef.current.contains(e.relatedTarget)) {
      return;
    }

    // Focus left the form area – try to silently auto-add
    addMinor({ silent: true });
  };

  const handleInputChange = (fieldName, val) => {
    setNewMinor((prev) => ({ ...prev, [fieldName]: val }));
    if (errors[fieldName]) {
      setErrors((prev) => ({ ...prev, [fieldName]: "" }));
    }
  };

  const handleDelete = (index) => {
    const updatedMinors = [...value];
    updatedMinors.splice(index, 1);
    onChange(updatedMinors);
  };

  const shouldShowMinorsSection = hasMinors || value?.length > 0;

  // ── Render ──────────────────────────────────────────────────

  return (
    <Box sx={{ mb: 3 }}>
      {/* ── Yes / No radio ──────────────────────────────────── */}
      <FormControl required={config.required} error={!!error} fullWidth>
        <FormLabel id={`${field}-label`} sx={{ fontSize: "1.05rem", mb: 0.5 }}>
          {config.label}
        </FormLabel>
        <RadioGroup
          aria-labelledby={`${field}-label`}
          name={field}
          value={hasMinors}
          onChange={handleRadioChange}
          row
        >
          <FormControlLabel
            value="true"
            control={<Radio sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }} />}
            label={<Typography sx={{ fontSize: "1rem" }}>Yes</Typography>}
            sx={{ mr: 4 }}
          />
          <FormControlLabel
            value="false"
            control={<Radio sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }} />}
            label={<Typography sx={{ fontSize: "1rem" }}>No</Typography>}
          />
        </RadioGroup>
        {error && (
          <FormHelperText sx={{ fontSize: "0.95rem" }}>{error}</FormHelperText>
        )}
      </FormControl>

      {/* ── Minors section ──────────────────────────────────── */}
      {shouldShowMinorsSection && (
        <Card sx={{ mt: 2, mb: 4 }} variant="outlined">
          <CardContent sx={{ backgroundColor: "grey.100", py: 3 }}>
            {/* ── List of added minors ──────────────────────── */}
            <Box sx={{ mb: 3 }}>
              {minors.length === 0 ? (
                <Typography color="text.secondary" sx={{ fontSize: "1rem" }}>
                  Please add minor volunteers below
                </Typography>
              ) : (
                <Box sx={{ mb: 2 }}>
                  {/* Column headers */}
                  <Grid container spacing={2} sx={{ px: 2, mb: 1 }}>
                    <Grid item xs={5}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontSize: "0.95rem" }}
                      >
                        Name
                      </Typography>
                    </Grid>
                    <Grid item xs={3}>
                      <Typography
                        variant="subtitle2"
                        color="text.secondary"
                        sx={{ fontSize: "0.95rem" }}
                      >
                        Age
                      </Typography>
                    </Grid>
                    <Grid item xs={4} />
                  </Grid>

                  {/* Minor rows */}
                  <Box sx={{ mb: 2 }}>
                    {minors.map((minor, index) => (
                      <Paper
                        key={index}
                        sx={{
                          p: 1.5,
                          mb: 1,
                          display: "flex",
                          alignItems: "center",
                          transition: "background-color 0.6s ease",
                          backgroundColor:
                            lastAddedIndex === index
                              ? "success.light"
                              : "background.paper",
                        }}
                        variant="outlined"
                      >
                        <Grid container spacing={2} alignItems="center">
                          <Grid item xs={5}>
                            <Typography sx={{ fontSize: "1rem" }}>
                              {minor.name}
                            </Typography>
                          </Grid>
                          <Grid item xs={3}>
                            <Typography sx={{ fontSize: "1rem" }}>
                              {minor.age}
                            </Typography>
                          </Grid>
                          <Grid item xs={4}>
                            <Button
                              size="medium"
                              color="error"
                              startIcon={<DeleteIcon />}
                              onClick={() => handleDelete(index)}
                              sx={{ fontSize: "0.9rem" }}
                            >
                              Remove
                            </Button>
                          </Grid>
                        </Grid>
                      </Paper>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>

            <Divider sx={{ mb: 3 }} />

            {/* ── Add new minor form ───────────────────────── */}
            <Box ref={formAreaRef} onBlur={handleBlurForm}>
              <Typography variant="h6" sx={{ mb: 1.5, fontSize: "1.15rem" }}>
                Add Minor Volunteer
              </Typography>

              {/* Warning banner when fields have unsaved data */}
              {hasUnsavedData && (
                <Alert severity="warning" sx={{ mb: 2, fontSize: "0.95rem" }}>
                  You have entered information below but haven't added it yet.
                  Press the <strong>Add Minor Volunteer</strong> button or hit{" "}
                  <strong>Enter</strong> to save.
                </Alert>
              )}

              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    inputRef={nameInputRef}
                    label="First and Last Name"
                    value={newMinor.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    onKeyDown={handleKeyDown}
                    error={!!errors.name}
                    helperText={errors.name}
                    required
                    size="medium"
                    InputProps={{ sx: { fontSize: "1rem" } }}
                    InputLabelProps={{ sx: { fontSize: "1rem" } }}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth
                    label="Age"
                    type="number"
                    inputProps={{ min: 1, max: 17 }}
                    value={newMinor.age}
                    onChange={(e) => handleInputChange("age", e.target.value)}
                    onKeyDown={handleKeyDown}
                    error={!!errors.age}
                    helperText={errors.age}
                    required
                    size="medium"
                    InputProps={{ sx: { fontSize: "1rem" } }}
                    InputLabelProps={{ sx: { fontSize: "1rem" } }}
                  />
                </Grid>
              </Grid>

              <Box sx={{ mt: 2.5 }}>
                <Button
                  onClick={handleSubmit}
                  variant="contained"
                  color="primary"
                  size="large"
                  fullWidth
                  startIcon={<AddIcon />}
                  sx={{
                    fontSize: "1.1rem",
                    py: 1.5,
                    fontWeight: 600,
                  }}
                >
                  Add Minor Volunteer
                </Button>
              </Box>
            </Box>

            <Typography
              color="text.secondary"
              sx={{ mt: 2.5, fontSize: "0.95rem" }}
            >
              * Hours will be collected below
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};
