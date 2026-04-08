import React from "react";
import { Card, CardContent, Typography, TextField } from "@mui/material";

interface MissionaryNotesSectionProps {
  formData: any;
  setFormData: (fn: (prev: any) => any) => void;
}

const MissionaryNotesSection: React.FC<MissionaryNotesSectionProps> = ({
  formData,
  setFormData,
}) => (
  <>
    <Typography variant="h6" fontWeight="bold" gutterBottom>
      Notes
    </Typography>
    <TextField
      label="Notes"
      multiline
      rows={4}
      fullWidth
      size="small"
      value={formData.notes}
      onChange={(e) =>
        setFormData((prev: any) => ({ ...prev, notes: e.target.value }))
      }
      placeholder={`Additional notes about this ${formData.person_type}'s service...`}
    />
  </>
);

export default MissionaryNotesSection;
