import React from "react";
import {
  Box,
  Typography,
  Paper,
  FormControl,
  FormControlLabel,
  Checkbox,
  Divider,
  Stack,
  Tooltip,
  IconButton,
} from "@mui/material";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import ProjectTextField from "./ProjectTextField";
import EmailIcon from "@mui/icons-material/Email";
import PhoneIcon from "@mui/icons-material/Phone";
import { toast } from "react-toastify";

const Step3 = () => {
  const { formData, handleInputChange } = useProjectForm();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Paper sx={{ p: 3 }}>
        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" color="primary">
            Basic Information
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography>
                <strong>Project Developer:</strong> {formData.project_developer}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Tooltip title={formData.project_developer_phone1} arrow>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        formData.project_developer_phone1
                      );
                      toast.success("Phone number copied to clipboard");
                    }}
                  >
                    <PhoneIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={formData.project_developer_email1} arrow>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        formData.project_developer_email1
                      );
                      toast.success("Email copied to clipboard");
                    }}
                  >
                    <EmailIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography>
                <strong>Resource Couple:</strong>{" "}
                {formData.project_development_couple}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Tooltip
                  title={formData.project_development_couple_phone1}
                  arrow
                >
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        formData.project_development_couple_phone1
                      );
                      toast.success("Phone number copied to clipboard");
                    }}
                  >
                    <PhoneIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip
                  title={formData.project_development_couple_email1}
                  arrow
                >
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(
                        formData.project_development_couple_email1
                      );
                      toast.success("Email copied to clipboard");
                    }}
                  >
                    <EmailIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
            <Box display="flex" alignItems="center" gap={1}>
              <Typography>
                <strong>Property Owner:</strong> {formData.property_owner}
              </Typography>
              <Stack direction="row" spacing={2}>
                <Tooltip title={formData.phone_number} arrow>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(formData.phone_number);
                      toast.success("Phone number copied to clipboard");
                    }}
                  >
                    <PhoneIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title={formData.email} arrow>
                  <IconButton
                    color="primary"
                    size="small"
                    onClick={() => {
                      navigator.clipboard.writeText(formData.email);
                      toast.success("Email copied to clipboard");
                    }}
                  >
                    <EmailIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" color="primary">
            Project Location
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography>
              {formData.address_street1}
              {formData.address_street2 && `, ${formData.address_street2}`}
            </Typography>
            <Typography>
              {formData.address_city}, {formData.address_state}{" "}
              {formData.address_zip_code}
            </Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" color="primary">
            Work Summary
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography>{formData.work_summary}</Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" color="primary">
            Preferred Remedies
          </Typography>
          <Box sx={{ pl: 2 }}>
            <Typography>{formData.preferred_remedies}</Typography>
          </Box>
        </Box>

        <Box sx={{ mb: 3 }}>
          <Typography variant="subtitle1" color="primary">
            Planned Tasks
          </Typography>
          <Box sx={{ pl: 2 }}>
            {formData.tasks &&
              formData.tasks.tasks &&
              Array.isArray(formData.tasks.tasks) &&
              formData.tasks.tasks.map((task, index) => (
                <Box key={index} sx={{ mb: 1 }}>
                  <Typography>
                    <strong>Task {index + 1}:</strong> {task.description}
                  </Typography>
                  {task.todos &&
                    task.todos.map((todo, i) => (
                      <Box key={i} sx={{ pl: 2 }}>
                        <Typography>
                          <strong>- </strong> {todo}
                        </Typography>
                      </Box>
                    ))}
                </Box>
              ))}
          </Box>
        </Box>
      </Paper>

      <FormControl component="fieldset" sx={{ mt: 2 }}>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.review_completed_with_couple}
              onChange={(e) =>
                handleInputChange(
                  "review_completed_with_couple",
                  e.target.checked
                )
              }
            />
          }
          label="I have reviewed the project information with the resource couple"
        />
      </FormControl>
      <FormControl component="fieldset">
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.review_completed_with_homeowner}
              onChange={(e) =>
                handleInputChange(
                  "review_completed_with_homeowner",
                  e.target.checked
                )
              }
            />
          }
          label="I have reviewed the project information with the homeowner"
        />
      </FormControl>

      <ProjectTextField
        label="Issues or Concerns (Optional)"
        multiline
        rows={4}
        value={formData.review_notes || ""}
        onChange={(e) => handleInputChange("review_notes", e.target.value)}
        placeholder="Note any issues or concerns that need to be addressed"
      />
    </Box>
  );
};

export default Step3;
