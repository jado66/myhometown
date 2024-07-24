const { Alert, Button } = require("@mui/material");
const { useState } = require("react");

export const NotResponsiveAlert = ({ sx }) => {
  const [isShowAlert, setShowAlert] = useState(true);
  const onClose = () => setShowAlert(false);

  return (
    <Alert
      sx={{
        display: { md: "none", xs: isShowAlert ? "flex" : "none" },
        ...sx,
      }}
      severity="info"
      onClose={onClose}
    >
      This page is not optimized for Mobile. Please use device with a wider
      screen.
    </Alert>
  );
};
