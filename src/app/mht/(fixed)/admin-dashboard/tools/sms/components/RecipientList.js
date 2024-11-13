import React from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { Error } from "@mui/icons-material";

export const RecipientsList = ({ selectedRecipients, contacts }) => {
  // Safe check for group membership
  const isGroupRecipient = (recipient) => {
    return (
      recipient &&
      typeof recipient.value === "string" &&
      recipient.value.startsWith("group:")
    );
  };

  // Function to get all contacts from a group
  const getGroupContacts = (groupName) => {
    if (!groupName || !contacts) return [];

    return contacts
      .filter(
        (contact) =>
          contact.groups &&
          Array.isArray(contact.groups) &&
          contact.groups.some((g) => g && g.value === groupName)
      )
      .map((contact) => ({
        value: contact.phone || "",
        label: `${contact.name || "Unknown"} (${contact.phone || "No Phone"})`,
        fromGroup: groupName,
      }));
  };

  // Process recipients and track duplicates with their order of appearance
  const processRecipients = () => {
    if (!Array.isArray(selectedRecipients))
      return { groupRecipients: [], individualRecipients: [] };

    const phoneNumberMap = new Map();
    const duplicatesInfo = new Map();

    // First, process group recipients
    const groupRecipients = selectedRecipients
      .filter(isGroupRecipient)
      .map((recipient) => {
        if (
          !recipient.value ||
          !recipient.label?.props?.children?.[0]?.props?.children
        ) {
          return null;
        }

        const groupName = recipient.value.replace("group:", "");
        const groupContacts = getGroupContacts(groupName);

        // Track all phone numbers from groups
        groupContacts.forEach((contact) => {
          if (contact && contact.value) {
            if (!phoneNumberMap.has(contact.value)) {
              phoneNumberMap.set(contact.value, {
                source: groupName,
                type: "group",
              });
            } else {
              duplicatesInfo.set(contact.value, {
                originalSource: phoneNumberMap.get(contact.value).source,
                type: phoneNumberMap.get(contact.value).type,
              });
            }
          }
        });

        return {
          groupName: recipient.label.props.children[0].props.children,
          contacts: groupContacts.map((contact) => ({
            ...contact,
            isDuplicate: duplicatesInfo.has(contact.value),
            duplicateInfo: duplicatesInfo.get(contact.value),
          })),
        };
      })
      .filter(Boolean); // Remove any null entries

    // Then, process individual recipients
    const individualRecipients = selectedRecipients
      .filter((r) => r && r.value && !isGroupRecipient(r))
      .map((recipient) => {
        const isDuplicate = phoneNumberMap.has(recipient.value);
        if (!isDuplicate) {
          phoneNumberMap.set(recipient.value, {
            source: "individual",
            type: "individual",
          });
        } else {
          duplicatesInfo.set(recipient.value, {
            originalSource: phoneNumberMap.get(recipient.value).source,
            type: phoneNumberMap.get(recipient.value).type,
          });
        }
        return {
          ...recipient,
          isDuplicate,
          duplicateInfo: duplicatesInfo.get(recipient.value),
        };
      });

    return {
      groupRecipients,
      individualRecipients:
        individualRecipients.length > 0
          ? [
              {
                groupName: "Individual Contacts",
                contacts: individualRecipients,
              },
            ]
          : [],
    };
  };

  const { groupRecipients, individualRecipients } = processRecipients();
  const allRecipients = [...groupRecipients, ...individualRecipients];

  return (
    <Box>
      {allRecipients.map((group, index) => (
        <Box key={index} sx={{ mb: 2 }}>
          <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
            {group.groupName}
          </Typography>
          <List dense>
            {group.contacts.map((contact, contactIndex) => (
              <ListItem key={`${contact.value}-${contactIndex}`}>
                <ListItemText
                  primary={
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                      <Typography
                        sx={{
                          textDecoration: contact.isDuplicate
                            ? "line-through"
                            : "none",
                          color: contact.isDuplicate
                            ? "text.secondary"
                            : "text.primary",
                        }}
                      >
                        {contact.label}
                      </Typography>
                      {contact.isDuplicate && (
                        <Typography
                          variant="caption"
                          sx={{
                            display: "flex",
                            px: 1,
                            py: 0.5,
                            borderRadius: 1,
                          }}
                        >
                          <Error sx={{ fontSize: 14, mr: 0.5, mt: "1px" }} />
                          Duplicate
                        </Typography>
                      )}
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
          {index < allRecipients.length - 1 && <Divider />}
        </Box>
      ))}
    </Box>
  );
};
