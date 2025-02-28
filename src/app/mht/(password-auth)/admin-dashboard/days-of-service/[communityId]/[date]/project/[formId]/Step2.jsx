import React from "react";
import {
  Box,
  Typography,
  Divider,
  Alert,
  InputAdornment,
  FormControlLabel,
  Checkbox,
} from "@mui/material";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import ProjectTextField from "./ProjectTextField";
import TaskTable from "@/components/days-of-service/form-components/TaskTable";
import { ProjectResources } from "./ProjectResources";

const Step2 = () => {
  const { formData, handleInputChange } = useProjectForm();

  const handleToolAdd = (e, category) => {
    if (e.key === "Enter" && e.target.value.trim()) {
      e.preventDefault();
      const value = e.target.value.trim();
      const categoryMap = {
        tools: "volunteerTools",
        equipment: "equipment",
        homeownerMaterials: "homeownerMaterials",
        otherMaterials: "otherMaterials",
      };
      const fieldName = categoryMap[category];
      const currentItems = formData[fieldName] || [];
      const newItems = [...currentItems, value];
      handleInputChange(fieldName, newItems);
      e.target.value = "";
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h4" sx={{ mt: 2, mb: 1, textAlign: "center" }}>
        This step of the form is typically filled out by the Resource Couple
      </Typography>
      <Divider sx={{ mt: 2 }} />
      <Typography variant="h5" sx={{ mb: 0 }}>
        Resource Couple Information
      </Typography>
      <Typography variant="subtitle" sx={{ mb: 1 }}>
        The Resource Couple are the primary contacts for the project. They are
        the detailed planners and interact with property owners and volunteers.
        Their contact information is used to communicate with the project team.
      </Typography>

      {/* Assigned Ward  */}
      <ProjectTextField
        label="Encompassing Ward"
        key="project_development_couple_ward"
        value={formData.project_development_couple_ward}
        onChange={(e) =>
          handleInputChange("project_development_couple_ward", e.target.value)
        }
        helperText="The ward/group whose geographical boundaries encompass this property location."
      />

      <ProjectTextField
        label="Resource Couple"
        key="project_development_couple"
        value={formData.project_development_couple}
        onChange={(e) =>
          handleInputChange("project_development_couple", e.target.value)
        }
      />
      <ProjectTextField
        label="Resource Couple Phone Number (1)"
        key="project_development_couple_phone1"
        value={formData.project_development_couple_phone1}
        onChange={(e) =>
          handleInputChange("project_development_couple_phone1", e.target.value)
        }
      />
      <ProjectTextField
        label="Resource Couple Email (1)"
        key="project_development_couple_email1"
        value={formData.project_development_couple_email1}
        onChange={(e) =>
          handleInputChange("project_development_couple_email1", e.target.value)
        }
      />
      <ProjectTextField
        label="Resource Couple Phone Number (2)"
        key="project_development_couple_phone2"
        value={formData.project_development_couple_phone2}
        onChange={(e) =>
          handleInputChange("project_development_couple_phone2", e.target.value)
        }
      />
      <ProjectTextField
        label="Resource Couple Email (2)"
        key="project_development_couple_email2"
        value={formData.project_development_couple_email2}
        onChange={(e) =>
          handleInputChange("project_development_couple_email2", e.target.value)
        }
      />

      <Divider />

      <Typography variant="h5" sx={{ mb: 1 }}>
        Detailed Planning
      </Typography>

      <ProjectTextField
        label="Work Summary"
        multiline
        key="work_summary"
        rows={4}
        value={formData.work_summary}
        onChange={(e) => handleInputChange("work_summary", e.target.value)}
      />
      <ProjectTextField
        label="Preferred Remedies"
        multiline
        key="preferred_remedies"
        rows={4}
        value={formData.preferred_remedies}
        onChange={(e) =>
          handleInputChange("preferred_remedies", e.target.value)
        }
      />

      <Divider />

      <Typography variant="h5" sx={{ mb: 1 }}>
        Task Planning
      </Typography>
      <TaskTable
        value={formData.tasks}
        onChange={(newTasks) => handleInputChange("tasks", newTasks)}
        hideResources={true}
      />

      <Divider />

      <Typography variant="h5" gutterBottom>
        Project Setup
      </Typography>
      <ProjectResources
        formData={formData}
        handleInputChange={handleInputChange}
        handleToolAdd={handleToolAdd}
      />

      <Divider />
      <Typography variant="h5" gutterBottom>
        Volunteers
      </Typography>

      {/* are_blue_stakes_needed, is_dumpster_needed, is_second_dumpster_needed */}

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.are_blue_stakes_needed}
            onChange={(e) =>
              handleInputChange("are_blue_stakes_needed", e.target.checked)
            }
          />
        }
        label="Blue stakes will be required for this project"
      />
      <Divider />

      <FormControlLabel
        control={
          <Checkbox
            checked={formData.is_dumpster_needed}
            onChange={(e) =>
              handleInputChange("is_dumpster_needed", e.target.checked)
            }
          />
        }
        label="A dumpster is needed for this project"
      />
      <Divider />
      {formData.is_dumpster_needed && (
        <>
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.is_second_dumpster_needed}
                onChange={(e) =>
                  handleInputChange(
                    "is_second_dumpster_needed",
                    e.target.checked
                  )
                }
              />
            }
            label="A second dumpster is needed for this project"
          />
          <Divider />
        </>
      )}

      {/* blue stakes */}
      {/* dumpster */}
      {/* do you need a second  */}

      <ProjectTextField
        label="Number of Volunteers Needed"
        type="number"
        key="volunteers_needed"
        min={0}
        value={formData.volunteers_needed}
        onChange={(e) => handleInputChange("volunteers_needed", e.target.value)}
      />
    </Box>
  );
};

export default Step2;
