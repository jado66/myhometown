import React from "react";
import { Box, Typography, Divider } from "@mui/material";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import ProjectTextField from "./ProjectTextField";
import AddressFormFields from "@/components/days-of-service/form-components/AddressFormFields";

const Step1 = ({ date }) => {
  const { formData, handleInputChange, community } = useProjectForm();

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Typography variant="h4" sx={{ mt: 2, mb: 1, textAlign: "center" }}>
        This step of the form is typically filled out by the Project
        Developer(s)
      </Typography>
      <Divider sx={{ mt: 2 }} />
      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        Project Information
      </Typography>

      <ProjectTextField
        label="Project Name"
        value={formData.project_name}
        onChange={(e) => handleInputChange("project_name", e.target.value)}
      />
      <ProjectTextField
        type="date"
        label="Day Of Service Date"
        value={date ? new Date(date).toISOString().split("T")[0] : null}
        InputProps={{ readOnly: true }}
      />
      <ProjectTextField
        label="Community"
        value={`${community?.city_name || ""} - ${community?.name || ""}`}
        InputProps={{ readOnly: true }}
      />
      <Divider sx={{ my: 1 }} />

      <ProjectTextField
        label="Project Developer(s)"
        value={formData.project_developer}
        onChange={(e) => handleInputChange("project_developer", e.target.value)}
      />
      <ProjectTextField
        label="Project Developer Phone Number 1"
        value={formData.project_developer_phone1}
        onChange={(e) =>
          handleInputChange("project_developer_phone1", e.target.value)
        }
      />
      <ProjectTextField
        label="Project Developer Email Address 1"
        value={formData.project_developer_email1}
        onChange={(e) =>
          handleInputChange("project_developer_email1", e.target.value)
        }
      />
      <ProjectTextField
        label="Project Developer Phone Number 2"
        value={formData.project_developer_phone2}
        onChange={(e) =>
          handleInputChange("project_developer_phone2", e.target.value)
        }
      />
      <ProjectTextField
        label="Project Developer Email Address 2"
        value={formData.project_developer_email2}
        onChange={(e) =>
          handleInputChange("project_developer_email2", e.target.value)
        }
      />
      <Divider sx={{ my: 2 }} />

      <ProjectTextField
        label="Property Owner"
        value={formData.property_owner}
        onChange={(e) => handleInputChange("property_owner", e.target.value)}
      />
      <ProjectTextField
        label="Phone Number"
        value={formData.phone_number}
        onChange={(e) => handleInputChange("phone_number", e.target.value)}
      />
      <ProjectTextField
        label="Email"
        value={formData.email}
        onChange={(e) => handleInputChange("email", e.target.value)}
      />
      <Divider sx={{ my: 2 }} />

      <AddressFormFields />
      <Divider sx={{ my: 2 }} />
      <ProjectTextField
        label="Work Summary"
        multiline
        rows={4}
        value={formData.work_summary}
        onChange={(e) => handleInputChange("work_summary", e.target.value)}
      />
    </Box>
  );
};

export default Step1;
