"use client";

import React from "react";
import { TableCell } from "@mui/material";

const TightedCell = ({ children, align = "left" }) => (
  <TableCell sx={{ p: 1, textTransform: "capitalize" }} align={align}>
    {children}
  </TableCell>
);

export default TightedCell;
