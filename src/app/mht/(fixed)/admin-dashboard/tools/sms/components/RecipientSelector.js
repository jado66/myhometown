import React, { useMemo } from "react";
import { Box, Typography, Button } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import Select from "react-select";

const RecipientSelector = ({
  selectedRecipients,
  onRecipientChange,
  allContacts,
  groups,
  user,
  contacts,
  onRefreshContacts,
}) => {
  const recipientOptions = useMemo(() => {
    return [
      { label: "Groups", options: groups },
      {
        label: "Personal Contacts",
        options: allContacts.filter((contact) =>
          contacts.userContacts.some((c) => c.id === contact.contactId)
        ),
      },
      ...(user?.communities_details || []).map((community) => ({
        label: `${community.name} Contacts`,
        options: allContacts.filter((contact) =>
          contacts.communityContacts[community.id]?.some(
            (c) => c.id === contact.contactId
          )
        ),
      })),
      ...(user?.cities_details || []).map((city) => ({
        label: `${city.name} Contacts`,
        options: allContacts.filter((contact) =>
          contacts.cityContacts[city.id]?.some(
            (c) => c.id === contact.contactId
          )
        ),
      })),
    ];
  }, [groups, allContacts, contacts, user]);

  return (
    <Box>
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2,
        }}
      >
        <Typography variant="h6" sx={{ mb: 0, textAlign: "center" }}>
          Compose Message
        </Typography>
        <Button
          size="small"
          startIcon={<RefreshIcon />}
          onClick={onRefreshContacts}
          variant="outlined"
        >
          Refresh Contacts
        </Button>
      </Box>
      <Typography variant="subtitle1" gutterBottom>
        Select Recipients
      </Typography>
      <Select
        isMulti
        closeMenuOnSelect={false}
        options={recipientOptions}
        value={selectedRecipients}
        onChange={onRecipientChange}
        placeholder="Select recipients or groups"
      />
    </Box>
  );
};

export default RecipientSelector;
