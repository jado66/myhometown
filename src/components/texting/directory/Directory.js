import React, { useState, useEffect } from "react";
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import {
  Add as AddIcon,
  FileUpload as FileUploadIcon,
  FileDownload as FileDownloadIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
} from "@mui/icons-material";

import AskYesNoDialog from "@/components/util/AskYesNoDialog";
import { useUserContacts } from "@/hooks/useUserContacts";

import { ContactsTable } from "./ContactsTable";
import ContactDialog from "./ContactDialog"; // Import the new dialog component
import JsonViewer from "@/components/util/debug/DebugOutput";

const ContactsManagement = ({ user, userCommunities, userCities }) => {
  const userId = user?.id || null;
  const {
    contacts,
    loading,
    error,
    addContact,
    updateContact,
    deleteContact,
    moveContact,
    refreshContacts,
  } = useUserContacts(
    userId,
    (userCommunities || []).map((c) => c.id),
    (userCities || []).map((c) => c.id)
  );

  // Local state
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    first_name: "",
    last_name: "",
    middle_name: "",
    email: "",
    phone: "",
    owner_type: "user",
    owner_id: userId,
    groups: [],
  });
  const [formError, setFormError] = useState("");
  const [bulkDeleteDialog, setBulkDeleteDialog] = useState({
    open: false,
    contactIds: [],
    count: 0,
  });
  const [isNewContact, setIsNewContact] = useState(false);

  // New states for the dialog
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingContact, setEditingContact] = useState(null);

  // State for groups (extracted from contacts)
  const [groups, setGroups] = useState([]);

  // Add state for sorting and searching
  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [isLoading, setLoading] = useState(false);

  // Extract unique groups from contacts
  useEffect(() => {
    if (!contacts) return;

    const uniqueGroups = new Set();

    // Helper to process contacts from any collection
    const processContacts = (contactsArray) => {
      if (!Array.isArray(contactsArray)) return;

      contactsArray.forEach((contact) => {
        if (!contact) return;

        // Parse groups using our helper function
        const parsedGroups = parseGroups(contact.groups);

        // Add each group to our Set
        parsedGroups.forEach((group) => {
          if (typeof group === "string") {
            uniqueGroups.add(group);
          } else if (group && group.value) {
            uniqueGroups.add(group.value);
          }
        });
      });
    };

    // Process user contacts
    if (contacts.userContacts) {
      processContacts(contacts.userContacts);
    }

    // Process community contacts (iterate through each community)
    if (contacts.communityContacts) {
      Object.entries(contacts.communityContacts).forEach(
        ([communityId, communityContacts]) => {
          processContacts(communityContacts);
        }
      );
    }

    // Process city contacts (iterate through each city)
    if (contacts.cityContacts) {
      Object.entries(contacts.cityContacts).forEach(
        ([cityId, cityContacts]) => {
          processContacts(cityContacts);
        }
      );
    }

    // Convert Set to array of strings
    const groupsArray = Array.from(uniqueGroups);
    setGroups(groupsArray);
  }, [contacts]);

  // Filter and sort contacts - we'll use this only for global search
  useEffect(() => {
    if (!contacts || !contacts.userContacts) {
      setFilteredContacts([]);
      return;
    }

    // For global search, we collect all contacts from all sources
    let allContacts = [];

    // Add user contacts
    if (Array.isArray(contacts.userContacts)) {
      allContacts = [...allContacts, ...contacts.userContacts];
    }

    // Add community contacts
    if (contacts.communityContacts) {
      Object.values(contacts.communityContacts).forEach((communityContacts) => {
        if (Array.isArray(communityContacts)) {
          allContacts = [...allContacts, ...communityContacts];
        }
      });
    }

    // Add city contacts
    if (contacts.cityContacts) {
      Object.values(contacts.cityContacts).forEach((cityContacts) => {
        if (Array.isArray(cityContacts)) {
          allContacts = [...allContacts, ...cityContacts];
        }
      });
    }

    // Apply global search filter if needed
    let filtered = allContacts;
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (contact) =>
          (contact.first_name &&
            contact.first_name.toLowerCase().includes(query)) ||
          (contact.last_name &&
            contact.last_name.toLowerCase().includes(query)) ||
          (contact.middle_name &&
            contact.middle_name.toLowerCase().includes(query)) ||
          (contact.email && contact.email.toLowerCase().includes(query)) ||
          (contact.phone && contact.phone.includes(query)) ||
          // Search in groups
          (() => {
            const parsedGroups = parseGroups(contact.groups);
            return parsedGroups.some(
              (g) =>
                (typeof g === "string" && g.toLowerCase().includes(query)) ||
                (g?.label && g.label.toLowerCase().includes(query))
            );
          })()
      );
    }

    setFilteredContacts(filtered);
  }, [contacts, searchQuery]);

  const handleSort = (property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const validateContact = (contact) => {
    if (!contact.first_name.trim()) {
      setFormError("First name is required");
      return false;
    }

    if (!contact.last_name.trim()) {
      setFormError("Last name is required");
      return false;
    }

    if (!contact.phone.trim()) {
      setFormError("Phone number is required");
      return false;
    }

    return true;
  };

  const resetEditForm = () => {
    setEditForm({
      first_name: "",
      last_name: "",
      middle_name: "",
      email: "",
      phone: "",
      owner_type: "user",
      owner_id: userId,
      groups: [],
    });
    setFormError("");
  };

  const startEditing = (contact) => {
    // Instead of inline editing, open the dialog
    setEditingContact(contact);
    setDialogOpen(true);
  };

  const cancelEditing = () => {
    setEditingId(null);
    resetEditForm();
    setIsNewContact(false);
  };

  const saveEdit = async (id) => {
    if (!validateContact(editForm)) {
      return;
    }

    try {
      if (isNewContact) {
        const { data, error } = await addContact(editForm);
        if (error) {
          setFormError(error);
          return;
        }
      } else {
        const { data, error } = await updateContact(id, editForm);
        if (error) {
          setFormError(error);
          return;
        }
      }

      // Refresh contacts to get updated data
      refreshContacts();
      setEditingId(null);
      setFormError("");
      setIsNewContact(false);
    } catch (err) {
      setFormError(err.message);
    }
  };

  // New function to open the add contact dialog
  const openAddContactDialog = () => {
    setEditingContact(null);
    setDialogOpen(true);
  };

  // Handle dialog close
  const handleDialogClose = () => {
    setDialogOpen(false);
    setEditingContact(null);
  };

  // Handle save from dialog
  const handleDialogSave = async (contactData) => {
    try {
      setLoading(true);

      if (editingContact) {
        // Update existing contact
        const { error } = await updateContact(editingContact.id, contactData);
        if (error) {
          setFormError(error);
          return;
        }
      } else {
        // Add new contact
        const { error } = await addContact(contactData);
        if (error) {
          setFormError(error);
          return;
        }
      }

      // Success - close dialog and refresh
      setDialogOpen(false);
      setEditingContact(null);
      refreshContacts();
      setFormError("");
    } catch (err) {
      setFormError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleGroupChange = (selectedGroups) => {
    setEditForm({ ...editForm, groups: selectedGroups });
  };

  const handleBulkDeleteClick = (contactIds) => {
    setBulkDeleteDialog({
      open: true,
      contactIds: contactIds,
      count: contactIds.length,
    });
  };

  const handleBulkDeleteConfirm = async () => {
    try {
      const contactIds = bulkDeleteDialog.contactIds;

      // Show loading indicator
      setLoading(true);

      // Delete each contact
      for (const id of contactIds) {
        await deleteContact(id);
      }

      // Refresh contacts to update the view
      refreshContacts();
    } catch (err) {
      setFormError("Error during bulk deletion: " + err.message);
    } finally {
      // Close dialog and reset state
      setBulkDeleteDialog({
        open: false,
        contactIds: [],
        count: 0,
      });
      setLoading(false);
    }
  };

  const handleBulkDeleteCancel = () => {
    setBulkDeleteDialog({
      open: false,
      contactIds: [],
      count: 0,
    });
  };

  // Display a message if the user doesn't have the necessary permissions
  if (!userId) {
    return (
      <Paper sx={{ width: "100%", p: 3 }}>
        <Typography variant="h5">Directory</Typography>
        <Alert severity="info" sx={{ mt: 2 }}>
          Please log in to view and manage contacts.
        </Alert>
      </Paper>
    );
  }

  const handleImportContact = async (event) => {
    await importContacts(
      event,
      addContact,
      setFormError,
      refreshContacts,
      userId
    );
  };

  const ContactsTableProps = {
    moveContact,
    userCommunities,
    userCities,
    editingId,
    editForm,
    orderBy,
    order,
    saveEdit,
    cancelEditing,
    setEditForm,
    handleGroupChange,
    startEditing,
    handleSort,
    formError,
    userId,
    groups,
    isNewContact,
    handleBulkDeleteClick,
    user,
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
            onChange={handleImportContact}
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
            onClick={() => exportContacts(filteredContacts)}
            size="small"
          >
            Export CSV
          </Button>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openAddContactDialog}
            size="small"
          >
            Add Contact
          </Button>
          <Button
            variant="contained"
            startIcon={<RefreshIcon />}
            onClick={refreshContacts}
            size="small"
          >
            Refresh
          </Button>
        </Box>
      </Box>

      {/* Add Search Box */}
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

      {/* Loading state */}
      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Form Error */}
      {formError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formError}
        </Alert>
      )}

      {/* User Contacts */}
      <Typography variant="h6">
        {user.isAdmin ? "Personal Contacts" : "Unassigned Contacts"}
      </Typography>

      <ContactsTable
        {...ContactsTableProps}
        filteredContacts={contacts.userContacts}
        tableName="Unassigned Contacts"
        canAddNew
      />

      {/* Community Contacts */}
      {userCommunities &&
        userCommunities.map((community) => (
          <Box key={community.id} sx={{ mt: 4 }}>
            <Typography variant="h6">{community.name} Contacts</Typography>
            <ContactsTable
              filteredContacts={contacts.communityContacts[community.id] || []}
              {...ContactsTableProps}
              tableName={community.name}
            />
          </Box>
        ))}

      {/* City Contacts */}
      {userCities &&
        userCities.map((city) => (
          <Box key={city.id} sx={{ mt: 4 }}>
            <Typography variant="h6">{city.name} Contacts</Typography>
            <ContactsTable
              filteredContacts={contacts.cityContacts[city.id] || []}
              {...ContactsTableProps}
              tableName={city.name}
            />
          </Box>
        ))}

      {/* Contact Add/Edit Dialog */}
      <ContactDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
        contact={editingContact}
        userId={userId}
        userCommunities={userCommunities}
        userCities={userCities}
        groups={groups}
        user={user}
        title={editingContact ? "Edit Contact" : "Add Contact"}
      />

      {/* Bulk Delete Confirmation Dialog */}
      <AskYesNoDialog
        open={bulkDeleteDialog.open}
        title="Confirm Bulk Delete"
        description={`Are you sure you want to delete ${bulkDeleteDialog.count} contacts?`}
        onConfirm={handleBulkDeleteConfirm}
        onCancel={handleBulkDeleteCancel}
        onClose={handleBulkDeleteCancel}
      />
    </Paper>
  );
};

export default ContactsManagement;

// Helper function for formatting phone numbers
const formatPhoneNumber = (phone) => {
  // Remove all non-numeric characters
  const cleaned = phone.replace(/\D/g, "");

  // Check if it's a valid length (assuming US numbers for this example)
  if (cleaned.length < 10) return cleaned;

  // Format as (XXX) XXX-XXXX if 10 digits
  if (cleaned.length === 10) {
    return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(
      6
    )}`;
  }

  // If longer than 10 digits, keep original formatting
  return cleaned;
};

// Helper function for exporting contacts to CSV
const exportContacts = (contacts) => {
  const header = "First Name,Middle Name,Last Name,Email,Phone,Groups\n";
  const csv = contacts
    .map(
      (contact) =>
        `${contact.first_name || ""},${contact.middle_name || ""},${
          contact.last_name || ""
        },${contact.email || ""},${contact.phone || ""},${
          Array.isArray(contact.groups)
            ? contact.groups.join(";")
            : typeof contact.groups === "string"
            ? contact.groups
            : ""
        }`
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

// Helper function for normalizing CSV header names
const normalizeHeader = (header) => {
  // Remove special characters and spaces, convert to lowercase
  const normalized = header.toLowerCase().trim();

  // Map various possible header names to standard format
  const headerMap = {
    "first name": "first_name",
    firstname: "first_name",
    "last name": "last_name",
    lastname: "last_name",
    "middle name": "middle_name",
    middlename: "middle_name",
    "contact name": "name",
    contactname: "name",
    email: "email",
    "email address": "email",
    emailaddress: "email",
    mail: "email",
    phone: "phone",
    "phone number": "phone",
    phonenumber: "phone",
    telephone: "phone",
    tel: "phone",
    mobile: "phone",
    group: "groups",
    groups: "groups",
    category: "groups",
    categories: "groups",
    tags: "groups",
  };

  return headerMap[normalized] || normalized.replace(/[^a-z0-9]/g, "");
};

// Function to import contacts from CSV
const importContacts = async (
  event,
  addContact,
  setFormError,
  refreshContacts,
  userId
) => {
  const file = event.target.files[0];
  const reader = new FileReader();

  reader.onload = async (e) => {
    const content = e.target.result;
    const lines = content.split("\n").filter((line) => line.trim());
    const errors = [];
    const importedContacts = [];

    // Get and normalize headers
    const headers = lines[0].split(",").map((header) => {
      const normalized = normalizeHeader(header.trim());
      if (
        ![
          "first_name",
          "last_name",
          "email",
          "phone",
          "groups",
          "middle_name",
        ].includes(normalized)
      ) {
        errors.push(`Unknown column header: ${header.trim()}`);
      }
      return normalized;
    });

    // Check for required headers
    const requiredHeaders = ["first_name", "last_name", "phone"];
    const missingHeaders = requiredHeaders.filter(
      (header) => !headers.includes(header)
    );
    if (missingHeaders.length > 0) {
      setFormError(`Missing required columns: ${missingHeaders.join(", ")}`);
      return;
    }

    // Process each line
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i];
      const values = line.split(",").map((val) => val.trim());
      if (values.length !== headers.length) {
        errors.push(`Line ${i + 1}: Invalid number of columns`);
        continue;
      }

      // Create contact object using header mapping
      const contact = {
        first_name: "",
        last_name: "",
        middle_name: "",
        email: "",
        phone: "",
        owner_type: "user",
        owner_id: userId,
        groups: [],
      };

      // Map values to correct fields
      headers.forEach((header, j) => {
        if (header === "groups") {
          const groupsArray = values[j].split(";").filter(Boolean);
          contact.groups = groupsArray.map((group) => group.trim());
        } else if (header === "phone") {
          contact[header] = formatPhoneNumber(values[j]);
        } else {
          contact[header] = values[j];
        }
      });

      // Validate the contact
      if (!contact.first_name || !contact.last_name || !contact.phone) {
        errors.push(`Line ${i + 1}: Missing required fields`);
        continue;
      }

      try {
        // Add contact through the API
        const { data, error } = await addContact(contact);
        if (error) {
          errors.push(`Line ${i + 1}: ${error}`);
        } else {
          importedContacts.push(data);
        }
      } catch (err) {
        errors.push(`Line ${i + 1}: ${err.message}`);
      }
    }

    if (errors.length > 0) {
      setFormError(`Import errors:\n${errors.join("\n")}`);
    }

    // Refresh contacts after import
    if (importedContacts.length > 0) {
      refreshContacts();
    }
  };

  reader.readAsText(file);
};

const parseGroups = (groupsData) => {
  if (!groupsData) return [];

  // If already an array, return it
  if (Array.isArray(groupsData)) return groupsData;

  // If it's a string, try to parse it as JSON
  if (typeof groupsData === "string") {
    try {
      return JSON.parse(groupsData);
    } catch (error) {
      console.error("Failed to parse groups:", error);
      return [];
    }
  }

  return [];
};
