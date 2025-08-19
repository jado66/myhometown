// TransferDialog.jsx
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  Alert,
  CircularProgress,
} from "@mui/material";

const TransferDialog = ({
  open,
  onClose,
  studentToTransfer,
  classData,
  classesForTransfer,
  selectedTargetClass,
  setSelectedTargetClass,
  onConfirm,
  transferLoading,
  loadingClasses,
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Transfer Student to Another Class</DialogTitle>
      <DialogContent>
        {studentToTransfer && (
          <>
            <Typography sx={{ mb: 2 }}>
              Transfer{" "}
              <strong>
                {studentToTransfer.firstName} {studentToTransfer.lastName}
              </strong>{" "}
              from <strong>{classData.title}</strong> to:
            </Typography>

            {loadingClasses ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
                <CircularProgress />
              </Box>
            ) : (
              <FormControl fullWidth>
                <InputLabel>Select Target Class</InputLabel>
                <Select
                  value={selectedTargetClass}
                  onChange={(e) => setSelectedTargetClass(e.target.value)}
                  label="Select Target Class"
                >
                  {classesForTransfer.length === 0 ? (
                    <MenuItem disabled>No other classes available</MenuItem>
                  ) : (
                    classesForTransfer.map((cls) => {
                      const enrolled =
                        cls.signups?.filter((s) => !s.isWaitlisted).length || 0;
                      const waitlisted =
                        cls.signups?.filter((s) => s.isWaitlisted).length || 0;
                      const capacity = parseInt(cls.capacity) || 0;
                      const waitlistCapacity =
                        parseInt(cls.waitlistCapacity) || 0;
                      const isFull = enrolled >= capacity;
                      const isWaitlistFull =
                        cls.isWaitlistEnabled && waitlisted >= waitlistCapacity;
                      const isCompletelyFull =
                        isFull && (!cls.isWaitlistEnabled || isWaitlistFull);

                      return (
                        <MenuItem
                          key={cls.id}
                          value={cls.id}
                          disabled={isCompletelyFull}
                        >
                          <Box
                            sx={{
                              display: "flex",
                              flexDirection: "column",
                              width: "100%",
                            }}
                          >
                            <Typography>{cls.title}</Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {enrolled}/{capacity} enrolled
                              {cls.isWaitlistEnabled &&
                                ` • ${waitlisted}/${waitlistCapacity} waitlisted`}
                              {isCompletelyFull && " • FULL"}
                              {isFull &&
                                !isCompletelyFull &&
                                cls.isWaitlistEnabled &&
                                " • Will be waitlisted"}
                            </Typography>
                          </Box>
                        </MenuItem>
                      );
                    })
                  )}
                </Select>
              </FormControl>
            )}

            {selectedTargetClass && (
              <Alert severity="info" sx={{ mt: 2 }}>
                {(() => {
                  const targetClass = classesForTransfer.find(
                    (c) => c.id === selectedTargetClass
                  );
                  if (!targetClass) return null;

                  const enrolled =
                    targetClass.signups?.filter((s) => !s.isWaitlisted)
                      .length || 0;
                  const capacity = parseInt(targetClass.capacity) || 0;
                  const isFull = enrolled >= capacity;

                  if (isFull && targetClass.isWaitlistEnabled) {
                    return "Note: This student will be added to the waitlist as the class is at capacity.";
                  } else if (!isFull) {
                    return "This student will be enrolled directly into the class.";
                  }
                  return null;
                })()}
              </Alert>
            )}
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button
          onClick={onConfirm}
          color="primary"
          variant="contained"
          disabled={transferLoading || !selectedTargetClass}
        >
          {transferLoading ? "Transferring..." : "Transfer Student"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TransferDialog;
