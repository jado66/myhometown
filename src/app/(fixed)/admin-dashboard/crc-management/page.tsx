"use client";
import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  Grid,
  DialogContent,
  DialogActions,
  TextField,
  Chip,
  Tooltip,
  TablePagination,
  IconButton,
  Box,
  Typography,
  CircularProgress,
  Card,
  CardContent,
  useTheme,
  alpha,
} from "@mui/material";
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  LocationOn as LocationIcon,
  Close as CloseIcon,
  Save as SaveIcon,
} from "@mui/icons-material";
import { supabase } from "@/util/supabase";

const CRCManagement = () => {
  const theme = useTheme();
  const [crcs, setCrcs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingCrc, setEditingCrc] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [crcToDelete, setCrcToDelete] = useState(null);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    area_id: "",
    name: "",
    address: "",
    city: "",
    state: "",
    zip: "",
  });

  const [formErrors, setFormErrors] = useState({});

  // Fetch CRCs from Supabase
  const fetchCrcs = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("community_resource_centers")
        .select("*")
        .order("name");

      if (error) throw error;
      setCrcs(data || []);
    } catch (error) {
      showToast("Error fetching CRCs: " + error.message, "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCrcs();
  }, []);

  const showToast = (message, severity = "success") => {
    if (severity === "error") {
      toast.error(message);
    } else if (severity === "warning") {
      toast.warn(message);
    } else if (severity === "info") {
      toast.info(message);
    } else {
      toast.success(message);
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.area_id.trim()) errors.area_id = "Area ID is required";
    if (!formData.name.trim()) errors.name = "Name is required";
    if (!formData.address.trim()) errors.address = "Address is required";
    if (!formData.city.trim()) errors.city = "City is required";
    if (!formData.state.trim()) errors.state = "State is required";
    if (!formData.zip.trim()) errors.zip = "ZIP code is required";

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const resetForm = () => {
    setFormData({
      area_id: "",
      name: "",
      address: "",
      city: "",
      state: "",
      zip: "",
    });
    setFormErrors({});
    setEditingCrc(null);
  };

  const handleOpenDialog = (crc = null) => {
    if (crc) {
      setEditingCrc(crc);
      setFormData({
        area_id: crc.area_id || "",
        name: crc.name || "",
        address: crc.address || "",
        city: crc.city || "",
        state: crc.state || "",
        zip: crc.zip || "",
      });
    } else {
      resetForm();
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    resetForm();
  };

  const handleInputChange = (field) => (event) => {
    const value = event.target.value;
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));

    // Clear error when user starts typing
    if (formErrors[field]) {
      setFormErrors((prev) => ({
        ...prev,
        [field]: "",
      }));
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    try {
      setSubmitting(true);

      if (editingCrc) {
        // Update existing CRC
        const { error } = await supabase
          .from("community_resource_centers")
          .update(formData)
          .eq("id", editingCrc.id);

        if (error) throw error;
        showToast("CRC updated successfully!");
      } else {
        // Create new CRC
        const { error } = await supabase
          .from("community_resource_centers")
          .insert([formData]);

        if (error) throw error;
        showToast("CRC created successfully!");
      }

      handleCloseDialog();
      fetchCrcs();
    } catch (error) {
      showToast("Error saving CRC: " + error.message, "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteClick = (crc) => {
    setCrcToDelete(crc);
    setDeleteConfirmOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      const { error } = await supabase
        .from("community_resource_centers")
        .delete()
        .eq("id", crcToDelete.id);

      if (error) throw error;

      showToast("CRC deleted successfully!");
      setDeleteConfirmOpen(false);
      setCrcToDelete(null);
      fetchCrcs();
    } catch (error) {
      showToast("Error deleting CRC: " + error.message, "error");
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmOpen(false);
    setCrcToDelete(null);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const paginatedCrcs = crcs.slice(
    page * rowsPerPage,
    page * rowsPerPage + rowsPerPage
  );

  if (loading) {
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="400px"
        flexDirection="column"
        gap={2}
      >
        <CircularProgress size={40} />
        <Typography variant="h6" color="text.secondary">
          Loading Community Resource Centers...
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3, maxWidth: "100%" }}>
      {/* Header */}
      <Card
        sx={{
          mb: 3,
          background: ` ${theme.palette.primary.main} `,
        }}
      >
        <CardContent>
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h4"
                component="h1"
                sx={{ color: "white", fontWeight: "bold" }}
              >
                Community Resource Centers
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ color: alpha(theme.palette.common.white, 0.8), mt: 1 }}
              >
                Manage your community resource center locations
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleOpenDialog()}
              sx={{
                bgcolor: "white",
                color: theme.palette.primary.main,
                "&:hover": {
                  bgcolor: alpha(theme.palette.common.white, 0.9),
                },
              }}
            >
              Add New CRC
            </Button>
          </Box>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {crcs.length}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Total CRCs
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {new Set(crcs.map((crc) => crc.state)).size}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                States Covered
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {new Set(crcs.map((crc) => crc.city)).size}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Cities Served
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Typography variant="h4" color="primary.main" fontWeight="bold">
                {new Set(crcs.map((crc) => crc.area_id)).size}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Service Areas
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Main Table */}
      <Card elevation={3}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "grey.50" }}>
                <TableCell sx={{ fontWeight: "bold" }}>Area ID</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Name</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>Address</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>City</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>State</TableCell>
                <TableCell sx={{ fontWeight: "bold" }}>ZIP</TableCell>
                <TableCell align="center" sx={{ fontWeight: "bold" }}>
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {paginatedCrcs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <Typography variant="body1" color="text.secondary">
                      No Community Resource Centers found. Click "Add New CRC"
                      to get started.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCrcs.map((crc) => (
                  <TableRow key={crc.id} hover>
                    <TableCell>
                      <Chip
                        label={crc.area_id}
                        variant="outlined"
                        size="small"
                        color="primary"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {crc.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box display="flex" alignItems="center" gap={1}>
                        <LocationIcon fontSize="small" color="action" />
                        <Typography variant="body2">{crc.address}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{crc.city}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={crc.state}
                        size="small"
                        sx={{ bgcolor: "grey.100" }}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontFamily="monospace">
                        {crc.zip}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Tooltip title="Edit CRC">
                        <IconButton
                          size="small"
                          onClick={() => handleOpenDialog(crc)}
                          sx={{ color: "primary.main", mr: 1 }}
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Delete CRC">
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteClick(crc)}
                          sx={{ color: "error.main" }}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {crcs.length > 0 && (
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={crcs.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
          />
        )}
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog
        open={openDialog}
        onClose={handleCloseDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          elevation: 8,
        }}
      >
        <form onSubmit={handleSubmit}>
          <DialogTitle
            sx={{
              bgcolor: "primary.main",
              color: "white",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Typography variant="h6">
              {editingCrc
                ? "Edit Community Resource Center"
                : "Add New Community Resource Center"}
            </Typography>
            <IconButton onClick={handleCloseDialog} sx={{ color: "white" }}>
              <CloseIcon />
            </IconButton>
          </DialogTitle>

          <DialogContent>
            <Grid container spacing={3} sx={{ pt: 3 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  autoFocus
                  label="Area ID"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.area_id}
                  onChange={handleInputChange("area_id")}
                  error={!!formErrors.area_id}
                  helperText={formErrors.area_id}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="ZIP Code"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.zip}
                  onChange={handleInputChange("zip")}
                  error={!!formErrors.zip}
                  helperText={formErrors.zip}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Name"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.name}
                  onChange={handleInputChange("name")}
                  error={!!formErrors.name}
                  helperText={formErrors.name}
                  required
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Address"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.address}
                  onChange={handleInputChange("address")}
                  error={!!formErrors.address}
                  helperText={formErrors.address}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={8}>
                <TextField
                  label="City"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.city}
                  onChange={handleInputChange("city")}
                  error={!!formErrors.city}
                  helperText={formErrors.city}
                  required
                />
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="State"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={formData.state}
                  onChange={handleInputChange("state")}
                  error={!!formErrors.state}
                  helperText={formErrors.state}
                  required
                />
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3, bgcolor: "grey.50" }}>
            <Button onClick={handleCloseDialog} disabled={submitting}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              startIcon={
                submitting ? <CircularProgress size={16} /> : <SaveIcon />
              }
              disabled={submitting}
            >
              {submitting ? "Saving..." : editingCrc ? "Update" : "Create"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteConfirmOpen} onClose={handleDeleteCancel}>
        <DialogTitle sx={{ color: "error.main" }}>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete{" "}
            <strong>"{crcToDelete?.name}"</strong>? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDeleteCancel}>Cancel</Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            startIcon={<DeleteIcon />}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CRCManagement;
