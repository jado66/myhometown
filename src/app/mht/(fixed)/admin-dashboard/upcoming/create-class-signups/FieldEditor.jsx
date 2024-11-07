"use client";
import { useState } from "react";
import {
  Button,
  TextField,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
  Stack,
  IconButton,
} from "@mui/material";
import DragIndicatorIcon from "@mui/icons-material/DragIndicator";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";

export const FieldEditor = ({ field, config, onUpdate, onRemove }) => {
  const [isHelpTextExpanded, setIsHelpTextExpanded] = useState(false);

  const renderFieldControls = () => {
    // Handle structural elements (header, text block, divider)
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

    // Default field controls
    return (
      <>
        <TextField
          size="small"
          value={config.label}
          onChange={(e) =>
            onUpdate(field, { ...config, label: e.target.value })
          }
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
            {config.originalLabel}
          </Typography>

          {renderFieldControls()}

          <Button
            variant="outlined"
            color="error"
            size="small"
            onClick={() => onRemove(field)}
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
