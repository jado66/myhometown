import React, { useMemo } from "react";
import { Box, Typography, Button } from "@mui/material";
import { Refresh as RefreshIcon } from "@mui/icons-material";
import Select from "react-select";
import { formatGroupsForSelect } from "@/util/texting/utils";

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
    // Create the base options array with Groups
    const options = [{ label: "Groups", options: groups }];

    // Only add Personal Contacts if user is admin
    if (user?.isAdmin) {
      options.push({
        label: "Personal Contacts",
        options: allContacts.filter((contact) =>
          contacts.userContacts.some((c) => c.id === contact.contactId)
        ),
      });
    }

    // Add community contacts
    if (user?.communities_details?.length) {
      options.push(
        ...user.communities_details.map((community) => ({
          label: `${community.name} Contacts`,
          options: allContacts.filter((contact) =>
            contacts.communityContacts[community.id]?.some(
              (c) => c.id === contact.contactId
            )
          ),
        }))
      );
    }

    // Add city contacts
    if (user?.cities_details?.length) {
      options.push(
        ...user.cities_details.map((city) => ({
          label: `${city.name} Contacts`,
          options: allContacts.filter((contact) =>
            contacts.cityContacts[city.id]?.some(
              (c) => c.id === contact.contactId
            )
          ),
        }))
      );
    }

    return options;
  }, [groups, allContacts, contacts, user]);

  return (
    <Box>
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
