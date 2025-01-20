"use client";
import {
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  FormHelperText,
  Divider,
  IconButton,
  Typography,
  Tooltip,
  Stack,
  Checkbox,
  FormControlLabel,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { FIELD_TYPES } from "./FieldTypes";
import { Upload } from "@mui/icons-material";
import { useImageUpload } from "@/hooks/use-upload-image";

// Form Field Component
export const FormField = ({
  field,
  config,
  value,
  onChange,
  error,
  isEditMode,
}) => {
  const renderField = () => {
    if (config.type === FIELD_TYPES.header) {
      return (
        <Typography variant={config.variant || "h5"} sx={{ mt: 2, mb: 1 }}>
          {isEditMode ? config.label : config.content}
        </Typography>
      );
    }

    if (config.type === FIELD_TYPES.checkbox) {
      return (
        <FormControl error={!!error} required={config.required} fullWidth>
          <FormControlLabel
            control={
              <Checkbox
                checked={!!value}
                onChange={(e) => onChange(field, e.target.checked)}
                required={config.required}
              />
            }
            label={config.label}
          />
          {(error || config.helpText) && (
            <FormHelperText
              error={!!error}
              sx={{
                ml: 0,
                mt: 0.5,
              }}
            >
              {error || config.helpText}
            </FormHelperText>
          )}
        </FormControl>
      );
    }

    if (config.type === FIELD_TYPES.staticText) {
      return (
        <Typography variant="body1" sx={{ mb: 2 }}>
          {isEditMode ? config.label : config.content}
        </Typography>
      );
    }

    if (config.type === FIELD_TYPES.divider) {
      return <Divider sx={{ mt: 2, mb: 4 }} />;
    }

    if (config.type === FIELD_TYPES.bannerImage && !isEditMode) {
      return config.url ? (
        <Box
          component="img"
          src={config.url}
          alt="Banner"
          sx={{
            width: "100%",
            height: "auto",
            maxHeight: 200,
            objectFit: "cover",
            borderRadius: 1,
            mb: 2,
          }}
        />
      ) : null;
    }

    const commonProps = {
      id: field,
      value: value || "",
      onChange: (e) => onChange(field, e.target.value),
      required: config.required,
      error: !!error,
      helperText: error || config.helpText,
      fullWidth: true,
      size: "medium",
    };

    switch (config.type) {
      case FIELD_TYPES.textarea:
        return (
          <TextField {...commonProps} label={config.label} multiline rows={4} />
        );
      case FIELD_TYPES.select:
        return (
          <FormControl fullWidth error={!!error}>
            <InputLabel id={`${field}-label`}>
              {config.label}
              {config.required && <span> *</span>}
            </InputLabel>
            <Select
              labelId={`${field}-label`}
              value={value || ""}
              onChange={(e) => onChange(field, e.target.value)}
              label={config.label}
              required={config.required}
            >
              {config.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
            {(error || config.helpText) && (
              <FormHelperText>{error || config.helpText}</FormHelperText>
            )}
          </FormControl>
        );
      case FIELD_TYPES.date:
        return (
          <TextField
            {...commonProps}
            type="date"
            label={config.label}
            InputLabelProps={{
              shrink: true,
            }}
          />
        );

      default:
        return (
          <TextField {...commonProps} type={config.type} label={config.label} />
        );
    }
  };

  return <Box sx={{ mb: 3, position: "relative" }}>{renderField()}</Box>;
};
