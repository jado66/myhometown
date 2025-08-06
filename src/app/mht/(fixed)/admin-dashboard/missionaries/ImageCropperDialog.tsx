"use client";
// components/image-cropper-dialog.tsx
import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Slider,
  Typography,
  Box,
  IconButton,
  CircularProgress,
} from "@mui/material";
import { Close as CloseIcon, Crop as CropIcon } from "@mui/icons-material";
import { getCroppedImg } from "@/util/crop-image";

interface ImageCropperDialogProps {
  open: boolean;
  imageSrc: string | null;
  onClose: () => void;
  onSave: (croppedImageFile: File) => void;
  loading: boolean;
}

const ImageCropperDialog: React.FC<ImageCropperDialogProps> = ({
  open,
  imageSrc,
  onClose,
  onSave,
  loading,
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<any>(null);

  const onCropComplete = useCallback(
    (croppedArea: any, croppedAreaPixels: any) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const { blob, dataUrl } = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        0 // rotation disabled
      );

      if (blob) {
        // Create a File object from the Blob for consistent handling with useUploadFile
        const croppedFile = new File([blob], "profile.webp", {
          type: "image/webp",
        });
        onSave(croppedFile);
      }
    } catch (e) {
      console.error("Error cropping image:", e);
      // Optionally show a toast or error message
    }
  };

  if (!open || !imageSrc) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { maxHeight: "90vh", display: "flex", flexDirection: "column" },
      }}
    >
      <DialogTitle
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Typography variant="h6">Crop Profile Picture</Typography>
        <IconButton onClick={onClose} edge="end">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        dividers
        sx={{ flexGrow: 1, display: "flex", flexDirection: "column", p: 0 }}
      >
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: 400,
            bgcolor: "grey.200",
          }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={0} // rotation disabled
            aspect={1} // Square aspect ratio for circular avatar
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onCropComplete={onCropComplete}
            cropShape="round" // Circular crop area
            showGrid={false}
            restrictPosition={false}
          />
        </Box>
        <Box sx={{ p: 2, pt: 3 }}>
          <Typography gutterBottom>Zoom</Typography>
          <Slider
            value={zoom}
            min={1}
            max={3}
            step={0.1}
            aria-labelledby="zoom-slider"
            onChange={(e, val) => setZoom(val as number)}
          />
        </Box>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          startIcon={loading ? <CircularProgress size={20} /> : <CropIcon />}
          disabled={loading}
          sx={{ ml: 1 }}
        >
          {loading ? "Processing..." : "Crop & Save"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ImageCropperDialog;
