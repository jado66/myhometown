"use client";

import { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
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
  TableSortLabel,
  InputAdornment,
  Select,
  MenuItem,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Add as AddIcon,
  Delete,
  Search as SearchIcon,
} from "@mui/icons-material";
import { useUserContacts } from "@/hooks/useUserContacts";
import { supabase } from "@/util/supabase";
import AskYesNoDialog from "@/components/util/AskYesNoDialog";
import { useUser } from "@/hooks/use-user";

import ContactFormDialog from "./ContactFormDialog";
import JsonViewer from "@/components/util/debug/DebugOutput";

const Directory = () => {
  const { user } = useUser();

  const userId = user?.id;
  const userCommunities = user?.communities;
  const userCities = user?.cities;

  const {
    addContact,
    updateContact,
    deleteContact,
    contacts,
    loading,
    error: contactsError,
  } = useUserContacts(userId, userCommunities, userCities);

  const [error, setError] = useState(null);
  const [communities, setCommunities] = useState([]);
  const [cities, setCities] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    middle_name: "",
    last_name: "",
    phone: "",
    email: "",
    owner_id: "",
    owner_type: "user",
    visibility: true,
  });
  const [formDialog, setFormDialog] = useState({
    open: false,
    initialData: null,
  });
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    contactId: null,
    contactName: "",
  });
  const [orderBy, setOrderBy] = useState("last_name");
  const [order, setOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState([]);

  useEffect(() => {
    // fetchContacts();
    fetchCommunities();
    fetchCities();
  }, []);

  useEffect(() => {
    let filtered = [...contacts];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (contact) =>
          contact.first_name.toLowerCase().includes(query) ||
          contact.last_name.toLowerCase().includes(query) ||
          contact.email.toLowerCase().includes(query) ||
          contact.phone.includes(query)
      );
    }

    filtered.sort((a, b) => {
      const aValue = a[orderBy]?.toString().toLowerCase() ?? "";
      const bValue = b[orderBy]?.toString().toLowerCase() ?? "";

      if (order === "asc") {
        return aValue.localeCompare(bValue);
      }
      return bValue.localeCompare(aValue);
    });

    setFilteredContacts(filtered);
  }, [contacts, searchQuery, orderBy, order]);

  const fetchCommunities = async () => {
    const { data, error } = await supabase
      .from("communities")
      .select("id, name");

    if (error) {
      setError("Error fetching communities");
    } else {
      setCommunities(data);
    }
  };

  const fetchCities = async () => {
    const { data, error } = await supabase.from("cities").select("id, name");

    if (error) {
      setError("Error fetching cities");
    } else {
      setCities(data);
    }
  };

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const renderSortLabel = (property, label) => (
    <TableSortLabel
      active={orderBy === property}
      direction={orderBy === property ? order : "asc"}
      onClick={() => handleSort(property)}
    >
      {label}
    </TableSortLabel>
  );

  const handleOpenAddDialog = () => {
    setFormDialog({
      open: true,
      initialData: {
        owner_id: userId,
        owner_type: "user",
        visibility: true,
      },
    });
  };

  const handleOpenEditDialog = (contact) => {
    alert(JSON.stringify(contact));
    setFormDialog({
      open: true,
      initialData: { ...contact },
    });
  };

  const handleCloseFormDialog = () => {
    setFormDialog({
      open: false,
      initialData: null,
    });
    setError(null);
  };

  const handleSubmitForm = async (formData) => {
    try {
      if (formData.id) {
        // Editing existing contact
        const { error } = await updateContact(formData.id, formData);
        if (error) throw new Error(error);
      } else {
        // Adding new contact
        const { error } = await addContact(formData);
        if (error) throw new Error(error);
      }
      handleCloseFormDialog();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteClick = (contact) => {
    setDeleteDialog({
      open: true,
      contactId: contact.id,
      contactName: `${contact.first_name} ${contact.last_name}`,
    });
  };

  const handleDeleteConfirm = async () => {
    const { error } = await deleteContact(deleteDialog.contactId);
    if (error) {
      setError(`Error deleting contact: ${error}`);
    }
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

  if (loading) return <div>Loading contacts...</div>;
  if (error) return <div>Error loading contacts: {error.message}</div>;

  return (
    <Paper sx={{ width: "100%", p: 3 }}>
      {/* <JsonViewer data={formDialog} /> */}

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 3,
        }}
      >
        <Typography variant="h5">Directory</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenAddDialog}
          size="small"
        >
          Add Contact
        </Button>
      </Box>

      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          size="small"
          placeholder="Search contacts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
        />
      </Box>

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                {renderSortLabel("first_name", "First Name")}
              </TableCell>
              <TableCell>{renderSortLabel("last_name", "Last Name")}</TableCell>
              <TableCell>{renderSortLabel("phone", "Phone")}</TableCell>
              <TableCell>{renderSortLabel("email", "Email")}</TableCell>
              <TableCell>
                {renderSortLabel("owner_type", "Owner Type")}
              </TableCell>
              <TableCell>
                {renderSortLabel("visibility", "Visibility")}
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  {editingId === contact.id ? (
                    <TextField
                      value={editForm.first_name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, first_name: e.target.value })
                      }
                      size="small"
                      fullWidth
                    />
                  ) : (
                    contact.first_name
                  )}
                </TableCell>
                <TableCell>
                  {editingId === contact.id ? (
                    <TextField
                      value={editForm.last_name}
                      onChange={(e) =>
                        setEditForm({ ...editForm, last_name: e.target.value })
                      }
                      size="small"
                      fullWidth
                    />
                  ) : (
                    contact.last_name
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
                    <Select
                      value={editForm.owner_type}
                      onChange={(e) =>
                        setEditForm({ ...editForm, owner_type: e.target.value })
                      }
                      size="small"
                      fullWidth
                    >
                      <MenuItem value="user">User</MenuItem>
                      <MenuItem value="community">Community</MenuItem>
                      <MenuItem value="city">City</MenuItem>
                    </Select>
                  ) : (
                    contact.owner_type
                  )}
                </TableCell>
                <TableCell>
                  {editingId === contact.id ? (
                    <Select
                      value={editForm.visibility}
                      onChange={(e) =>
                        setEditForm({ ...editForm, visibility: e.target.value })
                      }
                      size="small"
                      fullWidth
                    >
                      <MenuItem value={true}>Visible</MenuItem>
                      <MenuItem value={false}>Hidden</MenuItem>
                    </Select>
                  ) : contact.visibility ? (
                    "Visible"
                  ) : (
                    "Hidden"
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
                        onClick={() => handleOpenEditDialog(contact)}
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
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      <ContactFormDialog
        open={formDialog.open}
        onClose={handleCloseFormDialog}
        onSubmit={handleSubmitForm}
        initialData={formDialog.initialData}
      />

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
