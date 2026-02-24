"use client";
import { useEffect, useRef, useState } from "react";
import {
  Box,
  Button,
  FormHelperText,
  Stack,
  Typography,
  useMediaQuery,
} from "@mui/material";
import SignaturePad from "react-signature-canvas";

export const SignatureField = ({ field, config, value, onChange, error, resetKey }) => {
  const containerRef = useRef(null);
  const [sigPad, setSigPad] = useState(null);
  const [padWidth, setPadWidth] = useState(500);
  const isMobile = useMediaQuery("(max-width:600px)");

  useEffect(() => {
    if (resetKey && sigPad) {
      sigPad.clear();
      onChange(field, null);
    }
  }, [resetKey]);

  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.clientWidth - 16;
        setPadWidth(isMobile ? width : Math.min(width, 500));
      }
    };

    updateWidth();
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
        boxSizing: "border-box",
        overflow: "hidden",
        touchAction: "none",
      }}
    >
      <Typography sx={{ mb: 1 }}>
        {config.label}
        {config.required && " *"}
      </Typography>
      <Box
        sx={{
          border: "1px solid #ccc",
          borderRadius: 1,
          overflow: "hidden",
          width: "100%",
        }}
      >
        <SignaturePad
          backgroundColor="#edeff2"
          canvasProps={{
            className: "signature-canvas",
            width: padWidth,
            height: isMobile ? 150 : 200,
            style: { display: "block", maxWidth: "100%" },
          }}
          ref={(ref) => setSigPad(ref)}
          onEnd={() => {
            if (sigPad) {
              onChange(field, sigPad.toDataURL());
            }
          }}
        />
      </Box>
      <Stack direction="row" spacing={2} mt={1} alignItems="center">
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
        {value && (
          <Typography variant="caption" color="success.main">
            Signature captured
          </Typography>
        )}
      </Stack>
      {(error || config.helpText) && (
        <FormHelperText error={!!error} sx={{ mt: 0.5 }}>
          {error || config.helpText}
        </FormHelperText>
      )}
    </Box>
  );
};
