import { Typography, Stack, Button, Alert, Box } from "@mui/material";
import { useClassSignup } from "../ClassSignupContext";
import { FormField } from "../FormFields";
import { FIELD_TYPES } from "../FieldTypes";

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

export function ViewClassSignupForm() {
  const {
    classConfig,
    fieldOrder,
    formConfig,
    formData,
    errors,
    submitStatus,
    handleFormChange,
    handleSubmit,
  } = useClassSignup();

  return (
    <Stack spacing={3} component="form">
      <Typography variant="h4" component="h1">
        {classConfig.className} Signup
      </Typography>

      {classConfig.description && (
        <Typography variant="body1">{classConfig.description}</Typography>
      )}

      <Stack spacing={1}>
        {(classConfig.startDate ||
          classConfig.endTime ||
          classConfig.startTime ||
          classConfig.location ||
          (classConfig.capacity && classConfig.showCapacity) ||
          (classConfig.meetingDays && classConfig.meetingDays.length > 0)) && (
          <Typography variant="subtitle1" fontWeight="bold">
            Class Information:
          </Typography>
        )}

        {classConfig.meetingDays && classConfig.meetingDays.length > 0 && (
          <Typography>
            Meeting {formatMeetingDays([...classConfig.meetingDays])}
            {classConfig.startTime && classConfig.endTime && (
              <>
                , at {formatTime(classConfig.startTime)} -{" "}
                {formatTime(classConfig.endTime)}
              </>
            )}
          </Typography>
        )}

        {classConfig.startDate && classConfig.endDate && (
          <Typography>
            Starting on{" "}
            {new Date(classConfig.startDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}{" "}
            and ending on{" "}
            {new Date(classConfig.endDate).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </Typography>
        )}

        {classConfig.location && (
          <Typography>
            <strong>Location:</strong> {classConfig.location}
          </Typography>
        )}

        {classConfig.capacity && classConfig.showCapacity && (
          <Typography>
            <strong>Class Capacity:</strong> {classConfig.capacity} students
          </Typography>
        )}
      </Stack>

      {submitStatus && (
        <Alert
          severity={submitStatus.type}
          onClose={() => setSubmitStatus(null)}
        >
          {submitStatus.message}
        </Alert>
      )}

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

      <Button
        type="button"
        variant="contained"
        fullWidth
        size="large"
        sx={{ mt: 3 }}
        onClick={handleSubmit}
      >
        {submitStatus === "submitting" ? "Submitting..." : "Submit"}
      </Button>
      {submitStatus === "success" && (
        <Typography variant="body1" color="success" sx={{ mt: 2 }}>
          Successfully signed up for the class!
        </Typography>
      )}

      {submitStatus === "error" && (
        <Typography variant="body1" color="error" sx={{ mt: 2 }}>
          There was an error submitting the form. Please try again.
        </Typography>
      )}
    </Stack>
  );
}
