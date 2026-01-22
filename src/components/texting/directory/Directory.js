"use client";

import { useState, useEffect } from "react";
import {
  Paper,
  TextField,
  Button,
  Box,
  Typography,
  Alert,
  InputAdornment,
  CircularProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Badge,
} from "@mui/material";
import {
  Add as AddIcon,
  FileUpload as FileUploadIcon,
  FileDownload as FileDownloadIcon,
  Search as SearchIcon,
  Refresh as RefreshIcon,
  ErrorOutline as ErrorOutlineIcon,
  ExpandMore as ExpandMoreIcon,
} from "@mui/icons-material";
import AskYesNoDialog from "@/components/util/AskYesNoDialog";
import { useUserContacts } from "@/hooks/useUserContacts";
import { ContactsTable } from "./ContactsTable";
import ContactDialog from "./ContactDialog";
import ImportCsvHelpDialog from "./ImportCsvHelpDialog";
import { exportContacts, parseGroups } from "./utils/csvHelpers";
import { importContacts } from "./utils/importContacts";

const ContactsManagement = ({ user, userCommunities, userCities }) => {
  const userId = user?.id || null;
  const {
    contacts,
    loading,
    error,
    addContact,
    bulkAddContacts,
    bulkUpdateContacts,
    bulkDeleteContacts,
    updateContact,
    deleteContact,
    moveContact,
    refreshContacts,
  } = useUserContacts(
    userId,
    (userCommunities || []).map((c) => c.id),
    (userCities || []).map((c) => c.id),
  );

  const [csvHelpOpen, setCsvHelpOpen] = useState(false);
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

  // Modified state for groups - now organized by owner
  const [groupsByOwner, setGroupsByOwner] = useState({
    user: [], // User groups
    communities: {}, // Community groups by community ID
    cities: {}, // City groups by city ID
  });

  // Add state for sorting and searching
  const [orderBy, setOrderBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredContacts, setFilteredContacts] = useState([]);
  const [isLoading, setLoading] = useState(false);

  // Add state for accordion expansion
  const [expandedAccordions, setExpandedAccordions] = useState({
    user: true, // Start with user contacts expanded
    communities: {},
    cities: {},
  });

  // Extract unique groups from contacts, organized by owner
  useEffect(() => {
    if (!contacts) return;
    const userGroups = new Set();
    const communityGroups = {};
    const cityGroups = {};

    // Initialize community groups sets
    if (userCommunities) {
      userCommunities.forEach((community) => {
        communityGroups[community.id] = new Set();
      });
    }

    // Initialize city groups sets
    if (userCities) {
      userCities.forEach((city) => {
        cityGroups[city.id] = new Set();
      });
    }

    // Process user contacts
    if (contacts.userContacts) {
      contacts.userContacts.forEach((contact) => {
        if (!contact) return;
        const parsedGroups = parseGroups(contact.groups);
        parsedGroups.forEach((group) => {
          if (typeof group === "string") {
            userGroups.add(group);
          } else if (group && group.value) {
            userGroups.add(group.value);
          }
        });
      });
    }

    // Process community contacts
    if (contacts.communityContacts) {
      Object.entries(contacts.communityContacts).forEach(
        ([communityId, communityContacts]) => {
          if (!Array.isArray(communityContacts)) return;
          communityContacts.forEach((contact) => {
            if (!contact) return;
            const parsedGroups = parseGroups(contact.groups);
            parsedGroups.forEach((group) => {
              if (typeof group === "string") {
                if (communityGroups[communityId]) {
                  communityGroups[communityId].add(group);
                }
              } else if (group && group.value) {
                if (communityGroups[communityId]) {
                  communityGroups[communityId].add(group.value);
                }
              }
            });
          });
        },
      );
    }

    // Process city contacts
    if (contacts.cityContacts) {
      Object.entries(contacts.cityContacts).forEach(
        ([cityId, cityContacts]) => {
          if (!Array.isArray(cityContacts)) return;
          cityContacts.forEach((contact) => {
            if (!contact) return;
            const parsedGroups = parseGroups(contact.groups);
            parsedGroups.forEach((group) => {
              if (typeof group === "string") {
                if (cityGroups[cityId]) {
                  cityGroups[cityId].add(group);
                }
              } else if (group && group.value) {
                if (cityGroups[cityId]) {
                  cityGroups[cityId].add(group.value);
                }
              }
            });
          });
        },
      );
    }

    // Convert Sets to arrays
    const formattedCommunityGroups = {};
    Object.entries(communityGroups).forEach(([communityId, groupSet]) => {
      formattedCommunityGroups[communityId] = Array.from(groupSet);
    });

    const formattedCityGroups = {};
    Object.entries(cityGroups).forEach(([cityId, groupSet]) => {
      formattedCityGroups[cityId] = Array.from(groupSet);
    });

    // Update state with organized groups
    setGroupsByOwner({
      user: Array.from(userGroups),
      communities: formattedCommunityGroups,
      cities: formattedCityGroups,
    });
  }, [contacts, userCommunities, userCities]);

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
                (g?.label && g.label.toLowerCase().includes(query)),
            );
          })(),
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
          toast.error(error);
          return;
        }
      } else {
        const { data, error } = await updateContact(id, editForm);
        if (error) {
          setFormError(error);
          toast.error(error);
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

      // Bulk delete contacts
      const { error } = await bulkDeleteContacts(contactIds);
      if (error) {
        throw new Error(error);
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

  // Handle accordion expansion
  const handleAccordionChange =
    (section, id = null) =>
    (event, isExpanded) => {
      if (section === "user") {
        setExpandedAccordions((prev) => ({
          ...prev,
          user: isExpanded,
        }));
      } else if (section === "communities") {
        setExpandedAccordions((prev) => ({
          ...prev,
          communities: {
            ...prev.communities,
            [id]: isExpanded,
          },
        }));
      } else if (section === "cities") {
        setExpandedAccordions((prev) => ({
          ...prev,
          cities: {
            ...prev.cities,
            [id]: isExpanded,
          },
        }));
      }
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
    return await importContacts(
      event,
      addContact,
      bulkAddContacts,
      bulkUpdateContacts,
      setFormError,
      refreshContacts,
      userId,
      contacts,
    );
  };

  // Get relevant groups for a specific owner type
  const getGroupsForOwner = (ownerType, ownerId) => {
    if (ownerType === "user") {
      return groupsByOwner.user;
    } else if (ownerType === "community") {
      return groupsByOwner.communities[ownerId] || [];
    } else if (ownerType === "city") {
      return groupsByOwner.cities[ownerId] || [];
    }
    return [];
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
    isNewContact,
    handleBulkDeleteClick,
    bulkDeleteContacts,
    user,
  };

  // Helper function to get contact count
  const getContactCount = (contactList) => {
    return Array.isArray(contactList) ? contactList.length : 0;
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
          <Button
            variant="outlined"
            component="span"
            startIcon={<FileUploadIcon />}
            size="small"
            onClick={() => setCsvHelpOpen(true)}
          >
            Import CSV
          </Button>
          <Button
            variant="outlined"
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

      {/* User Contacts Accordion (filtered by search) */}
      {contacts.userContacts &&
        (() => {
          // Filter user contacts by searchQuery
          const filteredUserContacts = searchQuery
            ? contacts.userContacts.filter((contact) => {
                const query = searchQuery.toLowerCase();
                return (
                  (contact.first_name &&
                    contact.first_name.toLowerCase().includes(query)) ||
                  (contact.last_name &&
                    contact.last_name.toLowerCase().includes(query)) ||
                  (contact.middle_name &&
                    contact.middle_name.toLowerCase().includes(query)) ||
                  (contact.email &&
                    contact.email.toLowerCase().includes(query)) ||
                  (contact.phone && contact.phone.includes(query)) ||
                  (() => {
                    const parsedGroups = parseGroups(contact.groups);
                    return parsedGroups.some(
                      (g) =>
                        (typeof g === "string" &&
                          g.toLowerCase().includes(query)) ||
                        (g?.label && g.label.toLowerCase().includes(query)),
                    );
                  })()
                );
              })
            : contacts.userContacts;
          if (filteredUserContacts.length === 0) return null;
          return (
            <Accordion
              expanded={expandedAccordions.user}
              onChange={handleAccordionChange("user")}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="h6">
                    {user.isAdmin ? "Personal Contacts" : "Unassigned Contacts"}
                  </Typography>
                  <Badge
                    badgeContent={filteredUserContacts.length}
                    color="primary"
                    max={Infinity}
                    sx={{
                      "& .MuiBadge-badge": {
                        position: "static",
                        transform: "none",
                      },
                    }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                {!user?.isAdmin && (
                  <Box sx={{ mt: 1, mb: 2 }}>
                    <Typography variant="body2" color="error">
                      <ErrorOutlineIcon
                        sx={{ verticalAlign: "middle", mr: 1 }}
                      />
                      You cannot send texts to unassigned contacts. Please
                      select the contact and assign them to a city or community
                      to enable texting.
                    </Typography>
                  </Box>
                )}
                <ContactsTable
                  {...ContactsTableProps}
                  filteredContacts={filteredUserContacts}
                  tableName="Unassigned Contacts"
                  canAddNew
                  groups={getGroupsForOwner("user")}
                  ownerType="user"
                  ownerId={userId}
                />
              </AccordionDetails>
            </Accordion>
          );
        })()}

      {/* Community Contacts Accordions (filtered by search) */}
      {userCommunities &&
        userCommunities.map((community) => {
          const communityContacts =
            contacts.communityContacts?.[community.id] || [];
          // Filter community contacts by searchQuery
          const filteredCommunityContacts = searchQuery
            ? communityContacts.filter((contact) => {
                const query = searchQuery.toLowerCase();
                return (
                  (contact.first_name &&
                    contact.first_name.toLowerCase().includes(query)) ||
                  (contact.last_name &&
                    contact.last_name.toLowerCase().includes(query)) ||
                  (contact.middle_name &&
                    contact.middle_name.toLowerCase().includes(query)) ||
                  (contact.email &&
                    contact.email.toLowerCase().includes(query)) ||
                  (contact.phone && contact.phone.includes(query)) ||
                  (() => {
                    const parsedGroups = parseGroups(contact.groups);
                    return parsedGroups.some(
                      (g) =>
                        (typeof g === "string" &&
                          g.toLowerCase().includes(query)) ||
                        (g?.label && g.label.toLowerCase().includes(query)),
                    );
                  })()
                );
              })
            : communityContacts;
          if (filteredCommunityContacts.length === 0) return null;
          return (
            <Accordion
              key={community.id}
              expanded={expandedAccordions.communities[community.id] || false}
              onChange={handleAccordionChange("communities", community.id)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="h6">
                    {community.name} Contacts
                  </Typography>
                  <Badge
                    badgeContent={filteredCommunityContacts.length}
                    color="primary"
                    max={Infinity}
                    sx={{
                      "& .MuiBadge-badge": {
                        position: "static",
                        transform: "none",
                      },
                    }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <ContactsTable
                  filteredContacts={filteredCommunityContacts}
                  {...ContactsTableProps}
                  tableName={community.name}
                  ownerType="community"
                  groups={getGroupsForOwner("community", community.id)}
                  ownerId={community.id}
                />
              </AccordionDetails>
            </Accordion>
          );
        })}

      {/* City Contacts Accordions (filtered by search) */}
      {userCities &&
        userCities.map((city) => {
          const cityContacts = contacts.cityContacts?.[city.id] || [];
          // Filter city contacts by searchQuery
          const filteredCityContacts = searchQuery
            ? cityContacts.filter((contact) => {
                const query = searchQuery.toLowerCase();
                return (
                  (contact.first_name &&
                    contact.first_name.toLowerCase().includes(query)) ||
                  (contact.last_name &&
                    contact.last_name.toLowerCase().includes(query)) ||
                  (contact.middle_name &&
                    contact.middle_name.toLowerCase().includes(query)) ||
                  (contact.email &&
                    contact.email.toLowerCase().includes(query)) ||
                  (contact.phone && contact.phone.includes(query)) ||
                  (() => {
                    const parsedGroups = parseGroups(contact.groups);
                    return parsedGroups.some(
                      (g) =>
                        (typeof g === "string" &&
                          g.toLowerCase().includes(query)) ||
                        (g?.label && g.label.toLowerCase().includes(query)),
                    );
                  })()
                );
              })
            : cityContacts;
          if (filteredCityContacts.length === 0) return null;
          return (
            <Accordion
              key={city.id}
              expanded={expandedAccordions.cities[city.id] || false}
              onChange={handleAccordionChange("cities", city.id)}
              sx={{ mb: 2 }}
            >
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                  <Typography variant="h6">{city.name} Contacts</Typography>
                  <Badge
                    badgeContent={filteredCityContacts.length}
                    color="primary"
                    max={Infinity}
                    sx={{
                      "& .MuiBadge-badge": {
                        position: "static",
                        transform: "none",
                      },
                    }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <ContactsTable
                  filteredContacts={filteredCityContacts}
                  {...ContactsTableProps}
                  tableName={city.name}
                  groups={getGroupsForOwner("city", city.id)}
                  ownerType="city"
                  ownerId={city.id}
                />
              </AccordionDetails>
            </Accordion>
          );
        })}

      {/* Show message when no contacts exist */}
      {(!contacts.userContacts ||
        getContactCount(contacts.userContacts) === 0) &&
        (!userCommunities ||
          userCommunities.every(
            (community) =>
              getContactCount(
                contacts.communityContacts?.[community.id] || [],
              ) === 0,
          )) &&
        (!userCities ||
          userCities.every(
            (city) =>
              getContactCount(contacts.cityContacts?.[city.id] || []) === 0,
          )) && (
          <Box sx={{ textAlign: "center", py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No contacts found
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
              Get started by adding your first contact or importing from CSV
            </Typography>
          </Box>
        )}

      {/* Contact Add/Edit Dialog */}
      <ContactDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSave={handleDialogSave}
        contact={editingContact}
        userId={userId}
        userCommunities={userCommunities}
        userCities={userCities}
        groupsByOwner={groupsByOwner}
        user={user}
        title={editingContact ? "Edit Contact" : "Add Contact"}
        formError={formError}
      />

      <ImportCsvHelpDialog
        open={csvHelpOpen}
        onClose={() => setCsvHelpOpen(false)}
        handleImportContact={handleImportContact}
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
