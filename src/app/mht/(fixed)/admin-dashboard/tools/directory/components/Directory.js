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
  TableSortLabel,
  InputAdornment,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Add as AddIcon,
  FileUpload as FileUploadIcon,
  FileDownload as FileDownloadIcon,
  Delete,
  Search as SearchIcon,
} from "@mui/icons-material";
import Creatable from "react-select/creatable";
import { components } from "react-select";
import AskYesNoDialog from "@/components/util/AskYesNoDialog";

const Directory = () => {
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
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

  // Add new state for sorting and searching
  const [orderBy, setOrderBy] = useState("lastName");
  const [order, setOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState([]);

  // Existing useEffects for localStorage...

  // Add new useEffect for filtering and sorting contacts
  useEffect(() => {
    let filtered = [...contacts];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (contact) =>
          contact.firstName.toLowerCase().includes(query) ||
          contact.lastName.toLowerCase().includes(query) ||
          contact.email.toLowerCase().includes(query) ||
          contact.phone.includes(query) ||
          contact.groups.some((g) => g.label.toLowerCase().includes(query))
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      let aValue = a[orderBy]?.toString().toLowerCase() ?? "";
      let bValue = b[orderBy]?.toString().toLowerCase() ?? "";

      // Special handling for groups
      if (orderBy === "groups") {
        aValue = a.groups
          .map((g) => g.label)
          .join(", ")
          .toLowerCase();
        bValue = b.groups
          .map((g) => g.label)
          .join(", ")
          .toLowerCase();
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

  const renderSortLabel = (property, label) => (
    <TableSortLabel
      active={orderBy === property}
      direction={orderBy === property ? order : "asc"}
      onClick={() => handleSort(property)}
    >
      {label}
    </TableSortLabel>
  );

  const importContacts = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();

    reader.onload = (e) => {
      const content = e.target.result;
      const lines = content.split("\n").filter((line) => line.trim());
      const errors = [];
      const importedContacts = [];

      // Get and normalize headers
      const headers = lines[0].split(",").map((header) => {
        const normalized = normalizeHeader(header.trim());
        if (
          ![
            "firstName",
            "lastName",
            "middleName",
            "email",
            "phone",
            "groups",
          ].includes(normalized)
        ) {
          errors.push(`Unknown column header: ${header.trim()}`);
        }
        return normalized;
      });

      // Check for required headers
      const requiredHeaders = ["firstName", "lastName", "phone"];
      const missingHeaders = requiredHeaders.filter(
        (header) => !headers.includes(header)
      );
      if (missingHeaders.length > 0) {
        setError(`Missing required columns: ${missingHeaders.join(", ")}`);
        return;
      }

      // Process each line
      lines.slice(1).forEach((line, index) => {
        const values = line.split(",").map((val) => val.trim());
        if (values.length !== headers.length) {
          errors.push(`Line ${index + 2}: Invalid number of columns`);
          return;
        }

        // Create contact object using header mapping
        const contact = {
          id: Date.now() + Math.random(),
          firstName: "",
          middleName: "",
          lastName: "",
          phone: "",
          email: "",
          groups: [],
        };

        // Map values to correct fields
        headers.forEach((header, i) => {
          if (header === "groups") {
            const groupsArray = values[i].split(";").filter(Boolean);
            contact.groups = groupsArray.map((group) => {
              const newGroup = createOption(group.trim());
              // Add to global groups if not exists
              if (!groups.some((g) => g.value === newGroup.value)) {
                setGroups((prevGroups) => [...prevGroups, newGroup]);
              }
              return newGroup;
            });
          } else if (header === "phone") {
            contact[header] = formatPhoneNumber(values[i]);
          } else {
            contact[header] = values[i];
          }
        });

        // Validate the contact
        if (!contact.firstName || !contact.lastName || !contact.phone) {
          errors.push(`Line ${index + 2}: Missing required fields`);
          return;
        }

        // Check for duplicate phone numbers
        const isDuplicatePhone =
          contacts.some((c) => c.phone === contact.phone) ||
          importedContacts.some((c) => c.phone === contact.phone);

        if (isDuplicatePhone) {
          errors.push(
            `Line ${index + 2}: Duplicate phone number ${contact.phone}`
          );
          return;
        }

        importedContacts.push(contact);
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

  const normalizeHeader = (header) => {
    // Remove special characters and spaces, convert to lowercase
    const normalized = header.toLowerCase().replace(/[^a-z0-9]/g, "");

    // Map various possible header names to standard format
    const headerMap = {
      firstname: "firstName",
      first: "firstName",
      fname: "firstName",
      middlename: "middleName",
      middle: "middleName",
      mname: "middleName",
      lastname: "lastName",
      last: "lastName",
      lname: "lastName",
      surname: "lastName",
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
    if (!contact.firstName.trim()) {
      setError("First name is required");
      return false;
    }
    if (!contact.lastName.trim()) {
      setError("Last name is required");
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

  const getFullName = (contact) => {
    return [contact.firstName, contact.middleName, contact.lastName]
      .filter(Boolean)
      .join(" ");
  };

  const startEditing = (contact) => {
    setEditingId(contact.id);
    setEditForm({
      firstName: contact.firstName,
      middleName: contact.middleName,
      lastName: contact.lastName,
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
      firstName: "",
      middleName: "",
      lastName: "",
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

    const updatedContacts = contacts.map((contact) =>
      contact.id === id
        ? {
            ...contact,
            ...editForm,
          }
        : contact
    );

    // Update contacts first
    setContacts(updatedContacts);

    // Then clean up unused groups based on the updated contacts
    const updatedGroups = cleanupUnusedGroups(updatedContacts);
    setGroups(updatedGroups);

    setEditingId(null);
    setError("");
  };

  const addNewContact = () => {
    const newContact = {
      id: Date.now(),
      firstName: "",
      middleName: "",
      lastName: "",
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
      contactName: getFullName(contact),
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

  const formatPhoneNumber = (phone) => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, "");

    // Check if it's a valid length (assuming US numbers for this example)
    // You might want to adjust this based on your needs
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

  const cleanupUnusedGroups = (currentContacts) => {
    // Get all groups currently in use by any contact
    const usedGroupValues = new Set(
      currentContacts.flatMap((contact) =>
        contact.groups.map((group) => group.value)
      )
    );

    // Filter out any groups that aren't being used
    return groups.filter((group) => usedGroupValues.has(group.value));
  };

  const exportContacts = () => {
    const header = "First Name,Middle Name,Last Name,Phone,Email,Groups\n";
    const csv = contacts
      .map(
        (contact) =>
          `${contact.firstName},${contact.middleName},${contact.lastName},${
            contact.phone
          },${contact.email},${contact.groups.map((g) => g.label).join(";")}`
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
    control: (provided, state) => ({
      ...provided,
      minWidth: "200px",
      minHeight: "32px",
      borderColor: state.isFocused ? "#318D43" : provided.borderColor, // Change the border color when focused
      boxShadow: state.isFocused ? `0 0 0 1px #318D43` : provided.boxShadow, // Optional: Add a box-shadow for better focus visibility
      "&:hover": {
        borderColor: "#318D43", // Change the hover border color
      },
    }),
    menu: (provided) => ({
      ...provided,
      position: "absolute",
      width: "100%",
      zIndex: 9999,
      marginTop: 0,
      backgroundColor: "white",
      border: "1px solid #e2e8f0",
      borderRadius: "6px",
      boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
      overflow: "hidden",
    }),
    menuList: (provided) => ({
      ...provided,
      padding: "4px",
      fontSize: "14px",
    }),
    option: (provided, { isFocused, isSelected }) => ({
      ...provided,
      fontSize: "14px",
      backgroundColor: isFocused ? "#f7fafc" : isSelected ? "#e2e8f0" : "white",
      color: "#2d3748",
      padding: "8px",
      "&:active": {
        backgroundColor: "#e2e8f0",
      },
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  const selectComponents = {
    // Reverse the menu so it displays upwards
    MenuList: ({ children, ...props }) => (
      <components.MenuList
        {...props}
        style={{
          padding: "4px",
          fontSize: "14px", // Smaller font size
        }}
      >
        {React.Children.toArray(children).reverse()}
      </components.MenuList>
    ),
    // Move create option to top
    Menu: ({ children, ...props }) => {
      const { options, createOption } = props.selectProps;
      return (
        <components.Menu
          {...props}
          style={{
            backgroundColor: "white",
            border: "1px solid #e2e8f0",
            borderRadius: "6px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
          }}
        >
          {createOption && (
            <div
              style={{
                padding: "4px 8px",
                borderBottom: "1px solid #e2e8f0",
                fontSize: "14px", // Smaller font size
              }}
            >
              {createOption}
            </div>
          )}
          {children}
        </components.Menu>
      );
    },
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

      <TableContainer>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>
                {renderSortLabel("firstName", "First Name")}
              </TableCell>
              <TableCell>{renderSortLabel("lastName", "Last Name")}</TableCell>
              <TableCell>{renderSortLabel("phone", "Phone")}</TableCell>
              <TableCell>{renderSortLabel("email", "Email")}</TableCell>
              <TableCell>{renderSortLabel("groups", "Groups")}</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredContacts.map((contact) => (
              <TableRow key={contact.id}>
                <TableCell>
                  {editingId === contact.id ? (
                    <TextField
                      value={editForm.firstName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, firstName: e.target.value })
                      }
                      size="small"
                      fullWidth
                      error={error && error.includes("First name")}
                      required
                    />
                  ) : (
                    contact.firstName
                  )}
                </TableCell>
                {/* <TableCell>
                  {editingId === contact.id ? (
                    <TextField
                      value={editForm.middleName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, middleName: e.target.value })
                      }
                      size="small"
                      fullWidth
                    />
                  ) : (
                    contact.middleName
                  )}
                </TableCell> */}
                <TableCell>
                  {editingId === contact.id ? (
                    <TextField
                      value={editForm.lastName}
                      onChange={(e) =>
                        setEditForm({ ...editForm, lastName: e.target.value })
                      }
                      size="small"
                      fullWidth
                      error={error && error.includes("Last name")}
                      required
                    />
                  ) : (
                    contact.lastName
                  )}
                </TableCell>
                <TableCell sx={{ whiteSpace: "nowrap" }}>
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
                      components={selectComponents}
                      menuPortalTarget={document.body}
                      noOptionsMessage={() => "Type to create new group"}
                      menuPosition="fixed"
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

            {/* Add me a total */}
            <TableRow>
              <TableCell colSpan={2}>
                <strong>Total:</strong>
              </TableCell>
              <TableCell>
                <strong>{contacts.length}</strong>
              </TableCell>
            </TableRow>
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
