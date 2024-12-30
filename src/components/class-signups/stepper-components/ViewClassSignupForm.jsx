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

function formatMeetingDays(days) {
  if (days.length <= 1) return days.join("");
  const lastDay = days.pop();
  return `${days.join(", ")}, and ${lastDay}`;
}

function formatTime(timeStr) {
  const [hour, minute] = timeStr.split(":");
  const date = new Date(1970, 0, 1, hour, minute);
  return date.toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function ViewClassSignupForm({ testSubmit, classData }) {
  const {
    classConfig,
    fieldOrder,
    formConfig,
    formData,
    errors,
    submitStatus,
    handleFormChange,
    handleSubmit,
    testSignup,
  } = useClassSignup();

  return (
    <Stack spacing={3} component="form">
      {/* <Accordion>
        <AccordionSummary expandIcon={<ExpandMore />}>
          <Typography>Debug</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <pre>{JSON.stringify(classConfig, null, 4)}</pre>
        </AccordionDetails>
      </Accordion> */}

      <ClassPreview classData={classData} />

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
