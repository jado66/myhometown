import React from "react";
import { TextField, InputAdornment } from "@mui/material";

const ProjectTextField = ({
  label,
  value,
  onChange,
  hasInputAdornment,
  min,
  max,
  type,
  ...props
}) => {
  // Handle input change with validation
  const handleInputChange = (e) => {
    const newValue = e.target.value;

    // For number inputs, validate against min/max
    if (type === "number") {
      // Allow empty value (to clear the field)
      if (newValue === "") {
        onChange(e);
        return;
      }

      const numValue = Number(newValue);

      // Check if the value is within bounds
      if (
        (min === undefined || numValue >= min) &&
        (max === undefined || numValue <= max)
      ) {
        onChange(e);
      }
    } else {
      // For non-number types, pass through
      onChange(e);
    }
  };

  return (
    <TextField
      label={label}
      fullWidth
      value={value}
      onChange={handleInputChange}
      type={type}
      inputProps={{
        min: min,
        max: max,
      }}
      {...props}
      variant="outlined"
      InputLabelProps={{
        shrink: value !== undefined ? true : false,
        sx: { ml: hasInputAdornment && value === undefined ? 2 : 0 },
      }}
    />
  );
};

export default ProjectTextField;
