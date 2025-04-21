import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from "@mui/material";
import { useEffect, useState } from "react";
import JsonViewer from "@/components/util/debug/DebugOutput";

const ContactFormDialog = ({ open, onClose, onSubmit, initialData }) => {
  const [formData, setFormData] = useState({
    id: initialData?.id || null,
    first_name: initialData?.first_name || "",
    middle_name: initialData?.middle_name || "",
    last_name: initialData?.last_name || "",
    phone: initialData?.phone || "",
    email: initialData?.email || "",
    owner_type: initialData?.owner_type || "user",
    visibility: initialData?.visibility || true,
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // If owner_type is 'user', we don't need to send owner_id as it will be set in the hook
    const submitData = {
      ...formData,
      owner_id: formData.owner_type === "user" ? undefined : formData.owner_id,
    };
    onSubmit(submitData);
  };

  useEffect(() => {
    if (initialData) {
      setFormData({
        id: initialData.id, // Add this line
        first_name: initialData.first_name,
        middle_name: initialData.middle_name,
        last_name: initialData.last_name,
        phone: initialData.phone,
        email: initialData.email,
        owner_type: initialData.owner_type,
        visibility: initialData.visibility,
      });
    }
  }, [initialData]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <form onSubmit={handleSubmit}>
        {/* <JsonViewer data={formData} /> */}

        <DialogTitle>
          {initialData?.id ? "Edit Contact" : "Add New Contact"}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
            <TextField
              name="first_name"
              label="First Name"
              value={formData.first_name}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              name="middle_name"
              label="Middle Name"
              value={formData.middle_name}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              name="last_name"
              label="Last Name"
              value={formData.last_name}
              onChange={handleChange}
              required
              fullWidth
            />

            <TextField
              name="phone"
              label="Phone"
              value={formData.phone}
              onChange={handleChange}
              fullWidth
            />

            <TextField
              name="email"
              label="Email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              fullWidth
            />

            <FormControl fullWidth>
              <InputLabel>Owner Type</InputLabel>
              <Select
                name="owner_type"
                value={formData.owner_type}
                onChange={handleChange}
                label="Owner Type"
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="community">Community</MenuItem>
                <MenuItem value="city">City</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>Visibility</InputLabel>
              <Select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                label="Visibility"
              >
                <MenuItem value={true}>Visible</MenuItem>
                <MenuItem value={false}>Hidden</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Cancel</Button>
          <Button type="submit" variant="contained" color="primary">
            {initialData?.id ? "Save Changes" : "Add Contact"}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
};

export default ContactFormDialog;
