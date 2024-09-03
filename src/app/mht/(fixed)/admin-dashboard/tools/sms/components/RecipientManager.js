import { useState, useRef } from "react";
import {
  Box,
  Button,
  Chip,
  TextField,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
} from "@mui/material";
import { CloudUpload, CloudDownload, Delete, Add } from "@mui/icons-material";

export default function RecipientManager({
  recipients,
  setRecipients,
  selectedRecipients,
  setSelectedRecipients,
}) {
  const [newRecipient, setNewRecipient] = useState({ name: "", phone: "" });
  const fileInputRef = useRef(null);

  const addRecipient = () => {
    if (newRecipient.name && newRecipient.phone) {
      const newId = Math.random().toString(36).substr(2, 9);
      setRecipients([...recipients, { ...newRecipient, id: newId }]);
      setNewRecipient({ name: "", phone: "" });
    }
  };

  const removeRecipient = (id) => {
    setRecipients(recipients.filter((r) => r.id !== id));
    setSelectedRecipients(selectedRecipients.filter((r) => r.id !== id));
  };

  const toggleRecipient = (recipient) => {
    setSelectedRecipients(
      selectedRecipients.find((r) => r.id === recipient.id)
        ? selectedRecipients.filter((r) => r.id !== recipient.id)
        : [...selectedRecipients, recipient]
    );
  };

  const importRecipients = (event) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result;
        const importedRecipients = content.split("\n").map((line) => {
          const [name, phone] = line.split(",");
          return {
            id: Math.random().toString(36).substr(2, 9),
            name: name.trim(),
            phone: phone.trim(),
          };
        });
        setRecipients([...recipients, ...importedRecipients]);
      };
      reader.readAsText(file);
    }
  };

  const exportRecipients = () => {
    const content = recipients.map((r) => `${r.name},${r.phone}`).join("\n");
    const blob = new Blob([content], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "recipients.csv";
    link.click();
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Manage Recipients
      </Typography>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <TextField
            label="Name"
            value={newRecipient.name}
            onChange={(e) =>
              setNewRecipient({ ...newRecipient, name: e.target.value })
            }
          />
          <TextField
            label="Phone"
            value={newRecipient.phone}
            onChange={(e) =>
              setNewRecipient({ ...newRecipient, phone: e.target.value })
            }
          />
          <Button
            variant="contained"
            onClick={addRecipient}
            startIcon={<Add />}
          >
            Add
          </Button>
        </Box>
        <Box sx={{ display: "flex", gap: 2 }}>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: "none" }}
            onChange={importRecipients}
            accept=".csv"
          />
          <Button
            variant="outlined"
            onClick={() => fileInputRef.current?.click()}
            startIcon={<CloudUpload />}
          >
            Import
          </Button>
          <Button
            variant="outlined"
            onClick={exportRecipients}
            startIcon={<CloudDownload />}
          >
            Export
          </Button>
        </Box>
      </Paper>
      <Paper elevation={3} sx={{ p: 2, mb: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Recipient List
        </Typography>
        <List>
          {recipients.map((recipient) => (
            <ListItem
              key={recipient.id}
              onClick={() => toggleRecipient(recipient)}
              sx={{ cursor: "pointer", "&:hover": { bgcolor: "action.hover" } }}
            >
              <ListItemText
                primary={recipient.name}
                secondary={recipient.phone}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => removeRecipient(recipient.id)}
                >
                  <Delete />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Paper>
      <Paper elevation={3} sx={{ p: 2 }}>
        <Typography variant="subtitle1" gutterBottom>
          Selected Recipients
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {selectedRecipients.map((recipient) => (
            <Chip
              key={recipient.id}
              label={`${recipient.name} (${recipient.phone})`}
              onDelete={() => toggleRecipient(recipient)}
            />
          ))}
        </Box>
      </Paper>
    </Box>
  );
}
