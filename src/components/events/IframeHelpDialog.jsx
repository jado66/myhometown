import React, { useState } from "react";
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stepper,
  Step,
  StepLabel,
  Typography,
  Box,
  Divider,
} from "@mui/material";
import { Code } from "@mui/icons-material";

const steps = [
  "Share your Google Form",
  'Click "<>" embed code option',
  "Copy the iframe HTML code",
];

function getStepContent(step) {
  switch (step) {
    case 0:
      return (
        <>
          <ul>
            <li>
              <Typography gutterBottom>
                Navigate to your Google form.
              </Typography>
            </li>
            <li>
              <Typography gutterBottom>
                In the upper-righthand corner click the send button.
              </Typography>
            </li>
          </ul>
          <img
            src="/images/iframeDialogSteps/step-1.png"
            style={{ margin: "20px 0px" }} // Adjust margin as needed
          />
        </>
      );
    case 1:
      return (
        <>
          <ul>
            <li>
              <Typography gutterBottom display="flex">
                In the{" "}
                <strong style={{ marginLeft: "0.5em", marginRight: "0.5em" }}>
                  Send via
                </strong>{" "}
                row click on the{" "}
                <strong>
                  <Code style={{ marginLeft: "0.5em" }} />
                </strong>
              </Typography>
            </li>
          </ul>
          <img
            src="/images/iframeDialogSteps/step-2.png"
            style={{ margin: "20px 0px" }} // Adjust margin as needed
          />
        </>
      );
    case 2:
      return (
        <>
          <ul>
            <li>
              <Typography gutterBottom display="flex">
                Click{" "}
                <strong style={{ marginLeft: "0.5em", marginRight: "0.5em" }}>
                  Copy
                </strong>
              </Typography>
            </li>
            <li>
              <Typography gutterBottom display="flex">
                Paste the value inside the new class form on the myHometown
                site.
              </Typography>
            </li>
          </ul>
          <img
            src="/images/iframeDialogSteps/step-3.png"
            style={{ margin: "20px 0px" }} // Adjust margin as needed
          />
        </>
      );
    default:
      return "Unknown step";
  }
}

export function IframeHelpDialog({ open, handleClose }) {
  const [activeStep, setActiveStep] = useState(0);

  const handleNext = () => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const close = () => {
    setActiveStep(0);
    handleClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
      <DialogTitle textAlign="center">
        How to Get the Embed HTML iFrame Link from a Google Form
      </DialogTitle>
      <DialogContent>
        <Divider sx={{ mb: 3 }} />

        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={index}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
        <Box sx={{ p: 4 }}>
          <div>
            {activeStep === steps.length ? (
              <Typography variant="h6">All steps completed!</Typography>
            ) : (
              <div>
                <Typography>{getStepContent(activeStep)}</Typography>
              </div>
            )}
          </div>
        </Box>
      </DialogContent>
      <DialogActions display="flex">
        <Button disabled={activeStep === 0} onClick={handleBack}>
          Back
        </Button>
        <Box sx={{ flex: "1 1 auto" }} />

        {activeStep === steps.length - 1 ? (
          <Button variant="contained" color="primary" onClick={close}>
            Close
          </Button>
        ) : (
          <Button variant="contained" color="primary" onClick={handleNext}>
            Next
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
