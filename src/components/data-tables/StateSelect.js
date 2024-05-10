import React, { useState } from "react";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import { FormControl, InputLabel } from "@mui/material";

const states = ["Utah", "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware", "District Of Columbia", "Florida", "Georgia", 
"Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota",
"Mississippi", "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York", "North Carolina", 
"North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Vermont",
"Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"];

const StateSelect = ({ sx, fullWidth, ...otherProps }) => {
   
    return (
    <FormControl sx={sx} fullWidth={fullWidth} >
        <InputLabel>{otherProps.label}</InputLabel>
        <Select  {...otherProps} >
            {states.map((state) => (
                <MenuItem key={state} value={state}>
                    {state}
                </MenuItem>
            ))}
        </Select>
    </FormControl>
  );
};

export default StateSelect;