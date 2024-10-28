import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  MenuItem,
  Alert as MuiAlert,
} from "@mui/material";

const CreateUserForm = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "None",
    contactNumber: "",
    cities: [],
    communities: [],
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const [previousFormData, setPreviousFormData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch("/api/database/users/add-user", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create user");
      }

      setResult(data);

      setPreviousFormData(formData);

      setFormData({
        email: "",
        name: "",
        role: "None",
        contactNumber: "",
        cities: [],
        communities: [],
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={show} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create User</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <TextField
            required
            fullWidth
            label="Email"
            type="email"
            variant="outlined"
            margin="dense"
            value={formData.email}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <TextField
            fullWidth
            label="Name"
            type="text"
            variant="outlined"
            margin="dense"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <TextField
            select
            fullWidth
            label="Role"
            variant="outlined"
            margin="dense"
            value={formData.role}
            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
          >
            <MenuItem value="None">None</MenuItem>
            <MenuItem value="Admin">Admin</MenuItem>
            <MenuItem value="User">User</MenuItem>
          </TextField>
        </form>

        {error && (
          <MuiAlert severity="error" sx={{ mt: 2 }}>
            {error}
          </MuiAlert>
        )}

        {result && (
          <MuiAlert severity="success" sx={{ mt: 2 }}>
            User created successfully. A password reset email has been sent to{" "}
            {previousFormData.email}.
          </MuiAlert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="secondary" disabled={loading}>
          Cancel
        </Button>
        <Button onClick={handleSubmit} color="primary" disabled={loading}>
          {loading ? "Creating User..." : "Create User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserForm;
