import React from "react";
import {
  Box,
  Paper,
  FormControl,
  FormLabel,
  FormControlLabel,
  Checkbox,
  Divider,
} from "@mui/material";
import { useProjectForm } from "@/contexts/ProjectFormProvider";

const Step5 = () => {
  const { formData, handleInputChange } = useProjectForm();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
      <FormLabel component="legend">Procurement Status</FormLabel>
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.materials_procured}
            onChange={(e) =>
              handleInputChange("materials_procured", e.target.checked)
            }
          />
        }
        label="Have the materials been ordered?"
      />
      <Divider />

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.tools_arranged}
            onChange={(e) =>
              handleInputChange("tools_arranged", e.target.checked)
            }
          />
        }
        label="Have arrangements been made for the tools and equipment?"
      />
      <Divider />

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.materials_on_site}
            onChange={(e) =>
              handleInputChange("materials_on_site", e.target.checked)
            }
          />
        }
        label="Are materials on site?"
      />
      <Divider />

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.called_811}
            onChange={(e) => handleInputChange("called_811", e.target.checked)}
          />
        }
        label="Have the Neighborhood Services Directors requested called Blue Stakes?"
      />
      <Divider />

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.dumpster_requested}
            onChange={(e) =>
              handleInputChange("dumpster_requested", e.target.checked)
            }
          />
        }
        label="Have the Neighborhood Services Directors requested a dumpster from the city?"
      />
    </Box>
  );
};

export default Step5;
