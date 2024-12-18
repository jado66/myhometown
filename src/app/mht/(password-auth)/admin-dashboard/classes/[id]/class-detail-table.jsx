import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
} from "@mui/material";
import { processSignupData } from "@/util/classes/processSignupData";

export default function ClassDetailTable({ classData, onClose }) {
  const { fields, processedSignups } = processSignupData(classData);

  if (!classData) {
    return null;
  }

  return (
    <TableContainer component={Paper} sx={{ mt: 4, overflowX: "auto" }}>
      <Table sx={{ minWidth: 650 }} aria-label="signup table">
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            {fields.map((field) => (
              <TableCell key={field.key}>{field.label}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {processedSignups.map((signup) => (
            <TableRow key={signup.id}>
              <TableCell component="th" scope="row">
                {signup.id}
              </TableCell>
              {fields.map((field) => (
                <TableCell key={`${signup.id}-${field.key}`}>
                  {signup[field.key]}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
}
