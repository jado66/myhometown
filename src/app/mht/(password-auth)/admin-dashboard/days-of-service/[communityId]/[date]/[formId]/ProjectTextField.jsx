import React from "react";
import { TextField, InputAdornment } from "@mui/material";

const ProjectTextField = ({
  label,
  value,
  onChange,
  hasInputAdornment,
  ...props
}) => {
  return (
    <TextField
      label={label}
      fullWidth
      value={value}
      onChange={onChange}
      {...props}
      variant="outlined"
      InputLabelProps={{
        shrink: value ? true : false,
        sx: { ml: hasInputAdornment ? 2 : 0 },
      }}
    />
  );
};

export default ProjectTextField;
