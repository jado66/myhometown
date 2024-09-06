import React, { useState, useEffect, useRef } from "react";
import {
  ClickAwayListener,
  TextField,
  Typography,
  styled,
} from "@mui/material";

const StyledTextField = ({
  value,
  onChange,
  variant = "body1",
  sx,
  placeholder = "Click to edit",
  ...props
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [tempValue, setTempValue] = useState(value);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  useEffect(() => {
    setTempValue(value);
  }, [value]);

  const handleClick = () => {
    setIsEditing(true);
  };

  const handleChange = (e) => {
    setTempValue(e.target.value);
  };

  const handleBlur = () => {
    setIsEditing(false);
    onChange(tempValue);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      handleBlur();
    }
  };

  if (isEditing) {
    return (
      <ClickAwayListener onClickAway={handleBlur}>
        <TextField
          inputRef={inputRef}
          value={tempValue}
          multiline
          onChange={handleChange}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          inputProps={{
            sx: sx,
            font: "inherit",
            color: "inherit",
            background: "transparent",
            border: "none",
            borderBottom: "1px dotted",
            outline: "none",
            padding: 0,
            margin: 0,
            width: "100%",
          }}
          fullWidth
        />
      </ClickAwayListener>
    );
  }

  return (
    <Typography
      variant={variant}
      onClick={handleClick}
      style={{ cursor: "text" }}
      {...sx}
    >
      {value || <span style={{ color: "#aaa" }}>{placeholder}</span>}
    </Typography>
  );
};

export default StyledTextField;
