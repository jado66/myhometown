import React from "react";
import ReactSelect from "react-select";

// App-wide themed styles for ReactSelect
const selectStyles = {
  control: (base, state) => ({
    ...base,
    minHeight: "40px",
    fontSize: "14px",
    borderColor: state.isFocused ? "#318D43" : base.borderColor, // green border on focus
    boxShadow: state.isFocused ? "0 0 0 2px #c7eacdff" : base.boxShadow, // subtle green shadow
    "&:hover": {
      borderColor: "#4fb163", // lighter green on hover
    },
  }),
  menu: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  menuPortal: (base) => ({
    ...base,
    zIndex: 9999,
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#318D43" // selected: green
      : state.isFocused
      ? "#ebf8edff" // focused: green tint
      : base.backgroundColor,
    color: state.isSelected
      ? "#fff" // selected: white text
      : state.isFocused
      ? "#4fb163" // focused: green text
      : base.color,
    fontWeight: state.isSelected ? 600 : 400,
    cursor: "pointer",
    // Remove blue background on active (mouse down) state
    ":active": {
      backgroundColor: state.isSelected
        ? "#318D43"
        : state.isFocused
        ? "#ebf8edff"
        : base.backgroundColor,
    },
  }),
  placeholder: (base) => ({
    ...base,
    color: "#686868",
    fontStyle: "italic",
  }),

  indicatorSeparator: (base) => ({
    ...base,
    backgroundColor: "#c7eac7ff",
  }),
  dropdownIndicator: (base, state) => ({
    ...base,
    color: state.isFocused ? "#318D43" : base.color,
    "&:hover": {
      color: "#4fb163",
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    "&:hover": {
      color: "#318D43",
    },
  }),
};

/**
 * ThemedReactSelect wraps react-select with app-wide theme styles.
 * Pass all react-select props as usual.
 */
const ThemedReactSelect = (props) => {
  return (
    <ReactSelect
      menuPortalTarget={
        typeof window !== "undefined" ? document.body : undefined
      }
      styles={selectStyles}
      {...props}
    />
  );
};

export default ThemedReactSelect;
