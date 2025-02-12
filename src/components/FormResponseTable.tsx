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
  Chip,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import {
  CheckCircle as CheckCircleIcon,
  Cancel as CancelIcon,
  AccessTime as AccessTimeIcon,
  Visibility as VisibilityIcon,
} from "@mui/icons-material";
import { useFormResponses } from "../hooks/useFormResponses";
import { useCustomForms } from "../hooks/useCustomForm";

interface FormField {
  label: string;
  type: string;
  visible: boolean;
  required: boolean;
  originalLabel: string;
  helpText?: string;
  category?: string;
  options?: Array<{ label: string; value: string }>;
}

interface FormConfig {
  [key: string]: FormField;
}

interface CustomForm {
  id: string;
  form_name: string;
  form_config: FormConfig;
  field_order: string[];
  created_at: string;
  updated_at: string;
}

interface FormResponsesTableProps {
  formId: string;
  onViewResponse?: (responseData: any) => void;
}

const StatusChip = ({ status }: { status?: string }) => {
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

export const FormResponsesTable: React.FC<FormResponsesTableProps> = ({
  formId,
  onViewResponse,
}) => {
  const { response, loading, error, fetchResponse } = useFormResponses();
  const { getFormById } = useCustomForms();
  const [formData, setFormData] = useState<CustomForm | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        await fetchResponse(formId);
        const form = await getFormById(formId);
        if (form) {
          setFormData(form);
          console.log("Form data loaded:", form);
        }
      } catch (err) {
        console.error("Error loading form data:", err);
      }
    };
    loadData();
  }, [formId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={3}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box p={3}>
        <Typography color="error">
          Error loading responses: {error.message}
        </Typography>
      </Box>
    );
  }

  if (!response || !formData) {
    return (
      <Box p={3}>
        <Typography>No responses found</Typography>
      </Box>
    );
  }

  const getFieldValue = (fieldId: string, value: any, field: FormField) => {
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
        return value.toString();
    }
  };

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Field</TableCell>
            <TableCell>Response</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {formData.field_order.map((fieldId) => {
            const field = formData.form_config[fieldId];
            if (!field || !field.visible) return null;

            return (
              <TableRow key={fieldId}>
                <TableCell>
                  <Typography variant="subtitle2">{field.label}</Typography>
                </TableCell>
                <TableCell>
                  {getFieldValue(
                    fieldId,
                    response.response_data[fieldId],
                    field
                  )}
                </TableCell>
              </TableRow>
            );
          })}
          <TableRow>
            <TableCell>
              <Typography variant="subtitle2">Status</Typography>
            </TableCell>
            <TableCell>
              <Box display="flex" alignItems="center" gap={1}>
                <StatusChip status={response.status} />
                {onViewResponse && (
                  <Tooltip title="View Details">
                    <IconButton
                      size="small"
                      onClick={() => onViewResponse(response.response_data)}
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                )}
              </Box>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
