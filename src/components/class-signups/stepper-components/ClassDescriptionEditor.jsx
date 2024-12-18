import React from "react";
import {
  TextField,
  Stack,
  Typography,
  FormControlLabel,
  Checkbox,
  Button,
  Grid,
} from "@mui/material";
import { Upload } from "@mui/icons-material";
import { IconSelect } from "@/components/events/ClassesTreeView/IconSelect";
import { useImageUpload } from "@/hooks/use-upload-image";
import { ClassMeetings } from "../ClassMeetings";
import { useClassSignup } from "../ClassSignupContext";

export function ClassDescriptionEditor() {
  const { classConfig, handleClassConfigChange, errors } = useClassSignup();

  const { handleFileUpload, loading } = useImageUpload((classBannerUrl) => {
    handleClassConfigChange("classBannerUrl", classBannerUrl);
  });

  return (
    <Stack spacing={3} sx={{ py: 2 }}>
      <Typography variant="h6">Class Description</Typography>

      <Grid container>
        <Grid item xs={3} sx={{ pr: 1 }}>
          <IconSelect
            onSelect={(e) => handleClassConfigChange("icon", e.target.value)}
            icon={classConfig.icon}
            height="56px"
          />
        </Grid>
        <Grid item xs={9} sx={{ pl: 1 }}>
          <TextField
            fullWidth
            label="Class Name"
            value={classConfig.className}
            onChange={(e) =>
              handleClassConfigChange("className", e.target.value)
            }
            error={!!errors.className}
            helperText={errors.className}
          />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} alignItems="center">
        <Button
          component="label"
          variant="outlined"
          startIcon={<Upload />}
          disabled={loading}
        >
          {loading
            ? "Uploading..."
            : classConfig.classBannerUrl
            ? "Change Image"
            : "Upload Banner Image"}
          <input
            type="file"
            hidden
            accept="image/*"
            onChange={handleFileUpload}
          />
        </Button>
        {classConfig.classBannerUrl && (
          <Button
            variant="outlined"
            color="error"
            onClick={() => handleClassConfigChange("classBannerUrl", null)}
          >
            Remove Image
          </Button>
        )}
      </Stack>

      <Typography variant="subtitle2" color="text.secondary">
        Banner images should have a wide aspect ratio.
      </Typography>

      <TextField
        fullWidth
        multiline
        rows={3}
        label="Class Introduction"
        value={classConfig.description}
        onChange={(e) => handleClassConfigChange("description", e.target.value)}
        placeholder="Enter class description here..."
      />

      <Grid container>
        <Grid item xs={6} sx={{ pr: 1 }}>
          <TextField
            fullWidth
            label="Start Date"
            type="date"
            value={classConfig.startDate}
            onChange={(e) =>
              handleClassConfigChange("startDate", e.target.value)
            }
            InputLabelProps={{ shrink: true }}
            error={!!errors.startDate}
            helperText={errors.startDate}
          />
        </Grid>
        <Grid item xs={6} sx={{ pl: 1 }}>
          <TextField
            fullWidth
            label="End Date"
            type="date"
            value={classConfig.endDate}
            onChange={(e) => handleClassConfigChange("endDate", e.target.value)}
            InputLabelProps={{ shrink: true }}
            error={!!errors.endDate}
            helperText={errors.endDate}
          />
        </Grid>
      </Grid>

      <ClassMeetings
        meetings={classConfig.meetings || []}
        onChange={(meetings) => handleClassConfigChange("meetings", meetings)}
      />

      <TextField
        fullWidth
        label="Location"
        value={classConfig.location}
        onChange={(e) => handleClassConfigChange("location", e.target.value)}
        error={!!errors.location}
        helperText={errors.location}
      />

      <TextField
        fullWidth
        label="Class Capacity"
        type="number"
        value={classConfig.capacity}
        onChange={(e) => handleClassConfigChange("capacity", e.target.value)}
        error={!!errors.capacity}
        helperText={errors.capacity || "Optional: Maximum number of students"}
      />

      {classConfig.capacity && (
        <FormControlLabel
          control={
            <Checkbox
              checked={classConfig.showCapacity}
              onChange={(e) =>
                handleClassConfigChange("showCapacity", e.target.checked)
              }
            />
          }
          label="Show Class Capacity"
        />
      )}
    </Stack>
  );
}
