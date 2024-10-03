import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
} from "@mui/material";
import {
  Delete,
  Add,
  Edit,
  FileUpload,
  FileDownload,
} from "@mui/icons-material";
import Creatable from "react-select/creatable";

const Directory = () => {
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [newContact, setNewContact] = useState({
    name: "",
    phone: "",
    email: "",
    groups: [],
  });
  const [editingContact, setEditingContact] = useState(null);

  useEffect(() => {
    const savedContacts = JSON.parse(localStorage.getItem("contacts")) || [];
    const savedGroups = JSON.parse(localStorage.getItem("groups")) || [];
    setContacts(savedContacts);
    setGroups(savedGroups);
  }, []);

  useEffect(() => {
    localStorage.setItem("contacts", JSON.stringify(contacts));
  }, [contacts]);

  useEffect(() => {
    localStorage.setItem("groups", JSON.stringify(groups));
  }, [groups]);

  const addOrUpdateContact = () => {
    if (editingContact) {
      setContacts(
        contacts.map((c) =>
          c.id === editingContact.id
            ? { ...newContact, id: editingContact.id }
            : c
        )
      );
      setEditingContact(null);
    } else {
      setContacts([...contacts, { ...newContact, id: Date.now() }]);
    }
    setNewContact({ name: "", phone: "", email: "", groups: [] });
  };

  const removeContact = (id) => {
    setContacts(contacts.filter((c) => c.id !== id));
  };

  const editContact = (contact) => {
    setEditingContact(contact);
    setNewContact({ ...contact });
  };

  const handleGroupChange = (selectedGroups) => {
    setNewContact({ ...newContact, groups: selectedGroups });
  };

  const createOption = (label) => ({
    label,
    value: label.toLowerCase().replace(/\W/g, ""),
  });

  const handleCreateGroup = (inputValue) => {
    const newGroup = createOption(inputValue);
    setGroups([...groups, newGroup]);
    setNewContact({ ...newContact, groups: [...newContact.groups, newGroup] });
  };

  const importContacts = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split("\n");
      const importedContacts = lines.slice(1).map((line) => {
        const [name, phone, email, groupsString] = line.split(",");
        return {
          id: Date.now() + Math.random(),
          name: name.trim(),
          phone: phone.trim(),
          email: email.trim(),
          groups: groupsString
            .split(";")
            .map((group) => createOption(group.trim())),
        };
      });
      setContacts([...contacts, ...importedContacts]);
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
      height: "56px", // Match Material-UI TextField height
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999, // Ensure dropdown appears above other elements
    }),
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <Typography variant="h4" gutterBottom>
        Directory
      </Typography>
      <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
        <TextField
          label="Name"
          value={newContact.name}
          onChange={(e) =>
            setNewContact({ ...newContact, name: e.target.value })
          }
        />
        <TextField
          label="Phone"
          value={newContact.phone}
          onChange={(e) =>
            setNewContact({ ...newContact, phone: e.target.value })
          }
        />
        <TextField
          label="Email"
          value={newContact.email}
          onChange={(e) =>
            setNewContact({ ...newContact, email: e.target.value })
          }
        />
        <Creatable
          isMulti
          options={groups}
          value={newContact.groups}
          onChange={handleGroupChange}
          onCreateOption={handleCreateGroup}
          placeholder="Select or create groups"
          styles={selectStyles}
        />
        <Button
          variant="contained"
          onClick={addOrUpdateContact}
          startIcon={editingContact ? <Edit /> : <Add />}
        >
          {editingContact ? "Update" : "Add"}
        </Button>
      </Box>
      <Paper elevation={3} sx={{ p: 2, flexGrow: 1, overflow: "auto" }}>
        <Typography variant="h6" gutterBottom>
          Contacts
        </Typography>
        <List>
          {contacts.map((contact) => (
            <ListItem key={contact.id}>
              <ListItemText
                primary={contact.name}
                secondary={`${contact.phone} | ${
                  contact.email
                } | Groups: ${contact.groups.map((g) => g.label).join(", ")}`}
              />
              <ListItemSecondaryAction>
                <IconButton edge="end" onClick={() => editContact(contact)}>
                  <Edit />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => removeContact(contact.id)}
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
      <Box sx={{ mt: 3 }}>
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
            startIcon={<FileUpload />}
            sx={{ mr: 2 }}
          >
            Import CSV
          </Button>
        </label>
        <Button
          variant="contained"
          onClick={exportContacts}
          startIcon={<FileDownload />}
        >
          Export CSV
        </Button>
      </Box>
    </Box>
  );
};

export default Directory;
