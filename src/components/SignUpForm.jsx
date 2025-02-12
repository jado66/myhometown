import React, { useState } from "react";
import {
  Button,
  Grid,
  Card,
  Typography,
  TextField,
  styled,
  useTheme,
  Box,
} from "@mui/material";
import { TreeItem } from "@mui/x-tree-view/TreeItem";
import InputAdornment from "@mui/material/InputAdornment";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import CloseIcon from "@mui/icons-material/Close";
import { IframeHelpDialog } from "./events/IframeHelpDialog";
import { Edit } from "@mui/icons-material";
import UploadImage from "./util/UploadImage";
import { ClassSignupProvider } from "./class-signups/ClassSignupContext";
import ClassCreationStepper from "./class-signups/ClassCreationStepper";
import JsonViewer from "./util/debug/DebugOutput";
import { ViewClassSignupForm } from "./class-signups/stepper-components/ViewClassSignupForm";
import { useFormResponses } from "@/hooks/useFormResponses";
import Add from "@mui/icons-material/Add";

const StyledTreeItem = styled(TreeItem)(({ theme }) => ({
  "& .MuiTreeItem-content": {
    paddingTop: "12px",
    paddingBottom: "12px",
    flexDirection: "row-reverse",
  },
}));

export const SignUpForm = ({
  isEdit,
  volunteerHeaderText,
  signUpFormId,
  onClose,
  form,
  handleSubmit,
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
        {volunteerHeaderText ? volunteerHeaderText : "Sign Up as a Volunteer"}
      </Typography>
      {isEdit && (
        <Button
          variant="outlined"
          onClick={toggleEditing}
          startIcon={<Edit />}
          sx={{
            position: "absolute",
            top: 0,
            right: 0,
            mr: 3,
            mb: { xs: 4, md: 0 },
          }}
        >
          Edit Volunteer Form
        </Button>
      )}
    </Box>
  );

  if (!signUpFormId && !isEdit) {
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
      <>
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
      </>
    );
  } else {
    return (
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
          />
        </ClassSignupProvider>
      </Box>
    );
  }
};
