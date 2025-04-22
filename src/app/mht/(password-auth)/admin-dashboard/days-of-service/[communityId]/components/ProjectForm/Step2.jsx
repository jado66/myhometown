import React from "react";
import {
  Box,
  Typography,
  Divider,
  Alert,
  InputAdornment,
  FormControlLabel,
  Checkbox,
  FormControl,
  FormLabel,
  RadioGroup,
  Radio,
  Grid,
  Card,
  CardContent,
} from "@mui/material";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import ProjectTextField from "./ProjectTextField";
import TaskTable from "@/components/days-of-service/form-components/TaskTable";
import { ProjectResources } from "./ProjectResources";

const Step2 = () => {
  const { formData, handleInputChange, isLocked } = useProjectForm();

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
        This step is typically filled out by the Resource Couple/Project
        Manager(s)
      </Typography>
      <Divider />
      <Typography variant="h5" sx={{ mb: 0 }}>
        Resource Couple/Project Manager(s) Information
      </Typography>
      <Typography variant="subtitle" sx={{ mb: 1 }}>
        The Resource Couple/Project Manager(s) are the primary contacts for the
        project. They are the detailed planners and interact with property
        owners and volunteers. Their contact information is used to communicate
        with the project team.
      </Typography>

      {/* Assigned Ward  */}
      <ProjectTextField
        label="Encompassing Area"
        key="project_development_couple_ward"
        value={formData.project_development_couple_ward}
        onChange={(e) =>
          handleInputChange("project_development_couple_ward", e.target.value)
        }
        helperText="The area whose geographical boundaries encompass this property location. If you have an encompassing zone you should input this field as follows (area - zone) "
        isLocked={isLocked}
      />

      <ProjectTextField
        label="Resource Couple"
        key="project_development_couple"
        value={formData.project_development_couple}
        onChange={(e) =>
          handleInputChange("project_development_couple", e.target.value)
        }
        isLocked={isLocked}
      />
      <ProjectTextField
        label="Resource Couple Phone Number (1)"
        key="project_development_couple_phone1"
        value={formData.project_development_couple_phone1}
        onChange={(e) =>
          handleInputChange("project_development_couple_phone1", e.target.value)
        }
        isLocked={isLocked}
      />
      <ProjectTextField
        label="Resource Couple Email (1)"
        key="project_development_couple_email1"
        value={formData.project_development_couple_email1}
        onChange={(e) =>
          handleInputChange("project_development_couple_email1", e.target.value)
        }
        isLocked={isLocked}
      />
      <ProjectTextField
        label="Resource Couple Phone Number (2)"
        key="project_development_couple_phone2"
        value={formData.project_development_couple_phone2}
        onChange={(e) =>
          handleInputChange("project_development_couple_phone2", e.target.value)
        }
        isLocked={isLocked}
      />
      <ProjectTextField
        label="Resource Couple Email (2)"
        key="project_development_couple_email2"
        value={formData.project_development_couple_email2}
        onChange={(e) =>
          handleInputChange("project_development_couple_email2", e.target.value)
        }
        isLocked={isLocked}
      />

      <Divider />

      <Box sx={{ my: 4 }}>
        <FormControl component="fieldset" fullWidth>
          <FormLabel
            component="legend"
            sx={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              mb: 2,
              color: "text.primary",
            }}
          >
            Does this project need a prep day?
          </FormLabel>

          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <Card
                variant="outlined"
                sx={{
                  cursor: "pointer",
                  border:
                    formData.has_prep_day === false
                      ? "2px solid #1976d2"
                      : "1px solid rgba(0, 0, 0, 0.12)",
                  boxShadow:
                    formData.has_prep_day === false
                      ? "0 4px 8px rgba(0, 0, 0, 0.1)"
                      : "none",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: !isLocked && "0 4px 12px rgba(0, 0, 0, 0.15)",
                  },
                }}
                onClick={
                  isLocked
                    ? undefined
                    : () => handleInputChange("has_prep_day", false)
                }
              >
                <CardContent
                  sx={{ display: "flex", alignItems: "center", p: 3 }}
                >
                  <Radio
                    checked={formData.has_prep_day === false}
                    onChange={() => handleInputChange("has_prep_day", false)}
                    sx={{ mr: 2 }}
                    disabled={isLocked}
                  />
                  <Typography variant="h6">No</Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} sm={6}>
              <Card
                variant="outlined"
                sx={{
                  cursor: "pointer",
                  border:
                    formData.has_prep_day === true
                      ? "2px solid #1976d2"
                      : "1px solid rgba(0, 0, 0, 0.12)",
                  boxShadow:
                    formData.has_prep_day === true
                      ? "0 4px 8px rgba(0, 0, 0, 0.1)"
                      : "none",
                  transition: "all 0.3s ease",
                  "&:hover": {
                    boxShadow: !isLocked && "0 4px 12px rgba(0, 0, 0, 0.15)",
                  },
                }}
                onClick={
                  isLocked
                    ? undefined
                    : () => handleInputChange("has_prep_day", true)
                }
              >
                <CardContent
                  sx={{ display: "flex", alignItems: "center", p: 3 }}
                >
                  <Radio
                    checked={formData.has_prep_day === true}
                    onChange={() => handleInputChange("has_prep_day", true)}
                    sx={{ mr: 2 }}
                    disabled={isLocked}
                  />
                  <Typography variant="h6">Yes</Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </FormControl>
      </Box>

      <Divider />

      {formData.has_prep_day && (
        <>
          <Typography variant="h5" sx={{ mb: 1 }}>
            Prep Day Detailed Planning
          </Typography>

          <ProjectTextField
            label="Prep Day Work Summary"
            multiline
            key="prep_day_work_summary"
            rows={4}
            value={formData.prep_day_work_summary}
            onChange={(e) =>
              handleInputChange("prep_day_work_summary", e.target.value)
            }
            isLocked={isLocked}
          />
          <ProjectTextField
            label="Prep Day Preferred Remedies (Optional)"
            multiline
            key="prep_day_preferred_remedies"
            rows={4}
            value={formData.preferred_remedies}
            onChange={(e) =>
              handleInputChange("prep_day_preferred_remedies", e.target.value)
            }
            isLocked={isLocked}
          />
        </>
      )}

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
        isLocked={isLocked}
      />
      <ProjectTextField
        label="Preferred Remedies (Optional)"
        multiline
        key="preferred_remedies"
        rows={4}
        value={formData.preferred_remedies}
        onChange={(e) =>
          handleInputChange("preferred_remedies", e.target.value)
        }
        isLocked={isLocked}
      />

      <Divider />

      <Typography variant="h5" sx={{ mb: 1 }}>
        Task Planning
      </Typography>

      <Typography variant="subtitle" sx={{ mb: 1 }}>
        The tasks listed below are the ones that will be completed on the prep
        day and the day of service. If you have a prep day, please make sure you
        select &quot;prep day&quot; on the task performed prior to the day of
        service.
      </Typography>
      <TaskTable
        value={formData.tasks}
        onChange={(newTasks) => handleInputChange("tasks", newTasks)}
        hideResources={true}
        hasPrepDay={formData.has_prep_day}
        isLocked={isLocked}
      />

      <Divider />

      <Typography variant="h5" gutterBottom>
        Project Setup
      </Typography>
      <ProjectResources
        formData={formData}
        handleInputChange={handleInputChange}
        handleToolAdd={handleToolAdd}
        hasPrepDay={formData.has_prep_day}
        isLocked={isLocked}
      />

      <Divider />
      <Typography variant="h5" gutterBottom>
        Volunteers
      </Typography>

      {/* are_blue_stakes_needed, is_dumpster_needed, is_second_dumpster_needed */}

      <FormControlLabel
        control={
          <Checkbox
            disabled={isLocked}
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
            disabled={isLocked}
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
                disabled={isLocked}
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
        isLocked={isLocked}
      />
    </Box>
  );
};

export default Step2;
