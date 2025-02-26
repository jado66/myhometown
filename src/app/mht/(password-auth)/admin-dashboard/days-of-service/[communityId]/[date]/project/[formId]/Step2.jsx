import React from "react";
import { Box, Typography, Divider, Alert, InputAdornment } from "@mui/material";
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
      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        Detailed Planning
      </Typography>

      <ProjectTextField
        label="Resource Couple"
        value={formData.project_development_couple}
        onChange={(e) =>
          handleInputChange("project_development_couple", e.target.value)
        }
      />
      <ProjectTextField
        label="Resource Couple Phone Number (1)"
        value={formData.project_development_couple_phone1}
        onChange={(e) =>
          handleInputChange("project_development_couple_phone1", e.target.value)
        }
      />
      <ProjectTextField
        label="Resource Couple Email (1)"
        value={formData.project_development_couple_email1}
        onChange={(e) =>
          handleInputChange("project_development_couple_email1", e.target.value)
        }
      />
      <ProjectTextField
        label="Resource Couple Phone Number (2)"
        value={formData.project_development_couple_phone2}
        onChange={(e) =>
          handleInputChange("project_development_couple_phone2", e.target.value)
        }
      />
      <ProjectTextField
        label="Resource Couple Email (2)"
        value={formData.project_development_couple_email2}
        onChange={(e) =>
          handleInputChange("project_development_couple_email2", e.target.value)
        }
      />
      <ProjectTextField
        label="Preferred Remedies"
        multiline
        rows={4}
        value={formData.preferred_remedies}
        onChange={(e) =>
          handleInputChange("preferred_remedies", e.target.value)
        }
      />

      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        Task Planning
      </Typography>
      <TaskTable
        value={formData.tasks}
        onChange={(newTasks) => handleInputChange("tasks", newTasks)}
        hideResources={true}
      />

      <Typography variant="h4" component="h1" gutterBottom>
        Project Setup
      </Typography>
      <ProjectResources
        formData={formData}
        handleInputChange={handleInputChange}
        handleToolAdd={handleToolAdd}
      />

      <Divider sx={{ my: 1 }} />
      <Box sx={{ mt: 3 }}>
        <ProjectTextField
          label="Number of Volunteers Needed"
          type="number"
          key="volunteers_needed"
          min={0}
          value={formData.volunteers_needed}
          onChange={(e) =>
            handleInputChange("volunteers_needed", e.target.value)
          }
        />
      </Box>
    </Box>
  );
};

export default Step2;
