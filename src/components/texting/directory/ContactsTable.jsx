// ContactsTable with Combined Name Column and Simplified Groups
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  TextField,
  TableSortLabel,
  IconButton,
  Box,
  Tooltip,
  Grid,
  useMediaQuery,
  Checkbox,
  Typography,
  Button,
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Person,
  Phone,
  ContentCopy,
  Email,
  DeleteOutline,
} from "@mui/icons-material";
import Creatable from "react-select/creatable";
import { toast } from "react-toastify";
import JsonViewer from "@/components/util/debug/DebugOutput";

export const ContactsTable = ({
  editingId,
  editForm,
  filteredContacts,
  orderBy,
  order,
  saveEdit,
  cancelEditing,
  setEditForm,
  handleGroupChange,
  handleBulkDeleteClick,
  startEditing,
  handleSort,
  formError,
  userId,
  groups,
  moveContact,
  userCommunities,
  userCities,
  tableName,
  canAddNew,
  isNewContact,
  user,
}) => {
  const [selectedContacts, setSelectedContacts] = useState(new Set());

  const isXlScreen = useMediaQuery((theme) => theme.breakpoints.up("xl"));

  // Styles for react-select
  const selectStyles = {
    control: (provided) => ({
      ...provided,
      minHeight: "32px",
      fontSize: "0.875rem",
    }),
    menu: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
    menuPortal: (provided) => ({
      ...provided,
      zIndex: 9999,
    }),
  };

  const handleCheckboxChange = (contactId) => {
    setSelectedContacts((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(contactId)) {
        newSet.delete(contactId);
      } else {
        newSet.add(contactId);
      }
      return newSet;
    });
  };

  const handleMoveContacts = async (newOwnerType, newOwnerId) => {
    for (const contactId of selectedContacts) {
      await moveContact(contactId, newOwnerType, newOwnerId);
    }
    setSelectedContacts(new Set());
  };

  // Custom components for react-select
  const selectComponents = {
    DropdownIndicator: () => null,
    IndicatorSeparator: () => null,
  };

  // Render sort label for table headers
  const renderSortLabel = (property, label) => (
    <TableSortLabel
      active={orderBy === property}
      direction={orderBy === property ? order : "asc"}
      onClick={() => handleSort(property)}
    >
      {label}
    </TableSortLabel>
  );

  // Function to display full name
  const getFullName = (contact) => {
    const parts = [
      contact.first_name || "",
      contact.middle_name || "",
      contact.last_name || "",
    ];
    return parts.filter((part) => part.trim() !== "").join(" ");
  };

  // Convert string groups to format needed for react-select
  const formatGroupsForSelect = (groups) => {
    // Handle null or undefined case
    if (!groups) return [];

    // Handle empty array
    if (Array.isArray(groups) && groups.length === 0) return [];

    // If groups is a string (JSON string), try to parse it
    if (typeof groups === "string") {
      try {
        const parsedGroups = JSON.parse(groups);
        if (Array.isArray(parsedGroups)) {
          return parsedGroups.map((group) => {
            // If already in object format with value/label
            if (typeof group === "object" && group !== null && group.value) {
              return group;
            }
            // If it's a string
            return { label: group, value: group };
          });
        }
      } catch (e) {
        console.error("Error parsing groups JSON", e);
        return [];
      }
    }

    // If groups is already an array
    if (Array.isArray(groups)) {
      return groups.map((group) => {
        // If already in object format
        if (typeof group === "object" && group !== null && group.value) {
          return group;
        }
        // If it's a string
        return { label: group, value: group };
      });
    }

    return [];
  };

  // Convert react-select format back to string array
  const formatGroupsForSave = (groupObjects) => {
    if (!groupObjects) return [];
    if (!Array.isArray(groupObjects)) return [];

    return groupObjects.map((group) => {
      // If group is already a string
      if (typeof group === "string") {
        return group;
      }
      // If group is an object with value property
      if (typeof group === "object" && group !== null && group.value) {
        return group.value;
      }
      // Fallback
      return String(group);
    });
  };

  const copyPhoneToClipboard = (phone) => {
    navigator.clipboard.writeText(phone.replace(/[^0-9]/g, ""));

    toast.success(`Copied ${phone} to clipboard`);
  };

  const copyEmailToClipboard = (email) => {
    navigator.clipboard.writeText(email);

    toast.success(`Copied ${email} to clipboard`);
  };

  return (
    <TableContainer>
      <Box sx={{ mt: 2, display: "flex", gap: 1, alignItems: "between" }}>
        {selectedContacts.size > 0 && (
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <Typography>Move selected contacts to:</Typography>
            {tableName !== "Personal Contacts" && (
              <Button onClick={() => handleMoveContacts("user", userId)}>
                {user?.isAdmin ? "Personal Contacts" : "Unassigned Contacts"}
              </Button>
            )}
            {userCommunities &&
              userCommunities.length > 0 &&
              userCommunities
                .filter((community) => community.name !== tableName)
                .map((community) => (
                  <Button
                    key={community.id}
                    onClick={() =>
                      handleMoveContacts("community", community.id)
                    }
                  >
                    {community.name} Community
                  </Button>
                ))}
            {userCities &&
              userCities.length > 0 &&
              userCities
                .filter((city) => city.name !== tableName)
                .map((city) => (
                  <Button
                    key={city.id}
                    onClick={() => handleMoveContacts("city", city.id)}
                  >
                    {city.name} City
                  </Button>
                ))}
          </Box>
        )}
        <Button
          variant="outlined"
          color="error"
          onClick={() => {
            if (selectedContacts.size > 0) {
              const contactIdsArray = Array.from(selectedContacts);
              handleBulkDeleteClick(contactIdsArray); // Use this function instead of directly deleting
              setSelectedContacts(new Set()); // Reset selected contacts
            }
          }}
          sx={{ ml: "auto" }}
          disabled={selectedContacts.size === 0}
        >
          Delete Selected
        </Button>
      </Box>

      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>
              <Checkbox
                checked={selectedContacts.size === filteredContacts.length}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedContacts(
                      new Set(filteredContacts.map((c) => c.id))
                    );
                  } else {
                    setSelectedContacts(new Set());
                  }
                }}
              />
            </TableCell>
            <TableCell>{renderSortLabel("last_name", "Name")}</TableCell>
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
                <Checkbox
                  checked={selectedContacts.has(contact.id)}
                  onChange={() => handleCheckboxChange(contact.id)}
                />
              </TableCell>

              <TableCell>
                {editingId === contact.id ? (
                  <Grid container spacing={1}>
                    <Grid item xs={4}>
                      <TextField
                        value={editForm.first_name || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            first_name: e.target.value,
                          })
                        }
                        size="small"
                        fullWidth
                        label="First"
                        error={formError && formError.includes("First Name")}
                        required
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        value={editForm.middle_name || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            middle_name: e.target.value,
                          })
                        }
                        size="small"
                        fullWidth
                        label="Mid"
                      />
                    </Grid>
                    <Grid item xs={4}>
                      <TextField
                        value={editForm.last_name || ""}
                        onChange={(e) =>
                          setEditForm({
                            ...editForm,
                            last_name: e.target.value,
                          })
                        }
                        size="small"
                        fullWidth
                        label="Last"
                        error={formError && formError.includes("Last Name")}
                        required
                      />
                    </Grid>
                  </Grid>
                ) : (
                  getFullName(contact) || contact.name || ""
                )}
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                {editingId === contact.id ? (
                  <TextField
                    value={editForm.phone || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, phone: e.target.value })
                    }
                    size="small"
                    fullWidth
                    error={formError && formError.includes("Phone")}
                    required
                  />
                ) : isXlScreen ? (
                  <>{contact.phone}</>
                ) : (
                  <Tooltip title={contact.phone || ""} placement="top-start">
                    <IconButton
                      size="small"
                      onClick={() => copyPhoneToClipboard(contact.phone)}
                    >
                      <Phone />
                    </IconButton>
                  </Tooltip>
                )}
              </TableCell>
              <TableCell>
                {editingId === contact.id ? (
                  <TextField
                    value={editForm.email || ""}
                    onChange={(e) =>
                      setEditForm({ ...editForm, email: e.target.value })
                    }
                    size="small"
                    fullWidth
                  />
                ) : (
                  contact.email.trim() &&
                  (isXlScreen ? (
                    <>{contact.email}</>
                  ) : (
                    <Tooltip title={contact.email} placement="top-start">
                      <IconButton
                        size="small"
                        onClick={() => copyEmailToClipboard(contact.email)}
                      >
                        <Email />
                      </IconButton>
                    </Tooltip>
                  ))
                )}
              </TableCell>
              <TableCell>
                {editingId === contact.id ? (
                  <Creatable
                    isMulti
                    value={formatGroupsForSelect(editForm.groups || [])}
                    options={formatGroupsForSelect(groups || [])}
                    onChange={(newGroups) => {
                      const stringGroups = formatGroupsForSave(newGroups || []);
                      handleGroupChange(stringGroups);
                    }}
                    styles={selectStyles}
                    components={selectComponents}
                    menuPortalTarget={document.body}
                    noOptionsMessage={() => "Type to create new group"}
                    menuPosition="fixed"
                    placeholder="Select or create groups"
                  />
                ) : (
                  (() => {
                    let displayGroups = contact.groups;
                    // Parse JSON string if needed
                    if (typeof contact.groups === "string") {
                      try {
                        displayGroups = JSON.parse(contact.groups);
                      } catch (e) {
                        return contact.groups || "";
                      }
                    }
                    return Array.isArray(displayGroups)
                      ? displayGroups.join(", ")
                      : "";
                  })()
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
                    {/* Only allow editing of user's own contacts */}

                    <>
                      <IconButton
                        size="small"
                        onClick={() => startEditing(contact)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                    </>
                  </Box>
                )}
              </TableCell>
            </TableRow>
          ))}

          {canAddNew && isNewContact && (
            <TableRow key={editForm.id}>
              <TableCell></TableCell>

              <TableCell>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <TextField
                      value={editForm.first_name || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          first_name: e.target.value,
                        })
                      }
                      size="small"
                      fullWidth
                      label="First"
                      error={formError && formError.includes("First Name")}
                      required
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      value={editForm.middle_name || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          middle_name: e.target.value,
                        })
                      }
                      size="small"
                      fullWidth
                      label="Mid"
                    />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField
                      value={editForm.last_name || ""}
                      onChange={(e) =>
                        setEditForm({
                          ...editForm,
                          last_name: e.target.value,
                        })
                      }
                      size="small"
                      fullWidth
                      label="Last"
                      error={formError && formError.includes("Last Name")}
                      required
                    />
                  </Grid>
                </Grid>
              </TableCell>
              <TableCell sx={{ whiteSpace: "nowrap" }}>
                <TextField
                  value={editForm.phone || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, phone: e.target.value })
                  }
                  size="small"
                  fullWidth
                  error={formError && formError.includes("Phone")}
                  required
                />
              </TableCell>
              <TableCell>
                <TextField
                  value={editForm.email || ""}
                  onChange={(e) =>
                    setEditForm({ ...editForm, email: e.target.value })
                  }
                  size="small"
                  fullWidth
                />
              </TableCell>
              <TableCell>
                <Creatable
                  isMulti
                  value={formatGroupsForSelect(editForm.groups || [], true)}
                  options={formatGroupsForSelect(groups || [])}
                  onChange={(newGroups) => {
                    const stringGroups = formatGroupsForSave(newGroups || []);
                    handleGroupChange(stringGroups);
                  }}
                  styles={selectStyles}
                  components={selectComponents}
                  menuPortalTarget={document.body}
                  noOptionsMessage={() => "Type to create new group"}
                  menuPosition="fixed"
                  placeholder="Select or create groups"
                />
              </TableCell>
              <TableCell align="right">
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "flex-end",
                    gap: 1,
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => saveEdit(editForm.id)}
                    color="primary"
                  >
                    <SaveIcon />
                  </IconButton>
                  <IconButton size="small" onClick={cancelEditing}>
                    <CloseIcon />
                  </IconButton>
                </Box>
              </TableCell>
            </TableRow>
          )}

          {/* Add a total row */}
          <TableRow>
            <TableCell colSpan={2}>
              <strong>Total:</strong>
            </TableCell>
            <TableCell>
              <strong>{filteredContacts.length}</strong>
            </TableCell>
            <TableCell colSpan={3}></TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </TableContainer>
  );
};
