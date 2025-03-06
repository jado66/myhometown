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

export function ViewClassSignupForm({
  testSubmit,
  classData,
  type,
  onSubmit,
  isCreating,
}) {
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

  // Check if the class is fully booked, including waitlist if enabled
  const capacity = Number(classData?.capacity) || 0;
  const waitlistCapacity = Number(classData?.waitlistCapacity) || 0;
  const signupsCount = classConfig?.signups?.length || 0;
  const isWaitlistEnabled = classData?.isWaitlistEnabled || false;

  // Calculate total capacity
  const totalCapacity =
    isWaitlistEnabled && waitlistCapacity > 0
      ? capacity + waitlistCapacity
      : capacity;

  // Log calculated values
  console.log({
    capacity,
    waitlistCapacity,
    signupsCount,
    isWaitlistEnabled,
    totalCapacity,
    isFullyBooked: signupsCount >= totalCapacity,
    isMainCapacityFull:
      signupsCount >= capacity &&
      signupsCount < totalCapacity &&
      isWaitlistEnabled,
  });

  const isFullyBooked = signupsCount >= totalCapacity;
  const isMainCapacityFull =
    signupsCount >= capacity &&
    signupsCount < totalCapacity &&
    isWaitlistEnabled;

  if (isFullyBooked && !isCreating) {
    return (
      <>
        <JsonViewer data={classData} title="Class Config" />

        <ClassPreview classData={classConfig} />
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
      {type === "class" && (
        <>
          <ClassPreview classData={classConfig} />
          <Divider sx={{ my: 3 }} />
        </>
      )}
      {isMainCapacityFull && (
        <Alert severity="info">
          We are sorry, this class is currently full. Signing up will add you to
          the waitlist.
        </Alert>
      )}
      {fieldOrder &&
        fieldOrder.map((field) => {
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
              onKeyDown={(e) => {
                e.stopPropagation();
              }}
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
            onClick={() => {
              if (typeof onSubmit === "function") {
                onSubmit(formData);
              } else {
                handleSubmit();
              }
            }}
            disabled={submitStatus === "submitting" || testSubmit}
          >
            {submitStatus === "submitting"
              ? "Signing Up..."
              : isMainCapacityFull
              ? "Join Waitlist"
              : "Sign Up"}
          </Button>
          {submitStatus === "success" && (
            <Typography variant="body1" color="success" sx={{ mt: 2 }}>
              {isMainCapacityFull
                ? "Successfully added to the waitlist!"
                : "Successfully signed up for the class!"}
            </Typography>
          )}
        </>
      )}
      {submitStatus === "error" && (
        <Typography variant="body1" color="error" sx={{ mt: 2 }}>
          Please fill out all required fields.
        </Typography>
      )}
    </Stack>
  );
}
