import React, { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import {
  Checkbox,
  FormControlLabel,
  CircularProgress,
  Typography,
  Divider,
  Box,
  FormGroup,
} from "@mui/material";

function GenerateReportDialog({
  open,
  handleClose,
  onSubmit,
  city,
  isGenerating,
}) {
  // State for report options
  const [reportOptions, setReportOptions] = useState({
    includeCommunities: true,
    includeClasses: false,
  });

  // State for included communities
  const [selectedCommunities, setSelectedCommunities] = useState([]);

  // Set initial states and reset when dialog opens with new city
  useEffect(() => {
    if (open && city && city.communities) {
      // Always select all communities by default
      setSelectedCommunities(
        city.communities.map((community) => community.title)
      );
      setReportOptions({
        includeCommunities: true,
        includeClasses: false,
      });
    }
  }, [city, open]);

  // Handle report options changes
  const handleOptionChange = (event) => {
    const { name, checked } = event.target;
    setReportOptions((prev) => ({
      ...prev,
      [name]: checked,
    }));

    // If includeCommunities is being turned off, reset selected communities
    if (name === "includeCommunities" && !checked) {
      setSelectedCommunities([]);
    } else if (name === "includeCommunities" && checked) {
      // If it's being turned on, select all communities
      setSelectedCommunities(
        city.communities.map((community) => community.name)
      );
    }
  };

  // Handle individual community selection
  const handleCommunityChange = (event) => {
    const communityName = event.target.value;
    if (event.target.checked) {
      setSelectedCommunities((prev) => [...prev, communityName]);
    } else {
      setSelectedCommunities((prev) =>
        prev.filter((name) => name !== communityName)
      );
    }
  };

  const handleGenerateReport = () => {
    const options = {
      includedCommunities: reportOptions.includeCommunities
        ? selectedCommunities
        : [],
      includeClasses: reportOptions.includeClasses,
    };
    onSubmit(options.includedCommunities);
  };

  if (!city) return null;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Generate Report for {city.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ py: 2 }}>
          <Typography variant="subtitle2" color="textSecondary" gutterBottom>
            Report Options
          </Typography>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  name="includeCommunities"
                  checked={reportOptions.includeCommunities}
                  onChange={handleOptionChange}
                  disabled={isGenerating}
                />
              }
              label="Include Communities"
            />
          </FormGroup>

          {reportOptions.includeCommunities && (
            <>
              <Divider sx={{ my: 2 }} />
              <Typography
                variant="subtitle2"
                color="textSecondary"
                gutterBottom
              >
                Select Communities
              </Typography>
              <FormGroup>
                {city.communities?.map((community) => (
                  <FormControlLabel
                    key={community._id}
                    control={
                      <Checkbox
                        value={community.title}
                        checked={selectedCommunities.includes(community.title)}
                        onChange={handleCommunityChange}
                        disabled={
                          isGenerating || !reportOptions.includeCommunities
                        }
                      />
                    }
                    label={community.title + " Community"}
                  />
                ))}
              </FormGroup>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={isGenerating}>
          Cancel
        </Button>
        <Button
          onClick={handleGenerateReport}
          disabled={
            isGenerating ||
            (reportOptions.includeCommunities &&
              selectedCommunities.length === 0)
          }
          startIcon={isGenerating ? <CircularProgress size={20} /> : null}
        >
          {isGenerating ? "Generating..." : "Generate Report"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default GenerateReportDialog;
