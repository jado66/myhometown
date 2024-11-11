import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert as MuiAlert,
} from "@mui/material";

const CreateUserForm = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    email: "",
    firstName: "",
    lastName: "",
    permissions: {
      administrator: false,
      cityManagement: false,
      communityManagement: false,
      texting: false,
      classManagement: false,
    },
    contactNumber: "",
    cities: [],
    communities: [],
  });

  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [emailValid, setEmailValid] = useState(true);
  const [previousFormData, setPreviousFormData] = useState(null);

  const handlePermissionChange = (permission) => {
    let updatedPermissions = {
      ...formData.permissions,
      [permission]: !formData.permissions[permission],
    };

    if (permission === "administrator" && updatedPermissions[permission]) {
      Object.keys(updatedPermissions).forEach((key) => {
        if (key !== "administrator") {
          updatedPermissions[key] = false;
        }
      });
    }

    if (permission !== "administrator" && updatedPermissions[permission]) {
      updatedPermissions["administrator"] = false;
    }

    setFormData({
      ...formData,
      permissions: updatedPermissions,
    });
  };

  const validateEmail = (email) => {
    // Regular expression for validating an Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateEmail(formData.email)) {
      setEmailValid(false);
      return;
    }
    setEmailValid(true);
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
        firstName: "",
        lastName: "",
        permissions: {
          administrator: false,
          cityManagement: false,
          communityManagement: false,
          texting: false,
          classManagement: false,
        },
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
            error={!emailValid}
            helperText={!emailValid ? "Please enter a valid email address" : ""}
            onChange={(e) =>
              setFormData({ ...formData, email: e.target.value })
            }
          />
          <TextField
            fullWidth
            required
            label="First Name"
            type="text"
            variant="outlined"
            margin="dense"
            value={formData.firstName}
            onChange={(e) =>
              setFormData({ ...formData, firstName: e.target.value })
            }
          />
          <TextField
            fullWidth
            required
            label="Last Name"
            type="text"
            variant="outlined"
            margin="dense"
            value={formData.lastName}
            onChange={(e) =>
              setFormData({ ...formData, lastName: e.target.value })
            }
          />

          <FormControl component="fieldset" sx={{ mt: 2 }} fullWidth>
            <FormGroup>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.permissions.administrator}
                    onChange={() => handlePermissionChange("administrator")}
                  />
                }
                label="Administrator"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={formData.permissions.cityManagement}
                    disabled={formData.permissions.administrator}
                    onChange={() => handlePermissionChange("cityManagement")}
                  />
                }
                label="City Management"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    disabled={formData.permissions.administrator}
                    checked={formData.permissions.communityManagement}
                    onChange={() =>
                      handlePermissionChange("communityManagement")
                    }
                  />
                }
                label="Community Management"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    disabled={formData.permissions.administrator}
                    checked={formData.permissions.texting}
                    onChange={() => handlePermissionChange("texting")}
                  />
                }
                label="Texting"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    disabled={formData.permissions.administrator}
                    checked={formData.permissions.classManagement}
                    onChange={() => handlePermissionChange("classManagement")}
                  />
                }
                label="Class Management"
              />
            </FormGroup>
          </FormControl>
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
        <Button
          onClick={handleSubmit}
          color="primary"
          disabled={
            loading ||
            !formData.email ||
            !formData.firstName ||
            !formData.lastName
          }
        >
          {loading ? "Creating User..." : "Create User"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default CreateUserForm;
