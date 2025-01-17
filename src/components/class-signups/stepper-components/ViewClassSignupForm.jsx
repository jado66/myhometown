import {
  Typography,
  Stack,
  Button,
  Alert,
  Box,
  CardMedia,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import { useClassSignup } from "../ClassSignupContext";
import { FormField } from "../FormFields";
import { FIELD_TYPES } from "../FieldTypes";
import { ExampleIcons } from "@/components/events/ClassesTreeView/IconSelect";
import ClassPreview from "./ClassPreview";
import { ExpandMore } from "@mui/icons-material";
import JsonViewer from "@/components/util/debug/DebugOutput";

export function ViewClassSignupForm({ testSubmit, classData }) {
  const {
    classConfig,
    fieldOrder,
    formConfig,
    formData,
    errors,
    originalClassObj,
    submitStatus,
    handleFormChange,
    handleSubmit,

    testSignup,
  } = useClassSignup();

  if (
    classConfig &&
    classConfig.signups &&
    classConfig.signups.length == classConfig.capacity
  ) {
    return (
      <>
        <ClassPreview classData={originalClassObj} />
        <Divider sx={{ my: 3 }} />

        <Alert severity="warning">
          This class is currently full. Please check back later for more
          availability.
        </Alert>
      </>
    );
  }

  return (
    <Stack spacing={3} component="form">
      <ClassPreview classData={originalClassObj} />
      <Divider sx={{ my: 3 }} />

      {fieldOrder.map((field) => {
        const config = formConfig[field];

        if (!config) return null;

        if (config?.type === FIELD_TYPES.bannerImage && config.url) {
          return (
            <Box
              key={field}
              component="img"
              src={config.url}
              alt="Class Banner"
              sx={{
                width: "100%",
                height: "auto",
                maxHeight: 200,
                objectFit: "cover",
                borderRadius: 1,
              }}
            />
          );
        }
        return (
          <FormField
            key={field}
            field={field}
            config={config}
            value={formData[field] || ""}
            onChange={handleFormChange}
            error={errors[field]}
          />
        );
      })}
      {false ? (
        <>
          {/* TODO */}
          {/* <Button
            type="button"
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 3 }}
            onClick={testSignup}
            disabled={submitStatus === "submitting"}
          >
            {submitStatus === "submitting" ? "Signing Up..." : "Test Sign Up"}
          </Button>
          {submitStatus === "success" && (
            <Typography variant="body1" color="success" sx={{ mt: 2 }}>
              Successfully signed up for the class!
            </Typography>
          )} */}
        </>
      ) : (
        <>
          <Button
            type="button"
            variant="contained"
            fullWidth
            size="large"
            sx={{ mt: 3 }}
            onClick={handleSubmit}
            disabled={submitStatus === "submitting" || testSubmit}
          >
            {submitStatus === "submitting" ? "Signing Up..." : "Sign Up"}
          </Button>
          {submitStatus === "success" && (
            <Typography variant="body1" color="success" sx={{ mt: 2 }}>
              Successfully signed up for the class!
            </Typography>
          )}
        </>
      )}
      {submitStatus === "error" && (
        <Typography variant="body1" color="error" sx={{ mt: 2 }}>
          There was an error submitting the form. Please try again.
        </Typography>
      )}
    </Stack>
  );
}
