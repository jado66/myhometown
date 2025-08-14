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
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  RadioGroup,
  Radio,
  useMediaQuery,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { FIELD_TYPES } from "./FieldTypes";
import { Check } from "@mui/icons-material";
import { useImageUpload } from "@/hooks/use-upload-image";
import SignaturePad from "react-signature-canvas";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { MultiLineTypography } from "../MultiLineTypography";
import { MinorVolunteersComponent } from "./days-of-service/MinorVolunteersComponent";
import { VolunteerHours } from "./days-of-service/VolunteerHours";
import { WhoAreYouComponent } from "./days-of-service/WhoAreYouComponent";
import { DayOfServiceSelect } from "./days-of-service/DayOfServiceSelect";
import { useClassSignup } from "./ClassSignupContext";
// Form Field Component
export const FormField = ({
  field,
  config,
  value,
  onChange,
  error,
  isEditMode,
}) => {
  const [open, setOpen] = useState(false);
  const [sigPad, setSigPad] = useState(null);

  const isMobile = useMediaQuery("(max-width:600px)");
  const { resetKey } = useClassSignup();

  useEffect(() => {
    if (resetKey) {
      if (sigPad) {
        sigPad.clear();
      }

      onChange(field, null);
    }
  }, [resetKey]);

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
          <TextField
            {...commonProps}
            label={config.label}
            multiline
            rows={4}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
          />
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
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
          />
        );
      case FIELD_TYPES.minorVolunteers:
        return (
          <Box sx={{ mb: 3 }}>
            <MinorVolunteersComponent
              value={value || []}
              onChange={(newValue) => onChange(field, newValue)}
              config={config}
            />
            {error && <FormHelperText error>{error}</FormHelperText>}
          </Box>
        );
      case FIELD_TYPES.volunteerHours:
        return (
          <Box sx={{ mb: 3 }}>
            <VolunteerHours
              value={value || []}
              onChange={(newValue) => onChange(field, newValue)}
              config={config}
            />
            {error && <FormHelperText error>{error}</FormHelperText>}
          </Box>
        );
      case FIELD_TYPES.dayOfService:
        return (
          <DayOfServiceSelect
            field={field}
            value={value}
            onChange={(newValue) => onChange(field, newValue)}
            error={error}
            config={config}
          />
        );
      case FIELD_TYPES.whoAreYou:
        return (
          <Box sx={{ mb: 3 }}>
            <WhoAreYouComponent
              field={field}
              value={value || {}}
              onChange={(newValue) => onChange(field, newValue)}
              config={config}
              error={error}
            />
          </Box>
        );

      case FIELD_TYPES.signature:
        const containerRef = useRef(null);
        const [padWidth, setPadWidth] = useState(500);

        useEffect(() => {
          const updateWidth = () => {
            if (containerRef.current) {
              // Get actual width of the container
              const width = containerRef.current.clientWidth - 16;
              // Cap it at 500px for larger screens if desired
              setPadWidth(isMobile ? width : Math.min(width, 500));
            }
          };

          // Set initial width
          updateWidth();

          // Update on resize
          window.addEventListener("resize", updateWidth);
          return () => window.removeEventListener("resize", updateWidth);
        }, [isMobile]);

        return (
          <Box
            ref={containerRef}
            sx={{
              border: "1px solid #ccc",
              borderRadius: 1,
              p: 1,
              width: "100%",
            }}
          >
            <Typography>
              {config.label}
              {config.required && " *"}
            </Typography>
            <SignaturePad
              backgroundColor="#edeff2"
              canvasProps={{
                className: "signature-canvas",

                width: padWidth,

                backgroundColor: "#edeff2",
                //500,
                height: 200,
              }}
              style={{ border: "1px solid #ccc" }}
              ref={(ref) => {
                setSigPad(ref);
              }}
              onEnd={() => {
                if (sigPad) {
                  // Store the signature as a base64 string instead of the entire ref
                  const signatureData = sigPad.toDataURL();
                  onChange(field, signatureData);
                }
              }}
            />
            <Stack direction="row" spacing={2} mt={1}>
              <Button
                size="small"
                variant="outlined"
                onClick={() => {
                  if (sigPad) {
                    sigPad.clear();
                    onChange(field, null);
                  }
                }}
              >
                Clear
              </Button>
            </Stack>
            {value && (
              <Typography variant="caption" color="success.main" mt={1}>
                Signature captured
              </Typography>
            )}
            {(error || config.helpText) && (
              <FormHelperText error={!!error}>
                {error || config.helpText}
              </FormHelperText>
            )}
          </Box>
        );

      case FIELD_TYPES.radioGroup:
        return (
          <FormControl error={!!error} required={config.required} fullWidth>
            <Typography>
              {config.label}
              {config.required && " *"}
            </Typography>
            <RadioGroup
              value={value || ""}
              onChange={(e) => onChange(field, e.target.value)}
            >
              {config.options?.map((option) => (
                <FormControlLabel
                  key={option.value}
                  value={option.value}
                  control={<Radio />}
                  label={option.label}
                />
              ))}
            </RadioGroup>
            {(error || config.helpText) && (
              <FormHelperText>{error || config.helpText}</FormHelperText>
            )}
          </FormControl>
        );

      case FIELD_TYPES.externalLink:
        return (
          <Box>
            <Typography>
              {config.label}
              {config.required && " *"}
            </Typography>
            <Link
              href={config.url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => onChange(field, true)}
            >
              {config.helpText || "Click here"}
            </Link>
            {error && <FormHelperText error>{error}</FormHelperText>}
          </Box>
        );

      case FIELD_TYPES.infoDialog:
        return (
          <Box>
            <Button variant="outlined" onClick={() => setOpen(true)}>
              {config.label}
              {value && <Check sx={{ ml: 1 }} />}
            </Button>
            <Dialog
              open={open}
              onClose={() => setOpen(false)}
              maxWidth="md"
              fullWidth
            >
              <DialogTitle>{config.label}</DialogTitle>
              <DialogContent>
                <MultiLineTypography text={config.content} />
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={() => {
                    setOpen(false);
                    onChange(field, true);
                  }}
                >
                  I Acknowledge
                </Button>
              </DialogActions>
            </Dialog>
            {error && <FormHelperText error>{error}</FormHelperText>}
          </Box>
        );
      default:
        return (
          <TextField
            {...commonProps}
            type={config.type}
            label={config.label}
            onKeyDown={(e) => {
              e.stopPropagation();
            }}
          />
        );
    }
  };

  return <Box sx={{ mb: 3, position: "relative" }}>{renderField()}</Box>;
};
