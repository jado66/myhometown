"use client";

import type React from "react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  AppBar,
  Toolbar,
  Container,
  Grid,
  Paper,
  CircularProgress,
} from "@mui/material";
import { ArrowBack, Save } from "@mui/icons-material";

export default function LogHours() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    hours: "",
    activity_description: "",
    category: "general",
    location: "",
  });

  const categories = [
    { value: "general", label: "General" },
    { value: "outreach", label: "Outreach" },
    { value: "administration", label: "Administration" },
    { value: "training", label: "Training" },
    { value: "community_service", label: "Community Service" },
    { value: "other", label: "Other" },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      const response = await fetch("/api/missionary/hours", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(true);
        setMessage("Hours logged successfully!");
        setFormData({
          date: new Date().toISOString().split("T")[0],
          hours: "",
          activity_description: "",
          category: "general",
          location: "",
        });
      } else {
        setSuccess(false);
        setMessage(result.error || "Failed to log hours");
      }
    } catch (error) {
      setSuccess(false);
      setMessage("Failed to log hours");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Box sx={{ minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Header */}
      <AppBar position="static" color="default" elevation={1}>
        <Toolbar>
          <Button
            startIcon={<ArrowBack />}
            onClick={() => router.back()}
            sx={{ mr: 2 }}
            color="inherit"
            size="large"
          >
            Back
          </Button>
          <Box>
            <Typography variant="h5" component="h1" fontWeight="bold">
              Log Volunteer Hours
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Record your missionary service hours
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      <Container maxWidth="md" sx={{ py: 4 }}>
        <Paper elevation={3}>
          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h4" gutterBottom fontWeight="bold">
                Hour Entry Form
              </Typography>
              <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
                Fill out the details of your volunteer service hours
              </Typography>

              <Box component="form" onSubmit={handleSubmit}>
                <Grid container spacing={3}>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="date"
                      label="Date"
                      value={formData.date}
                      onChange={(e) =>
                        handleInputChange("date", e.target.value)
                      }
                      required
                      InputLabelProps={{ shrink: true }}
                      inputProps={{
                        max: new Date().toISOString().split("T")[0],
                      }}
                      sx={{
                        "& .MuiInputBase-input": {
                          fontSize: "1.1rem",
                          padding: "16px 14px",
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "1.1rem",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      type="number"
                      label="Hours"
                      placeholder="8.0"
                      value={formData.hours}
                      onChange={(e) =>
                        handleInputChange("hours", e.target.value)
                      }
                      required
                      inputProps={{
                        step: "0.25",
                        min: "0.25",
                        max: "24",
                      }}
                      sx={{
                        "& .MuiInputBase-input": {
                          fontSize: "1.1rem",
                          padding: "16px 14px",
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "1.1rem",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <FormControl fullWidth>
                      <InputLabel sx={{ fontSize: "1.1rem" }}>
                        Category
                      </InputLabel>
                      <Select
                        value={formData.category}
                        label="Category"
                        onChange={(e) =>
                          handleInputChange("category", e.target.value)
                        }
                        sx={{
                          "& .MuiSelect-select": {
                            fontSize: "1.1rem",
                            padding: "16px 14px",
                          },
                        }}
                      >
                        {categories.map((category) => (
                          <MenuItem
                            key={category.value}
                            value={category.value}
                            sx={{ fontSize: "1.1rem" }}
                          >
                            {category.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      label="Activity Description"
                      placeholder="Describe the activities you performed during this service time..."
                      value={formData.activity_description}
                      onChange={(e) =>
                        handleInputChange(
                          "activity_description",
                          e.target.value
                        )
                      }
                      required
                      sx={{
                        "& .MuiInputBase-input": {
                          fontSize: "1.1rem",
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "1.1rem",
                        },
                      }}
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Location (Optional)"
                      placeholder="Where did this service take place?"
                      value={formData.location}
                      onChange={(e) =>
                        handleInputChange("location", e.target.value)
                      }
                      sx={{
                        "& .MuiInputBase-input": {
                          fontSize: "1.1rem",
                          padding: "16px 14px",
                        },
                        "& .MuiInputLabel-root": {
                          fontSize: "1.1rem",
                        },
                      }}
                    />
                  </Grid>

                  {message && (
                    <Grid item xs={12}>
                      <Alert
                        severity={success ? "success" : "error"}
                        sx={{ fontSize: "1.1rem" }}
                      >
                        {message}
                      </Alert>
                    </Grid>
                  )}

                  <Grid item xs={12}>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 2,
                      }}
                    >
                      <Button
                        variant="outlined"
                        onClick={() => router.back()}
                        size="large"
                        sx={{ fontSize: "1.1rem" }}
                      >
                        Cancel
                      </Button>
                      <Button
                        type="submit"
                        variant="contained"
                        disabled={loading}
                        startIcon={
                          loading ? (
                            <CircularProgress size={20} color="inherit" />
                          ) : (
                            <Save />
                          )
                        }
                        size="large"
                        sx={{ fontSize: "1.1rem", fontWeight: "bold" }}
                      >
                        {loading ? "Saving..." : "Log Hours"}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </Box>
            </CardContent>
          </Card>
        </Paper>
      </Container>
    </Box>
  );
}
