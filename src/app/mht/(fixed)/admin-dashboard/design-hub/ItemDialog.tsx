"use client";

import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  FormControlLabel,
  Checkbox,
} from "@mui/material";

interface ItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: "standard-print-items" | "signs-banners";
  itemTitle: string;
  onSubmit: (data: any) => void;
}

export function ItemDialog({
  open,
  onOpenChange,
  itemType,
  itemTitle,
  onSubmit,
}: ItemDialogProps) {
  const [formData, setFormData] = useState<any>({
    purpose: "",
    theme: "",
    dueDate: "",
    englishText: "",
    spanishText: "",
    hasAttachments: false,
    size: "",
    otherSize: "",
  });

  const handleSubmit = () => {
    onSubmit({ ...formData, itemTitle, itemType });
    setFormData({
      purpose: "",
      theme: "",
      dueDate: "",
      englishText: "",
      spanishText: "",
      hasAttachments: false,
      size: "",
      otherSize: "",
    });
    onOpenChange(false);
  };

  const updateField = (field: string, value: string | boolean) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>Add {itemTitle}</DialogTitle>
      <DialogContent>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Fill out the details for your {itemType.replace("-", " ")} request.
        </Typography>

        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          <TextField
            label="Purpose"
            value={formData.purpose}
            onChange={(e) => updateField("purpose", e.target.value)}
            placeholder="What is this for?"
            fullWidth
          />

          <TextField
            label="Theme"
            value={formData.theme}
            onChange={(e) => updateField("theme", e.target.value)}
            placeholder="Design theme or style"
            fullWidth
          />

          <TextField
            label="Due Date"
            type="date"
            value={formData.dueDate}
            onChange={(e) => updateField("dueDate", e.target.value)}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label="English Text"
            value={formData.englishText}
            onChange={(e) => updateField("englishText", e.target.value)}
            placeholder="English content for the design"
            multiline
            rows={3}
            fullWidth
          />

          <TextField
            label="Spanish Translation"
            value={formData.spanishText}
            onChange={(e) => updateField("spanishText", e.target.value)}
            placeholder="Spanish translation of the content"
            multiline
            rows={3}
            fullWidth
          />

          {itemType === "standard-print-items" ? (
            <FormControl fullWidth>
              <InputLabel>Size</InputLabel>
              <Select
                value={formData.size}
                onChange={(e) => updateField("size", e.target.value)}
                label="Size"
              >
                <MenuItem value="8.5x11">
                  8.5" x 11" (for printing and website)
                </MenuItem>
                <MenuItem value="poster">Poster Size (24" x 36")</MenuItem>
                <MenuItem value="door-hanger">Door Hanger</MenuItem>
                <MenuItem value="other">Other</MenuItem>
              </Select>
            </FormControl>
          ) : (
            <TextField
              label="Size"
              value={formData.size}
              onChange={(e) => updateField("size", e.target.value)}
              placeholder="Specify dimensions"
              fullWidth
            />
          )}

          {formData.size === "other" && (
            <TextField
              label="Custom Size"
              value={formData.otherSize}
              onChange={(e) => updateField("otherSize", e.target.value)}
              placeholder="Specify custom dimensions"
              fullWidth
            />
          )}

          <FormControlLabel
            control={
              <Checkbox
                checked={formData.hasAttachments}
                onChange={(e) =>
                  updateField("hasAttachments", e.target.checked)
                }
                color="primary"
              />
            }
            label="I have additional attachments for this design"
            sx={{ mt: 1 }}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ ml: 4, mt: -1 }}
          >
            Additional attachments may include: QR codes, reference images,
            specific design elements, or other supporting materials. The Design
            Hub team will follow up with you via email to collect these
            materials.
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => onOpenChange(false)}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained">
          Add to Cart
        </Button>
      </DialogActions>
    </Dialog>
  );
}
