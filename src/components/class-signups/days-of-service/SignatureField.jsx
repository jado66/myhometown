"use client";
import { useEffect, useRef, useState } from "react";
import { Box, Button, FormHelperText, Stack, Typography } from "@mui/material";
import Signature from "@uiw/react-signature";

const BG_COLOR = "#edeff2";

export const SignatureField = ({
  field,
  config,
  value,
  onChange,
  error,
  resetKey,
}) => {
  const svgRef = useRef(null);
  const [captured, setCaptured] = useState(!!value);

  useEffect(() => {
    if (resetKey && svgRef.current) {
      svgRef.current.clear();
      setCaptured(false);
      onChange(field, null);
    }
  }, [resetKey]);

  const handleEnd = () => {
    if (svgRef.current) {
      const svgEl = svgRef.current.svg?.current;
      if (svgEl) {
        const svgData = new XMLSerializer().serializeToString(svgEl);
        const dataUrl = `data:image/svg+xml;base64,${btoa(svgData)}`;
        setCaptured(true);
        onChange(field, dataUrl);
      }
    }
  };

  const handleClear = () => {
    if (svgRef.current) {
      svgRef.current.clear();
    }
    setCaptured(false);
    onChange(field, null);
  };

  return (
    <Box
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
          "& svg": {
            display: "block",
            width: "100%",
            height: 200,
            background: BG_COLOR,
          },
        }}
      >
        <Signature ref={svgRef} onPointerUp={handleEnd} />
      </Box>
      <Stack direction="row" spacing={2} mt={1} alignItems="center">
        <Button size="small" variant="outlined" onClick={handleClear}>
          Clear
        </Button>
        {captured && value && (
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
