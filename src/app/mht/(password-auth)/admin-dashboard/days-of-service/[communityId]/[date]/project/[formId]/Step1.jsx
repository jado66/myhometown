import React from "react";
import { Box, Typography, Divider, IconButton } from "@mui/material";
import { useProjectForm } from "@/contexts/ProjectFormProvider";
import ProjectTextField from "./ProjectTextField";
import AddressFormFields from "@/components/days-of-service/form-components/AddressFormFields";
import { toast } from "react-toastify";
import { Info } from "@mui/icons-material";
import moment from "moment";

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
      <Typography variant="h4" sx={{ textAlign: "center" }}>
        This step is typically filled out by the Project Developer(s)
      </Typography>
      <Divider />
      <Typography variant="h6">Project Information</Typography>
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
          date && moment(date, "MM-DD-YYYY").isValid()
            ? moment(date, "MM-DD-YYYY").format("YYYY-MM-DD")
            : ""
        }
        disabled
        sx={{
          // Style for the input text
          "& .MuiInputBase-input": {
            color: "#474747 !important",
          },
          "& .MuiInputBase-input.Mui-disabled": {
            color: "#474747 !important",
            WebkitTextFillColor: "#474747 !important",
          },
          // Style for the label
          "& .MuiInputLabel-root": {
            color: "#474747 !important",
          },
          "& .MuiInputLabel-root.Mui-disabled": {
            color: "#474747 !important",
          },
        }}
        InputProps={{ readOnly: true }}
      />
      <ProjectTextField
        label="Community"
        value={`${community?.city_name || ""} - ${community?.name || ""}`}
        InputProps={{ readOnly: true }}
        sx={{
          // Style for the input text
          "& .MuiInputBase-input": {
            color: "#474747 !important",
          },
          "& .MuiInputBase-input.Mui-disabled": {
            color: "#474747 !important",
            WebkitTextFillColor: "#474747 !important",
          },
          // Style for the label
          "& .MuiInputLabel-root": {
            color: "#474747 !important",
          },
          "& .MuiInputLabel-root.Mui-disabled": {
            color: "#474747 !important",
          },
        }}
      />
      <Divider />
      <Typography variant="h6">Project Developer Information</Typography>
      <Typography variant="subtitle" sx={{ mb: 1 }}>
        The Project Developer is the person or couple who are tasked with
        identifying the project, and may have first contact with the property
        owner. They will hand off the project to the Resource Couple/Project
        Manager(s) for detailed planning.
      </Typography>
      Once you enter this budget information and
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
      <Typography variant="h6" sx={{ mb: 0 }}>
        Project Owner Information
      </Typography>
      <Typography variant="subtitle" sx={{ mb: 1 }}>
        The Property Owner is the person or couple who own the property where
        the project will take place. This can be a homeowner, a business, or the
        city.
      </Typography>
      <ProjectTextField
        label="Property Owner"
        value={formData.property_owner}
        onChange={(e) => handleInputChange("property_owner", e.target.value)}
      />
      <ProjectTextField
        label="Property Owner Phone Number"
        value={formData.phone_number}
        onChange={(e) => handleInputChange("phone_number", e.target.value)}
      />
      <ProjectTextField
        label="Property Owner Email"
        value={formData.email}
        onChange={(e) => handleInputChange("email", e.target.value)}
      />
      <ProjectTextField
        label="Property Owner 2"
        value={formData.property_owner_2}
        onChange={(e) => handleInputChange("property_owner_2", e.target.value)}
      />
      <ProjectTextField
        label="Property Owner Phone Number 2"
        value={formData.phone_number_2}
        onChange={(e) => handleInputChange("phone_number_2", e.target.value)}
      />
      <ProjectTextField
        label="Property Owner Email 2"
        value={formData.email_2}
        onChange={(e) => handleInputChange("email_2", e.target.value)}
      />
      <Divider />
      <AddressFormFields />
    </Box>
  );
};

export default Step1;
