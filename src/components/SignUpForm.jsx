import React, { useState } from "react";
import {
  Button,
  Grid,
  Card,
  Typography,
  IconButton,
  styled,
  useTheme,
  Box,
} from "@mui/material";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import InputAdornment from "@mui/material/InputAdornment";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";
import { IframeHelpDialog } from "./events/IframeHelpDialog";
import { Edit, Link, Visibility, VisibilityOff } from "@mui/icons-material";
import UploadImage from "./util/UploadImage";
import { ClassSignupProvider } from "./class-signups/ClassSignupContext";
import ClassCreationStepper from "./class-signups/ClassCreationStepper";
import JsonViewer from "./util/debug/DebugOutput";
import { ViewClassSignupForm } from "./class-signups/stepper-components/ViewClassSignupForm";
import { useFormResponses } from "@/hooks/useFormResponses";
import Add from "@mui/icons-material/Add";
import { DayOfServiceIdProvider } from "@/contexts/DayOfServiceIdProvider";
import { toast } from "react-toastify";

const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
  "& .MuiTreeItem-content": {
    paddingTop: "12px",
    paddingBottom: "12px",
    flexDirection: "row-reverse",
  },
}));

const defaultConfig = {
  signupForm: {
    formConfig: {
      firstName: {
        label: "First Name",
        type: "text",
        visible: true,
        required: true,
        originalLabel: "First Name",
        validation:
          'value.length >= 2 ? null : "First name must be at least 2 characters"',
        helpText: "Enter your first name",
        category: "Personal Information",
      },
      lastName: {
        label: "Last Name",
        type: "text",
        visible: true,
        required: true,
        originalLabel: "Last Name",
        validation:
          'value.length >= 2 ? null : "Last name must be at least 2 characters"',
        helpText: "Enter your last name",
        category: "Personal Information",
      },
      email: {
        label: "Email Address",
        type: "email",
        visible: true,
        required: true,
        originalLabel: "Email Address",
        validation:
          '/^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value) ? null : "Invalid email format"',
        helpText: "We'll use this email for all course-related communications",
        category: "Contact Information",
      },
      phone: {
        label: "Phone Number",
        type: "tel",
        visible: true,
        required: true,
        originalLabel: "Phone Number",
        validation:
          '/^\\+?[\\d\\s-]{10,15}$/.test(value) ? null : "Invalid phone format"',
        helpText: "Include country code for international numbers",
        category: "Contact Information",
      },
      volunteerSignature: {
        label: "Your Signature",
        type: "signature",
        visible: true,
        required: true,
        originalLabel: "Your Signature",
        helpText:
          "By signing, I acknowledge that I have read and understood all of the terms of this release, received the Safety Training, reviewed the Volunteer Safety form, and that I am voluntarily giving up substantial legal rights, including the right to sue the Organization. / Al firmar, reconozco que he leído y comprendido todos los términos de este acuerdo, que recibí la capacitación en seguridad, que he revisado el formulario de seguridad para voluntarios, y que renuncio voluntariamente a derechos legales sustanciales, incluyendo el derecho de demandar a la Organización.*",
        category: "Days of Service",
        validation:
          'value && value.length > 0 ? null : "Signature is required"',
      },
      safetyVideo: {
        label: "Safety Video",
        type: "externalLink",
        visible: true,
        required: true,
        originalLabel: "Safety Video",
        url: "https://youtu.be/Dv2ZeWKZ3qg",
        helpText: "Watch the required safety video before proceeding",
        category: "Days of Service",
        validation: 'value === true ? null : "You must watch the safety video"',
      },
      volunteerReleaseForm: {
        label: "Volunteer Release Form",
        type: "infoDialog",
        visible: true,
        required: true,
        originalLabel: "Volunteer Release Form",
        content: "Add your volunteer release form here...",
        category: "Days of Service",
        validation:
          'value === true ? null : "You must review the safety guidelines"',
      },
      dayOfService: {
        label: "Day of Service",
        type: "dayOfService",
        visible: true,
        required: true,
        originalLabel: "Day of Service",
        options: [],
        helpText: "Please select the day you would like to volunteer",
        category: "Days of Service",
        validation: 'value ? null : "Please select a day of service"',
      },
      whoAreYou: {
        label: "Where are you coming from?",
        type: "whoAreYou",
        visible: true,
        required: true,
        originalLabel: "Where are you coming from?",
        helpText: "Please select the option that best describes you",
        category: "Days of Service",
        validation: 'value ? null : "Please select where you are coming from"',
      },
      safetyGuidelines: {
        label: "Safety Rules and Guidelines",
        type: "infoDialog",
        visible: true,
        required: true,
        originalLabel: "Safety Rules and Guidelines",
        content: "Add your safety rules and guidelines here...",
        category: "Days of Service",
        validation:
          'value === true ? null : "You must review the safety guidelines"',
      },
      minorVolunteers: {
        label: "Do you have minors/children volunteering with you today?",
        type: "minorVolunteers",
        visible: true,
        required: true,
        originalLabel: "Minor Volunteers",
        helpText:
          "Please provide information about any minors volunteering with you",
        category: "Days of Service",
        validation:
          'function(value) { if (!value || value.hasMinors === undefined) { return "Please indicate if you have minors volunteering with you"; } return null; }',
      },
      addressLine1: {
        label: "Address",
        type: "text",
        visible: true,
        required: false,
        originalLabel: "Address Line 1",
        category: "Contact Information",
      },
    },
    fieldOrder: [
      "dayOfService",
      "firstName",
      "lastName",
      "addressLine1",
      "phone",
      "email",
      "minorVolunteers",
      "whoAreYou",
      "safetyVideo",
      "safetyGuidelines",
      "volunteerReleaseForm",
      "volunteerSignature",
    ],
  },
};

export const SignUpForm = ({
  isEdit,
  volunteerHeaderText,
  signUpFormId,
  onClose,
  form,
  formLink,
  handleSubmit,
  isFormVisible,
  toggleDaysOfServiceVisibility,
}) => {
  const [signupForm, setSignupForm] = useState(null);
  const [isEditingValues, setEditingValues] = useState(false);
  const toggleEditing = () => setEditingValues((p) => !p);

  const handleCreateSubclass = (classObj, formConfig) => {
    onClose(formConfig);
  };

  const handleEditSubclass = (classObj, formConfig) => {
    onClose(formConfig);
  };

  const copyFormLink = () => {
    navigator.clipboard.writeText(formLink);
    toast.success("Form link copied to clipboard");
  };

  const HeaderWithCloseButton = () => (
    <Box
      display="flex"
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      width="100%"
      sx={{ position: "relative" }}
      mb={2}
    >
      <Typography variant="h4" component="h2" color="primary">
        {volunteerHeaderText
          ? volunteerHeaderText
          : "Sign Up as a Days Of Service Volunteer"}
      </Typography>
      {isEdit && (
        <Box
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            display: { xs: "none", md: "flex" },
          }}
        >
          {formLink && (
            <IconButton
              size="small"
              sx={{ color: "primary.main", mr: 1 }}
              onClick={copyFormLink}
            >
              <Link />
            </IconButton>
          )}

          <Button
            variant="outlined"
            onClick={toggleEditing}
            startIcon={<Edit />}
            sx={{
              mr: 3,
              mb: { xs: 4, md: 0 },
            }}
          >
            Edit
          </Button>
          <Button
            variant="outlined"
            onClick={toggleDaysOfServiceVisibility}
            startIcon={isFormVisible ? <VisibilityOff /> : <Visibility />}
            sx={{
              mb: { xs: 4, md: 0 },
            }}
          >
            {isFormVisible ? "Hide Form" : "Make Visible"}
          </Button>
        </Box>
      )}
    </Box>
  );

  if (!signUpFormId && !isEdit) {
    return null;
  }

  if (!isEdit && !isFormVisible) {
    return null;
  }

  if (!signUpFormId && !isEditingValues) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        justifyContent="center"
        alignItems="center"
        width="100%"
      >
        <Button variant="outlined" onClick={toggleEditing} startIcon={<Add />}>
          Create Volunteer Form
        </Button>
      </Box>
    );
  } else if (isEditingValues) {
    return (
      <DayOfServiceIdProvider>
        <ClassSignupProvider
          category={{
            title: "Volunteer Sign Ups",
            id: "volunteer",
          }}
          onCreateSubclass={handleCreateSubclass}
          onEditSubclass={handleEditSubclass}
          classObj={form || {}}
          defaultConfig={defaultConfig}
          isEdit={isEdit}
          isNew={true}
          type="volunteer signup"
          dontUseLoadedClasses
        >
          <Grid item xs={12} display="flex" flexDirection="column">
            <ClassCreationStepper
              isNew={true}
              handleClose={() => {
                toggleEditing();
              }}
              CategorySelectOptions={null}
              onlyForm={true}
              type="volunteer signup"
            />
          </Grid>
        </ClassSignupProvider>
      </DayOfServiceIdProvider>
    );
  } else {
    return (
      <DayOfServiceIdProvider>
        <Box id="volunteer" sx={{ width: "100%" }}>
          <HeaderWithCloseButton />
          <ClassSignupProvider
            category={{
              title: "Volunteer Sign Ups",
              id: "volunteer",
            }}
            onCreateSubclass={handleCreateSubclass}
            onEditSubclass={handleEditSubclass}
            classObj={form || {}}
            defaultConfig={{}}
            isEdit={isEdit}
            isNew={true}
            type="volunteer signup"
            dontUseLoadedClasses
          >
            <ViewClassSignupForm
              isEdit={isEdit}
              form={form}
              signUpFormId={signUpFormId}
              onClose={onClose}
              onSubmit={handleSubmit}
              isVolunteerForm
              autoScroll={false}
            />
          </ClassSignupProvider>
        </Box>
      </DayOfServiceIdProvider>
    );
  }
};
