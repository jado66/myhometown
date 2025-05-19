import React from "react";
import {
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { getGroupMembers } from "@/util/texting/utils";
import JsonViewer from "@/components/util/debug/DebugOutput";

const GroupInfoPopover = ({
  anchorEl,
  onClose,
  selectedGroup,
  allContacts,
}) => {
  // Get group members using the same utility function as RecipientsList
  const groupMembers =
    selectedGroup && selectedGroup.originalValue
      ? getGroupMembers(selectedGroup.originalValue, allContacts)
      : [];

  return (
    <Popover
      open={Boolean(anchorEl)}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      transformOrigin={{ vertical: "top", horizontal: "left" }}
    >
      {selectedGroup && (
        <Box sx={{ p: 2, maxWidth: 600, maxHeight: 400, overflow: "auto" }}>
          <Typography variant="h6" gutterBottom>
            {selectedGroup.originalValue} ({groupMembers.length} members)
          </Typography>

          {groupMembers.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No members found in this group
            </Typography>
          ) : (
            <List dense>
              {groupMembers.map((contact, index) => (
                <ListItem key={contact.contactId || contact.value || index}>
                  <ListItemText
                    primary={
                      contact.label ||
                      `${contact.firstName || ""} ${
                        contact.lastName || ""
                      }`.trim() ||
                      "Unknown Name"
                    }
                    secondary={
                      contact.value || contact.phone || "No phone number"
                    }
                  />
                </ListItem>
              ))}
            </List>
          )}

          {/* Debug viewer - remove this in production */}
          <JsonViewer
            data={{
              selectedGroup,
              groupMembers: groupMembers.slice(0, 3), // Show only first 3 for debugging
              allContactsCount: allContacts.length,
            }}
            title="Group Debug Info"
          />
        </Box>
      )}
    </Popover>
  );
};

export default GroupInfoPopover;
