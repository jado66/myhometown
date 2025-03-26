import React, { useState, useEffect, useMemo } from "react";
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
import JsonViewer from "@/components/util/debug/DebugOutput";

const ContactsManagement = ({ userId, userCommunities, userCities }) => {
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
    userCommunities.map((c) => c.id),
    userCities.map((c) => c.id)
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
  const [deleteDialog, setDeleteDialog] = useState({
    open: false,
    contactId: null,
    contactName: "",
  });
  const [isNewContact, setIsNewContact] = useState(false);

  // State for groups (extracted from contacts)
  const [groups, setGroups] = useState([]);

  // Add state for sorting and searching
  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState([]);

  // Extract unique groups from contacts
  useEffect(() => {
    const uniqueGroups = new Set();

    if (!contacts || !contacts.length) return;

    contacts.forEach((contact) => {
      let parsedGroups = contact.groups;

      // Handle case where groups is a JSON string
      if (typeof contact.groups === "string") {
        try {
          parsedGroups = JSON.parse(contact.groups);
        } catch (error) {
          console.error("Failed to parse groups:", error);
          parsedGroups = [];
        }
      }

      // Process groups regardless of format
      if (parsedGroups && Array.isArray(parsedGroups)) {
        parsedGroups.forEach((group) => {
          // Handle both string format and object format
          if (typeof group === "string") {
            uniqueGroups.add(group);
          } else if (group && group.value) {
            // Legacy object format - extract just the value
            uniqueGroups.add(group.value);
          }
        });
      }
    });

    // Convert Set to array of strings
    const groupsArray = Array.from(uniqueGroups);
    setGroups(groupsArray);
  }, [contacts]);

  // Filter and sort contacts
  useEffect(() => {
    if (!contacts || !contacts.length) return;

    let filtered = [...contacts];

    // Apply search filter
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
          (contact.groups &&
            contact.groups.some((g) => g.label.toLowerCase().includes(query)))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[orderBy]?.toString().toLowerCase() ?? "";
      let bValue = b[orderBy]?.toString().toLowerCase() ?? "";

      // Special handling for groups
      if (orderBy === "groups") {
        aValue = a.groups
          ? a.groups
              .map((g) => g.label)
              .join(", ")
              .toLowerCase()
          : "";
        bValue = b.groups
          ? b.groups
              .map((g) => g.label)
              .join(", ")
              .toLowerCase()
          : "";
      }

      if (order === "asc") {
        return aValue.localeCompare(bValue);
      }
      return bValue.localeCompare(aValue);
    });

    setFilteredContacts(filtered);
  }, [contacts, searchQuery, orderBy, order]);

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
    setEditingId(contact.id);
    setEditForm(contact);

    setIsNewContact(false);
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

  const addNewContact = () => {
    // Generate a temporary ID for the new contact
    const tempId = "temp-" + Date.now();

    // Set editingId to the temporary ID
    setEditingId(tempId);

    // Reset form values for the new contact
    resetEditForm();

    // Set isNewContact flag to true
    setIsNewContact(true);

    // Add temporary contact to filteredContacts for immediate display
    setFilteredContacts((prev) => [
      {
        id: tempId,
        first_name: "",
        last_name: "",
        middle_name: "",
        email: "",
        phone: "",

        owner_type: "user",
        owner_id: userId,
        groups: [],
      },
      ...prev,
    ]);
  };

  const handleGroupChange = (selectedGroups) => {
    setEditForm({ ...editForm, groups: selectedGroups });
  };

  const handleDeleteClick = (contact) => {
    setDeleteDialog({
      open: true,
      contactId: contact.id,
      contactName: contact.name,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      const { error } = await deleteContact(deleteDialog.contactId);
      if (error) {
        setFormError(error);
      } else {
        // No need to manually update state, refreshContacts will handle it
      }
    } catch (err) {
      setFormError(err.message);
    } finally {
      setDeleteDialog({
        open: false,
        contactId: null,
        contactName: "",
      });
    }
  };

  const handleDeleteCancel = () => {
    setDeleteDialog({
      open: false,
      contactId: null,
      contactName: "",
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
    handleDeleteClick,
    startEditing,
    handleSort,
    formError,
    userId,
    groups,
    isNewContact,
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
        {/* <JsonViewer data={{ contacts }} /> */}

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
      {/* API Error */}

      {/* Form Error */}
      {formError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {formError}
        </Alert>
      )}

      {/* User Contacts */}
      <Typography variant="h6">Personal Contacts</Typography>
      <ContactsTable
        {...ContactsTableProps}
        filteredContacts={contacts.userContacts}
        tableName="Personal Contacts"
        canAddNew
      />

      {/* Community Contacts */}
      {userCommunities.map((community) => (
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
      {userCities.map((city) => (
        <Box key={city.id} sx={{ mt: 4 }}>
          <Typography variant="h6">{city.name} Contacts</Typography>
          <ContactsTable
            filteredContacts={contacts.cityContacts[city.id] || []}
            {...ContactsTableProps}
            tableName={city.name}
          />
        </Box>
      ))}
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

export default ContactsManagement;

// const selectStyles = {
//   control: (provided, state) => ({
//     ...provided,
//     minWidth: "200px",
//     minHeight: "32px",
//     borderColor: state.isFocused ? "#318D43" : provided.borderColor,
//     boxShadow: state.isFocused ? `0 0 0 1px #318D43` : provided.boxShadow,
//     "&:hover": {
//       borderColor: "#318D43",
//     },
//   }),
//   menu: (provided) => ({
//     ...provided,
//     position: "absolute",
//     width: "100%",
//     zIndex: 9999,
//     marginTop: 0,
//     backgroundColor: "white",
//     border: "1px solid #e2e8f0",
//     borderRadius: "6px",
//     boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
//     overflow: "hidden",
//   }),
//   menuList: (provided) => ({
//     ...provided,
//     padding: "4px",
//     fontSize: "14px",
//   }),
//   option: (provided, { isFocused, isSelected }) => ({
//     ...provided,
//     fontSize: "14px",
//     backgroundColor: isFocused ? "#f7fafc" : isSelected ? "#e2e8f0" : "white",
//     color: "#2d3748",
//     padding: "8px",
//     "&:active": {
//       backgroundColor: "#e2e8f0",
//     },
//   }),
//   menuPortal: (provided) => ({
//     ...provided,
//     zIndex: 9999,
//   }),
// };

// const selectComponents = {
//   MenuList: ({ children, ...props }) => (
//     <components.MenuList
//       {...props}
//       style={{
//         padding: "4px",
//         fontSize: "14px",
//       }}
//     >
//       {React.Children.toArray(children).reverse()}
//     </components.MenuList>
//   ),
//   Menu: ({ children, ...props }) => {
//     const { options, createOption } = props.selectProps;
//     return (
//       <components.Menu
//         {...props}
//         style={{
//           backgroundColor: "white",
//           border: "1px solid #e2e8f0",
//           borderRadius: "6px",
//           boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
//           overflow: "hidden",
//         }}
//       >
//         {createOption && (
//           <div
//             style={{
//               padding: "4px 8px",
//               borderBottom: "1px solid #e2e8f0",
//               fontSize: "14px",
//             }}
//           >
//             {createOption}
//           </div>
//         )}
//         {children}
//       </components.Menu>
//     );
//   },
// };
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

const exportContacts = (filteredContacts) => {
  const header = "Name,Email,Phone,Website,Groups\n";
  const csv = filteredContacts
    .map(
      (contact) =>
        `${contact.name || ""},${contact.email || ""},${contact.phone || ""},${
          contact.website || ""
        },${contact.groups ? contact.groups.map((g) => g.label).join(";") : ""}`
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

const normalizeHeader = (header) => {
  // Remove special characters and spaces, convert to lowercase
  const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, "");

  // Map various possible header names to standard format
  const headerMap = {
    firstname: "first_name",
    lastname: "last_name",
    middlename: "middle_name",
    contactname: "name",
    email: "email",
    emailaddress: "email",
    mail: "email",
    phone: "phone",
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

  return headerMap[normalized] || normalized;
};

const createOption = (label) => ({
  label,
  value: label.toLowerCase().replace(/\W/g, ""),
});

const importContacts = (event, addContact, setFormError, refreshContacts) => {
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
      if (!["name", "email", "phone", "groups"].includes(normalized)) {
        errors.push(`Unknown column header: ${header.trim()}`);
      }
      return normalized;
    });

    // Check for required headers
    const requiredHeaders = ["name", "phone"];
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
          contact.groups = groupsArray.map((group) =>
            createOption(group.trim())
          );
        } else if (header === "phone") {
          contact[header] = formatPhoneNumber(values[j]);
        } else {
          contact[header] = values[j];
        }
      });

      // Validate the contact
      if (!contact.name || !contact.phone) {
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
