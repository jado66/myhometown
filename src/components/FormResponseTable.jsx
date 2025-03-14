import React, { useEffect, useState } from "react";
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  IconButton,
  Tooltip,
  TablePagination,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import JsonViewer from "./util/debug/DebugOutput";

const PAGE_SIZE = 10;

const StatusChip = ({ status }) => {
  switch (status) {
    case "submitted":
      return (
        <Chip
          icon={<AccessTimeIcon />}
          label="Submitted"
          color="primary"
          size="small"
        />
      );
    case "approved":
      return (
        <Chip
          icon={<CheckCircleIcon />}
          label="Approved"
          color="success"
          size="small"
        />
      );
    case "rejected":
      return (
        <Chip
          icon={<CancelIcon />}
          label="Rejected"
          color="error"
          size="small"
        />
      );
    default:
      return (
        <Chip
          icon={<AccessTimeIcon />}
          label="Draft"
          variant="outlined"
          size="small"
        />
      );
  }
};

const SummaryCard = ({ title, value, color = "textPrimary" }) => (
  <Card>
    <CardContent>
      <Typography variant="body2" color="textSecondary">
        {title}
      </Typography>
      <Typography variant="h4" color={color}>
        {value}
      </Typography>
    </CardContent>
  </Card>
);

export const FormResponseTable = ({
  formId,
  responses,
  formData,
  onViewResponse,
}) => {
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(PAGE_SIZE);
  const [summary, setSummary] = useState({
    total: 0,
    submitted: 0,
    approved: 0,
    rejected: 0,
    draft: 0,
  });

  useEffect(() => {
    if (responses) {
      // Calculate summary statistics using native JS
      const stats = responses.reduce((acc, response) => {
        const status = response.status || "draft";
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {});

      setSummary({
        total: responses.length,
        submitted: stats.submitted || 0,
        approved: stats.approved || 0,
        rejected: stats.rejected || 0,
        draft: stats.draft || 0,
      });
    }
  }, [responses]);

  if (!responses || !formData) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <JsonViewer data={{ formId, responses, formData }} />
        <CircularProgress />
      </Box>
    );
  }

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const getFieldValue = (fieldId, value, field) => {
    if (value === null || value === undefined) return "-";

    switch (field.type) {
      case "checkbox":
        return value ? "Yes" : "No";
      case "select":
        const option = field.options?.find((opt) => opt.value === value);
        return option ? option.label : value;
      case "date":
        return new Date(value).toLocaleDateString();
      default:
        return String(value);
    }
  };

  const visibleFields = formData.field_order
    .filter((fieldId) => {
      const field = formData.form_config[fieldId];
      return field && field.visible;
    })
    .slice(0, 3);

  return (
    <Box sx={{ width: "100%", mb: 4 }}>
      {/* Summary Cards */}
      <Grid container spacing={2} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard title="Total Responses" value={summary.total} />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            title="Submitted"
            value={summary.submitted}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            title="Approved"
            value={summary.approved}
            color="success"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard
            title="Rejected"
            value={summary.rejected}
            color="error"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={2.4}>
          <SummaryCard title="Draft" value={summary.draft} />
        </Grid>
      </Grid>

      {/* Responses Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Date</TableCell>
              <TableCell>Status</TableCell>
              {visibleFields.map((fieldId) => (
                <TableCell key={fieldId}>
                  {formData.form_config[fieldId].label}
                </TableCell>
              ))}
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {responses
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((response, index) => (
                <TableRow key={index}>
                  <TableCell>
                    {new Date(response.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <StatusChip status={response.status} />
                  </TableCell>
                  {visibleFields.map((fieldId) => (
                    <TableCell key={fieldId}>
                      {getFieldValue(
                        fieldId,
                        response.response_data[fieldId],
                        formData.form_config[fieldId]
                      )}
                    </TableCell>
                  ))}
                  <TableCell align="right">
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => onViewResponse?.(response.response_data)}
                      >
                        <VisibilityIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
        <TablePagination
          rowsPerPageOptions={[5, 10, 25, 50]}
          component="div"
          count={responses.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </TableContainer>
    </Box>
  );
};
