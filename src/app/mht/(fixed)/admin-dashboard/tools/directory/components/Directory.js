import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  TextField,
  IconButton,
  Button,
  Box,
  Typography,
  Alert,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Add as AddIcon,
  FileUpload as FileUploadIcon,
  FileDownload as FileDownloadIcon,
  Delete,
} from "@mui/icons-material";
import Creatable from "react-select/creatable";
import AskYesNoDialog from "@/components/util/AskYesNoDialog";

const Directory = () => {
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    phone: "",
    email: "",
    groups: [],
  });
  const [error, setError] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    contactId: null,
    contactName: "",
  });
  const [isNewContact, setIsNewContact] = useState(false);

  // Load both contacts and groups from localStorage
  useEffect(() => {
    const savedContacts = JSON.parse(localStorage.getItem("contacts")) || [];
    const savedGroups = JSON.parse(localStorage.getItem("groups")) || [];
    setContacts(savedContacts);
    setGroups(savedGroups);
  }, []);

  // Save contacts to localStorage
  useEffect(() => {
    localStorage.setItem("contacts", JSON.stringify(contacts));
  }, [contacts]);

  // Save groups to localStorage
  useEffect(() => {
    localStorage.setItem("groups", JSON.stringify(groups));
  }, [groups]);

  const validateContact = (contact, contactId = null) => {
    if (!contact.name.trim()) {
      setError("Name is required");
      return false;
    }
    if (!contact.phone.trim()) {
      setError("Phone number is required");
      return false;
    }

    // Check for duplicate phone numbers
    const isDuplicatePhone = contacts.some(
      (c) => c.phone === contact.phone.trim() && c.id !== contactId
    );
    if (isDuplicatePhone) {
      setError("This phone number is already in use");
      return false;
    }

    return true;
  };

  const startEditing = (contact) => {
    setEditingId(contact.id);
    setEditForm({
      name: contact.name,
      phone: contact.phone,
      email: contact.email,
      groups: contact.groups,
    });
    setError("");
    setIsNewContact(false);
  };

  const cancelEditing = () => {
    if (isNewContact) {
      // Remove the newly created contact if canceling a new contact creation
      setContacts(contacts.filter((c) => c.id !== editingId));
    }
    setEditingId(null);
    setEditForm({
      name: "",
      phone: "",
      email: "",
      groups: [],
    });
    setError("");
    setIsNewContact(false);
  };

  const saveEdit = (id) => {
    if (!validateContact(editForm, id)) {
      return;
    }

    setContacts(
      contacts.map((contact) =>
        contact.id === id
          ? {
              ...contact,
              ...editForm,
            }
          : contact
      )
    );
    setEditingId(null);
    setError("");
  };

  const addNewContact = () => {
    const newContact = {
      id: Date.now(),
      name: "",
      phone: "",
      email: "",
      groups: [],
    };
    setContacts([...contacts, newContact]);
    startEditing(newContact);
    setIsNewContact(true);
  };

  const handleGroupChange = (editingId, selectedGroups) => {
    setEditForm({ ...editForm, groups: selectedGroups });

    // Add any new groups to the global groups list
    const newGroups = selectedGroups.filter(
      (group) => !groups.some((g) => g.value === group.value)
    );

    if (newGroups.length > 0) {
      setGroups([...groups, ...newGroups]);
    }
  };

  const createOption = (label) => ({
    label,
    value: label.toLowerCase().replace(/\W/g, ""),
  });

  const handleDeleteClick = (contact) => {
    setDeleteDialog({
      open: true,
      contactId: contact.id,
      contactName: contact.name,
    });
  };

  const handleDeleteConfirm = () => {
    setContacts(contacts.filter((c) => c.id !== deleteDialog.contactId));
    setDeleteDialog({
      open: false,
      contactId: null,
      contactName: "",
    });
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      contactId: null,
      contactName: "",
    });
  };

  const importContacts = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split("\n");
      const importedContacts = [];
      const errors = [];

      lines.slice(1).forEach((line, index) => {
        const [name, phone, email, groupsString] = line.split(",");
        const contactGroups = groupsString.split(";").map((group) => {
          const newGroup = createOption(group.trim());
          // Add to global groups if not exists
          if (!groups.some((g) => g.value === newGroup.value)) {
            setGroups((prevGroups) => [...prevGroups, newGroup]);
          }
          return newGroup;
        });

        const newContact = {
          id: Date.now() + Math.random(),
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          groups: contactGroups,
        };

        // Check for duplicate phone numbers in existing contacts and previously imported contacts
        const isDuplicatePhone =
          contacts.some((c) => c.phone === phone.trim()) ||
          importedContacts.some((c) => c.phone === phone.trim());

        if (isDuplicatePhone) {
          errors.push(
            `Line ${index + 2}: Duplicate phone number ${phone.trim()}`
          );
        } else {
          importedContacts.push(newContact);
        }
      });

      if (errors.length > 0) {
        setError(`Import errors:\n${errors.join("\n")}`);
      }

      if (importedContacts.length > 0) {
        setContacts([...contacts, ...importedContacts]);
      }
    };
    reader.readAsText(file);
  };

  const exportContacts = () => {
    const header = "Name,Phone,Email,Groups\n";
    const csv = contacts
      .map(
        (contact) =>
          `${contact.name},${contact.phone},${contact.email},${contact.groups
            .map((g) => g.label)
            .join(";")}`
      )
      .join("\n");
    const blob = new Blob([header + csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", "contacts.csv");
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const selectStyles = {
    control: (provided) => ({
      ...provided,
      minWidth: "200px",
      minHeight: "32px",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  return (
    <Paper sx={{ width: "100%", p: 3 }}>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5">Directory</Typography>
        <Box sx={{ display: "flex", gap: 2 }}>
          <input
            accept=".csv"
            style={{ display: "none" }}
            id="import-file"
            type="file"
            onChange={importContacts}
          />
          <label htmlFor="import-file">
            <Button
              variant="contained"
              component="span"
              startIcon={<FileUploadIcon />}
              size="small"
            >
              Import CSV
            </Button>
          </label>
          <Button
            variant="contained"
            startIcon={<FileDownloadIcon />}
            onClick={exportContacts}
            size="small"
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={addNewContact}
            size="small"
          >
            Add Contact
          </Button>
        </Box>
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Phone</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Groups</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {contacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  {editingId === contact.id ? (
                    <TextField
                      value={editForm.name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, name: e.target.value })
                      }
                      size="small"
                      fullWidth
                      error={error && error.includes("Name")}
                      required
                    />
                  ) : (
                    contact.name
                  )}
                </TableCell>
                <TableCell>
                  {editingId === contact.id ? (
                    <TextField
                      value={editForm.phone}
                      onChange={(e) =>
                        setEditForm({ ...editForm, phone: e.target.value })
                      }
                      size="small"
                      fullWidth
                      error={error && error.includes("Phone")}
                      required
                    />
                  ) : (
                    contact.phone
                  )}
                </TableCell>
                <TableCell>
                  {editingId === contact.id ? (
                    <TextField
                      value={editForm.email}
                      onChange={(e) =>
                        setEditForm({ ...editForm, email: e.target.value })
                      }
                      size="small"
                      fullWidth
                    />
                  ) : (
                    contact.email
                  )}
                </TableCell>
                <TableCell>
                  {editingId === contact.id ? (
                    <Creatable
                      isMulti
                      value={editForm.groups}
                      options={groups}
                      onChange={(newGroups) =>
                        handleGroupChange(contact.id, newGroups)
                      }
                      styles={selectStyles}
                      placeholder="Select or create groups"
                    />
                  ) : (
                    contact.groups.map((g) => g.label).join(", ")
                  )}
                </TableCell>
                <TableCell align="right">
                  {editingId === contact.id ? (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => saveEdit(contact.id)}
                        color="primary"
                      >
                        <SaveIcon />
                      </IconButton>
                      <IconButton size="small" onClick={cancelEditing}>
                        <CloseIcon />
                      </IconButton>
                    </Box>
                  ) : (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "flex-end",
                        gap: 1,
                      }}
                    >
                      <IconButton
                        size="small"
                        onClick={() => startEditing(contact)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDeleteClick(contact)}
                      >
                        <Delete />
                      </IconButton>
                    </Box>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <AskYesNoDialog
        open={deleteDialog.open}
        title="Confirm Delete"
        description={`Are you sure you want to delete ${
          deleteDialog.contactName || "this contact"
        }?`}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
        onClose={handleDeleteCancel}
      />
    </Paper>
  );
};

export default Directory;
