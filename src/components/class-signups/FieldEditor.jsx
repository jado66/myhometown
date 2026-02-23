"use client";
import { useState } from "react";
import {
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
  Box,
  Stack,
  IconButton,
  FormGroup,
  Switch,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import { useImageUpload } from "@/hooks/use-upload-image";
import { FIELD_TYPES } from "./FieldTypes";
import { AVAILABLE_FIELDS } from "./AvailableFields";
import { Upload } from "@mui/icons-material";

export const FieldEditor = ({
  field,
  isAlwaysRequired,
  config = {},
  onUpdate,
  onRemove,
}) => {
  const [isHelpTextExpanded, setIsHelpTextExpanded] = useState(false);
  const { handleFileUpload, loading } = useImageUpload((url) => {
    onUpdate(field, { ...config, url });
  });

  const renderFieldControls = () => {
    // Handle structural elements (header, text block, divider)
    if (!config) {
      console.log(
        `Error rendering field ${JSON.stringify({ field, config }, null, 4)}`
      );
      return null;
    }

    if (config.type === "header" || config.type === "staticText") {
      return (
        <>
          <TextField
            size="small"
            value={config.content || ""}
            onChange={(e) =>
              onUpdate(field, { ...config, content: e.target.value })
            }
            label="Content"
            multiline={config.type === "staticText"}
            rows={config.type === "staticText" ? 3 : 1}
            sx={{ flexGrow: 1 }}
          />
        </>
      );
    }

    if (config.type === "divider") {
      return (
        <Typography variant="body2" color="textSecondary" sx={{ flexGrow: 1 }}>
          Divider Line
        </Typography>
      );
    }

    // Banner image controls
    if (config.type === FIELD_TYPES.bannerImage) {
      return (
        <Stack spacing={2} sx={{ width: "100%" }}>
          {config.url && (
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
              }}
            />
          )}
          <Stack direction="row" spacing={2} alignItems="center">
            <Button
              component="label"
              variant="outlined"
              startIcon={<Upload />}
              disabled={loading}
            >
              {loading
                ? "Uploading..."
                : config.url
                ? "Change Image"
                : "Upload Image"}
              <input
                type="file"
                hidden
                accept="image/*"
                onChange={handleFileUpload}
              />
            </Button>
            {config.url && (
              <Button
                variant="outlined"
                color="error"
                onClick={() => onUpdate(field, { ...config, url: "" })}
              >
                Remove Image
              </Button>
            )}
          </Stack>
        </Stack>
      );
    }

    if (config.type === FIELD_TYPES.radioGroup) {
      return (
        <Stack spacing={2} sx={{ width: "100%" }}>
          <TextField
            size="small"
            value={config.label}
            onChange={(e) =>
              onUpdate(field, { ...config, label: e.target.value })
            }
            label="Label"
          />
          <TextField
            size="small"
            value={config.content}
            onChange={(e) => {
              const options = e.target.value.split("\n").map((option) => ({
                value: option.trim().toLowerCase().replace(/\s+/g, "-"),
                label: option.trim(),
              }));
              onUpdate(field, { ...config, options });
            }}
            label="Options (one per line)"
            multiline
            rows={4}
          />
        </Stack>
      );
    }

    if (config.type === FIELD_TYPES.externalLink) {
      const isValidUrl = (url) => {
        if (!url) return false;
        try {
          const parsed = new URL(url);
          return ["http:", "https:"].includes(parsed.protocol);
        } catch {
          return false;
        }
      };
      const urlError = config.url && !isValidUrl(config.url) ? "Please enter a valid URL (e.g. https://example.com)" : "";
      return (
        <Stack spacing={2} sx={{ width: "100%" }}>
          <TextField
            size="small"
            value={config.label}
            onChange={(e) =>
              onUpdate(field, { ...config, label: e.target.value })
            }
            label="Label"
          />
          <TextField
            size="small"
            value={config.url}
            onChange={(e) =>
              onUpdate(field, { ...config, url: e.target.value })
            }
            onBlur={(e) => {
              if (!e.target.value.trim()) {
                const defaultUrl = AVAILABLE_FIELDS[field]?.url || "";
                onUpdate(field, { ...config, url: defaultUrl });
              }
            }}
            label="URL"
            error={!!urlError}
            helperText={urlError}
          />
        </Stack>
      );
    }

    if (config.type === FIELD_TYPES.infoDialog) {
      return (
        <Stack spacing={2} sx={{ width: "100%" }}>
          <TextField
            size="small"
            value={config.label}
            onChange={(e) =>
              onUpdate(field, { ...config, label: e.target.value })
            }
            label="Label"
          />
          <TextField
            size="small"
            value={config.content}
            onChange={(e) =>
              onUpdate(field, { ...config, content: e.target.value })
            }
            label="Content"
            multiline
            rows={4}
          />
        </Stack>
      );
    }
    if (config.type === FIELD_TYPES.checkbox) {
      return (
        <>
          <TextField
            size="small"
            value={config.label}
            onChange={(e) => {
              onUpdate(field, { ...config, label: e.target.value });
            }}
            label="Label"
            sx={{ flexGrow: 1 }}
          />

          <FormGroup row>
            <FormControlLabel
              control={
                <Checkbox
                  checked={config.required}
                  onChange={(e) =>
                    onUpdate(field, { ...config, required: e.target.checked })
                  }
                  size="small"
                />
              }
              disabled={isAlwaysRequired}
              label="Required"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={config.defaultValue || false}
                  onChange={(e) =>
                    onUpdate(field, {
                      ...config,
                      defaultValue: e.target.checked,
                    })
                  }
                  size="small"
                />
              }
              label="Default Value"
            />
          </FormGroup>
          <IconButton
            size="small"
            onClick={() => setIsHelpTextExpanded(!isHelpTextExpanded)}
            color={isHelpTextExpanded ? "primary" : "default"}
          >
            <HelpOutlineIcon />
          </IconButton>
        </>
      );
    }

    // Default field controls
    return (
      <>
        <TextField
          size="small"
          value={config.label}
          onChange={(e) => {
            e.stopPropagation();
            onUpdate(field, { ...config, label: e.target.value });
          }}
          sx={{ flexGrow: 1 }}
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={config.required}
              onChange={(e) =>
                onUpdate(field, { ...config, required: e.target.checked })
              }
              size="small"
            />
          }
          label="Required"
        />

        <IconButton
          size="small"
          onClick={() => setIsHelpTextExpanded(!isHelpTextExpanded)}
          color={isHelpTextExpanded ? "primary" : "default"}
        >
          <HelpOutlineIcon />
        </IconButton>
      </>
    );
  };

  return (
    <Paper sx={{ p: 2, mb: 2 }} elevation={1}>
      <Stack spacing={2}>
        <Stack direction="row" spacing={2} alignItems="center">
          <DragIndicatorIcon
            sx={{ color: "action.disabled", cursor: "move" }}
          />

          <Typography variant="body2" sx={{ width: "20%", fontWeight: 500 }}>
            {config?.originalLabel}
          </Typography>

          {renderFieldControls()}

          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => onRemove(field)}
            disabled={isAlwaysRequired}
          >
            Remove
          </Button>
        </Stack>

        {isHelpTextExpanded &&
          config.type !== "header" &&
          config.type !== "staticText" &&
          config.type !== "divider" && (
            <TextField
              size="small"
              fullWidth
              label="Help Text"
              value={config.helpText || ""}
              onChange={(e) =>
                onUpdate(field, { ...config, helpText: e.target.value })
              }
              placeholder="Enter help text for this field"
              multiline
              rows={2}
            />
          )}
      </Stack>
    </Paper>
  );
};
