import React from "react";
import { Box, Typography, Divider, IconButton } from "@mui/material";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import ProjectTextField from "./ProjectTextField";
import AddressFormFields from "@/components/days-of-service/form-components/AddressFormFields";
import { toast } from "react-toastify";
import { Info } from "@mui/icons-material";

const Step1 = ({ date }) => {
  const { formData, handleInputChange, community } = useProjectForm();

  const copyIdToClipboard = () => {
    navigator.clipboard.writeText(formData.id);
    toast.success(`Project ID copied to clipboard: ${formData.id}`);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
        position: "relative",
      }}
    >
      <Typography variant="h4" sx={{ mt: 2, mb: 1, textAlign: "center" }}>
        This step of the form is typically filled out by the Project
        Developer(s)
      </Typography>

      <Divider />
      <Typography variant="h6" sx={{ mt: 2, mb: 1 }}>
        Project Information
      </Typography>

      <ProjectTextField
        label="Project Name"
        value={formData.project_name}
        onChange={(e) => handleInputChange("project_name", e.target.value)}
        InputProps={{
          endAdornment: (
            <IconButton
              onClick={copyIdToClipboard}
              size="large"
              edge="end"
              title="Copy Project ID to clipboard"
              color="primary"
            >
              <Info />
            </IconButton>
          ),
        }}
      />
      <ProjectTextField
        label="Project Short Description"
        key="project_short_description"
        value={formData.project_id}
        onChange={(e) => handleInputChange("project_id", e.target.value)}
        inputProps={{ maxLength: 60 }}
      />
      <ProjectTextField
        type="date"
        label="Day Of Service Date"
        value={
          date && !isNaN(new Date(date).getTime())
            ? new Date(date).toISOString().split("T")[0]
            : ""
        }
        InputProps={{ readOnly: true }}
      />
      <ProjectTextField
        label="Community"
        value={`${community?.city_name || ""} - ${community?.name || ""}`}
        InputProps={{ readOnly: true }}
      />
      <Divider />

      <Typography variant="h6" sx={{ mb: 1 }}>
        Project Developer Information
      </Typography>

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
      <Divider />

      <Typography variant="h6" sx={{ mb: 1 }}>
        Project Owner Information
      </Typography>
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
      <Divider />

      <AddressFormFields />
    </Box>
  );
};

export default Step1;
