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
import { getGroupMembers } from "@/util/texting/utils";

export default function RecipientsList({ selectedRecipients, contacts }) {
  const isGroupRecipient = (recipient) =>
    recipient &&
    typeof recipient.value === "string" &&
    recipient.value.startsWith("group:");

  const processRecipients = () => {
    if (!Array.isArray(selectedRecipients))
      return { groupRecipients: [], individualRecipients: [] };

    // First, collect all contacts with their source information
    const allContactsWithSource = [];
    const phoneNumberTracker = new Map(); // Track occurrences of each phone number

    // Process group recipients first
    const groupRecipients = selectedRecipients
      .filter(isGroupRecipient)
      .map((recipient) => {
        if (!recipient.value || !recipient.originalValue) return null;
        const groupName = recipient.originalValue;
        const groupContacts = getGroupMembers(groupName, contacts);

        const processedContacts = groupContacts.map((contact) => {
          if (contact && contact.value) {
            // Track this phone number occurrence
            if (!phoneNumberTracker.has(contact.value)) {
              phoneNumberTracker.set(contact.value, 0);
            }
            const occurrenceIndex = phoneNumberTracker.get(contact.value);
            phoneNumberTracker.set(contact.value, occurrenceIndex + 1);

            const contactWithSource = {
              ...contact,
              sourceGroup: groupName,
              sourceType: "group",
              occurrenceIndex,
              isDuplicate: occurrenceIndex > 0, // Only mark as duplicate if not the first occurrence
            };

            allContactsWithSource.push(contactWithSource);
            return contactWithSource;
          }
          return contact;
        });

        return {
          groupName,
          contacts: processedContacts,
        };
      })
      .filter(Boolean);

    // Process individual recipients
    const individualRecipients = selectedRecipients
      .filter((r) => r && r.value && !isGroupRecipient(r))
      .map((recipient) => {
        // Track this phone number occurrence
        if (!phoneNumberTracker.has(recipient.value)) {
          phoneNumberTracker.set(recipient.value, 0);
        }
        const occurrenceIndex = phoneNumberTracker.get(recipient.value);
        phoneNumberTracker.set(recipient.value, occurrenceIndex + 1);

        return {
          ...recipient,
          sourceGroup: "Individual Contacts",
          sourceType: "individual",
          occurrenceIndex,
          isDuplicate: occurrenceIndex > 0, // Only mark as duplicate if not the first occurrence
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
}
