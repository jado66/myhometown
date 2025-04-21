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

const GroupInfoPopover = ({
  anchorEl,
  onClose,
  selectedGroup,
  allContacts,
}) => (
  <Popover
    open={Boolean(anchorEl)}
    anchorEl={anchorEl}
    onClose={onClose}
    anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
    transformOrigin={{ vertical: "top", horizontal: "left" }}
  >
    {selectedGroup && (
      <Box sx={{ p: 2, maxWidth: 300 }}>
        <Typography variant="h6" gutterBottom>
          {selectedGroup.label} Members
        </Typography>
        <List dense>
          {getGroupMembers(selectedGroup.originalValue, allContacts).map(
            (contact) => (
              <ListItem key={contact.contactId}>
                <ListItemText
                  primary={`${contact.firstName} ${contact.lastName}`}
                  secondary={`${contact.phone} | ${
                    contact.email || "No email"
                  }`}
                />
              </ListItem>
            )
          )}
        </List>
      </Box>
    )}
  </Popover>
);

export default GroupInfoPopover;
