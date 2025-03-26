// ContactsTable with Combined Name Column
import React from "react";
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
} from "@mui/material";
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Close as CloseIcon,
  Delete as DeleteIcon,
  Person,
} from "@mui/icons-material";
import Creatable from "react-select/creatable";

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
  handleDeleteClick,
  startEditing,
  handleSort,
  formError,
  userId,
  groups,
}) => {
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

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell>{renderSortLabel("owner_type", "Owner")}</TableCell>
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
              <TableCell
                sx={{
                  width: "50px",
                }}
              >
                {contact.owner_type === "user" ? (
                  <>
                    <Tooltip title="Personal Contact" placement="top-start">
                      <Person />
                    </Tooltip>
                  </>
                ) : contact.owner_type === "community" ? (
                  "Community"
                ) : (
                  "City"
                )}
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
                ) : (
                  contact.phone || ""
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
                  contact.email || ""
                )}
              </TableCell>
              <TableCell>
                {editingId === contact.id ? (
                  <Creatable
                    isMulti
                    value={editForm.groups || []}
                    options={groups}
                    onChange={(newGroups) => handleGroupChange(newGroups)}
                    styles={selectStyles}
                    components={selectComponents}
                    menuPortalTarget={document.body}
                    noOptionsMessage={() => "Type to create new group"}
                    menuPosition="fixed"
                    placeholder="Select or create groups"
                  />
                ) : contact?.groups && Array.isArray(contact.groups) ? (
                  contact.groups.map((g) => g.label || g).join(", ")
                ) : (
                  ""
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
                    {contact.owner_type === "user" &&
                      contact.owner_id === userId && (
                        <>
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
                            color="error"
                          >
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                  </Box>
                )}
              </TableCell>
            </TableRow>
          ))}

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
