"use client";

import { useState } from "react";
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button,
  Collapse,
} from "@mui/material";
import { Error, ExpandMore, ExpandLess } from "@mui/icons-material";
import { getGroupMembers } from "@/util/texting/utils";

export default function RecipientsList({ selectedRecipients, contacts }) {
  const [expandedGroups, setExpandedGroups] = useState(new Set());

  const isGroupRecipient = (recipient) =>
    recipient &&
    typeof recipient.value === "string" &&
    recipient.value.startsWith("group:");

  const toggleGroupExpansion = (groupIndex) => {
    const newExpandedGroups = new Set(expandedGroups);
    if (newExpandedGroups.has(groupIndex)) {
      newExpandedGroups.delete(groupIndex);
    } else {
      newExpandedGroups.add(groupIndex);
    }
    setExpandedGroups(newExpandedGroups);
  };

  const processRecipients = () => {
    if (!Array.isArray(selectedRecipients))
      return { groupRecipients: [], individualRecipients: [] };

    const allContactsWithSource = [];
    const phoneNumberTracker = new Map();

    // Process group recipients first
    const groupRecipients = selectedRecipients
      .filter(isGroupRecipient)
      .map((recipient) => {
        if (!recipient.value || !recipient.originalValue) return null;

        const groupName = recipient.originalValue;
        const groupContacts = getGroupMembers(groupName, contacts);

        const processedContacts = groupContacts.map((contact) => {
          if (contact && contact.value) {
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
              isDuplicate: occurrenceIndex > 0,
            };

            allContactsWithSource.push(contactWithSource);
            return contactWithSource;
          }
          return contact;
        });

        return {
          groupName,
          contacts: processedContacts,
          totalContacts: processedContacts.length,
        };
      })
      .filter(Boolean);

    // Process individual recipients
    const individualRecipients = selectedRecipients
      .filter((r) => r && r.value && !isGroupRecipient(r))
      .map((recipient) => {
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
          isDuplicate: occurrenceIndex > 0,
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
                totalContacts: individualRecipients.length,
              },
            ]
          : [],
    };
  };

  const renderContactItem = (contact, contactIndex) => (
    <ListItem
      key={`${contact.value}-${contactIndex}`}
      sx={{
        py: 0.5,
        "&:hover": {
          backgroundColor: "action.hover",
        },
      }}
    >
      <ListItemText
        primary={
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <Typography
              variant="body2"
              sx={{
                textDecoration: contact.isDuplicate ? "line-through" : "none",
                color: contact.isDuplicate ? "text.secondary" : "text.primary",
              }}
            >
              {contact.label}
            </Typography>
            {contact.isDuplicate && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  px: 1,
                  py: 0.25,
                  borderRadius: 1,
                  backgroundColor: "error.light",
                  color: "error.contrastText",
                }}
              >
                <Error sx={{ fontSize: 12, mr: 0.5 }} />
                <Typography variant="caption">Duplicate</Typography>
              </Box>
            )}
          </Box>
        }
      />
    </ListItem>
  );

  const renderContactList = (contacts, groupIndex) => {
    const DISPLAY_LIMIT = 8;

    const totalContacts = contacts.length;
    const shouldShowExpand = totalContacts > DISPLAY_LIMIT;
    const isExpanded = expandedGroups.has(groupIndex);

    // Always show first batch of contacts
    const initialContacts = contacts.slice(0, DISPLAY_LIMIT);
    const remainingContacts = contacts.slice(DISPLAY_LIMIT);

    return (
      <Box>
        {/* Always visible contacts */}
        <List dense sx={{ py: 0 }}>
          {initialContacts.map((contact, contactIndex) =>
            renderContactItem(contact, contactIndex),
          )}
        </List>

        {/* Expandable section for remaining contacts */}
        {shouldShowExpand && (
          <Box>
            <Button
              onClick={() => toggleGroupExpansion(groupIndex)}
              sx={{
                textTransform: "none",
                color: "primary.main",
                display: "flex",
                alignItems: "center",
                gap: 0.5,
                ml: 2,
                mb: 1,
                "&:hover": {
                  backgroundColor: "action.hover",
                },
              }}
              size="small"
            >
              <Typography variant="body2">
                {isExpanded
                  ? "Show less"
                  : `Show ${totalContacts - DISPLAY_LIMIT} more...`}
              </Typography>
              {isExpanded ? (
                <ExpandLess sx={{ fontSize: 18 }} />
              ) : (
                <ExpandMore sx={{ fontSize: 18 }} />
              )}
            </Button>

            <Collapse
              in={isExpanded}
              timeout="auto"
              unmountOnExit
              sx={{
                "& .MuiCollapse-wrapper": {
                  "& .MuiCollapse-wrapperInner": {
                    overflow: "visible",
                  },
                },
              }}
            >
              <Box
                sx={{
                  mx: 2,
                  mb: 2,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box>
                  <List dense sx={{ py: 0 }}>
                    {remainingContacts.map((contact, contactIndex) =>
                      renderContactItem(contact, contactIndex + DISPLAY_LIMIT),
                    )}
                  </List>
                </Box>
              </Box>
            </Collapse>
          </Box>
        )}
      </Box>
    );
  };

  const { groupRecipients, individualRecipients } = processRecipients();
  const allRecipients = [...groupRecipients, ...individualRecipients];

  if (allRecipients.length === 0) {
    return (
      <Box sx={{ textAlign: "center", py: 4 }}>
        <Typography variant="body2" color="text.secondary">
          No recipients selected
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box
        sx={{
          maxHeight: 400,
          overflowY: "auto",
          overflowX: "hidden",
          "&::-webkit-scrollbar": {
            width: "8px",
          },
          "&::-webkit-scrollbar-track": {
            backgroundColor: "grey.100",
          },
          "&::-webkit-scrollbar-thumb": {
            backgroundColor: "grey.400",
            borderRadius: "4px",
            "&:hover": {
              backgroundColor: "grey.600",
            },
          },
        }}
      >
        {allRecipients.map((group, index) => {
          return (
            <Box key={`group-${index}`} sx={{ mb: 3 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  mb: 1,
                }}
              >
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: "bold",
                    color: "text.primary",
                  }}
                >
                  {group.groupName} ({group.totalContacts} total)
                </Typography>
              </Box>

              {renderContactList(group.contacts, index)}

              {index < allRecipients.length - 1 && (
                <Divider sx={{ mt: 2, mb: 1 }} />
              )}
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
