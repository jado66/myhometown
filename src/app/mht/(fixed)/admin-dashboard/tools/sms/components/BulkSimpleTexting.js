import React, { useState, useEffect } from "react";
import {
  Box,
  CssBaseline,
  Card,
  Typography,
  TextField,
  Button,
  Paper,
  Popover,
  List,
  ListItem,
  ListItemText,
  Divider,
} from "@mui/material";
import { Message, People, Send, Info } from "@mui/icons-material";
import Select from "react-select";
import BackButton from "@/components/BackButton";

export default function BulkSimpleTexting() {
  const [message, setMessage] = useState("");
  const [contacts, setContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);

  useEffect(() => {
    const savedContacts = JSON.parse(localStorage.getItem("contacts")) || [];
    const savedGroups = JSON.parse(localStorage.getItem("groups")) || [];
    setContacts(savedContacts);
    setGroups(savedGroups);
  }, []);

  const expandGroups = (recipients) => {
    return recipients.map((recipient) => {
      if (recipient.value.startsWith("group:")) {
        const groupName = recipient.value.replace("group:", "");
        const groupContacts = contacts.filter((contact) =>
          contact.groups.some((g) => g.value === groupName)
        );
        return {
          groupName: recipient.label.props.children[0].props.children,
          contacts: groupContacts.map((contact) => ({
            value: contact.id,
            label: `${contact.name} (${contact.phone})`,
          })),
        };
      }
      return {
        groupName: "Individual Contacts",
        contacts: [recipient],
      };
    });
  };

  const handleSend = () => {
    const expandedRecipients = expandGroups(selectedRecipients).flatMap(
      (group) => group.contacts
    );
    console.log("Sending message:", message);
    console.log("To recipients:", expandedRecipients);
    alert(JSON.stringify({ message, recipients: expandedRecipients }, null, 2));
  };

  const handleRecipientSelection = (selected) => {
    setSelectedRecipients(selected);
  };

  const handleGroupInfoClick = (event, group) => {
    setAnchorEl(event.currentTarget);
    setSelectedGroup(group);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setSelectedGroup(null);
  };

  const getGroupMembers = (groupValue) => {
    return contacts.filter((contact) =>
      contact.groups.some((g) => g.value === groupValue)
    );
  };

  return (
    <>
      <BackButton
        top="0px"
        text={activeTab === 0 ? "Back to Admin Dashboard" : "Edit Message"}
        onClick={activeTab === 0 ? null : () => setActiveTab(0)}
      />
      <Card
        sx={{
          width: "100%",
          m: 3,
          mt: 5,
          p: 3,
          display: "flex",
          flexDirection: "column",
          boxShadow: "none",
          overflowX: "auto",
        }}
      >
        <Box>
          <CssBaseline />

          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            {activeTab === 0 && (
              <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Compose Message
                </Typography>
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  variant="outlined"
                  label="Message"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Typography variant="subtitle1" gutterBottom>
                  Select Recipients
                </Typography>
                <Select
                  isMulti
                  options={[
                    ...contacts.map((c) => ({
                      value: c.id,
                      label: `${c.name} (${c.phone})`,
                    })),
                    ...groups.map((g) => ({
                      value: `group:${g.value}`,
                      label: (
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                          }}
                        >
                          <span>{`Group: ${g.label}`}</span>
                          <Info
                            style={{ cursor: "pointer", marginLeft: "8px" }}
                            onClick={(e) => handleGroupInfoClick(e, g)}
                          />
                        </div>
                      ),
                    })),
                  ]}
                  value={selectedRecipients}
                  onChange={handleRecipientSelection}
                  placeholder="Select recipients or groups"
                />

                <Button
                  sx={{ mt: 2 }}
                  variant="contained"
                  color="primary"
                  onClick={() => setActiveTab(2)}
                  startIcon={<Send />}
                >
                  Review and Send
                </Button>
              </Paper>
            )}

            {activeTab === 2 && (
              <Paper elevation={3} sx={{ p: 2, mt: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Review and Send
                </Typography>
                <Typography variant="body1" gutterBottom>
                  Message:
                </Typography>
                <Paper
                  elevation={1}
                  sx={{ p: 2, mb: 2, backgroundColor: "grey.100" }}
                >
                  <Typography>{message}</Typography>
                </Paper>
                <Typography variant="body1" gutterBottom>
                  Selected Recipients:
                </Typography>
                <Paper
                  elevation={1}
                  sx={{ p: 2, mb: 2, backgroundColor: "grey.100" }}
                >
                  {expandGroups(selectedRecipients).map((group, index) => (
                    <Box key={index} sx={{ mb: 2 }}>
                      <Typography
                        variant="subtitle1"
                        sx={{ fontWeight: "bold" }}
                      >
                        {group.groupName}
                      </Typography>
                      <List dense>
                        {group.contacts.map((contact) => (
                          <ListItem key={contact.value}>
                            <ListItemText primary={contact.label} />
                          </ListItem>
                        ))}
                      </List>
                      {index < expandGroups(selectedRecipients).length - 1 && (
                        <Divider />
                      )}
                    </Box>
                  ))}
                </Paper>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSend}
                  startIcon={<Send />}
                >
                  Send
                </Button>
              </Paper>
            )}
          </Box>
        </Box>
      </Card>
      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "left",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "left",
        }}
      >
        {selectedGroup && (
          <Box sx={{ p: 2, maxWidth: 300 }}>
            <Typography variant="h6" gutterBottom>
              {selectedGroup.label} Members
            </Typography>
            <List dense>
              {getGroupMembers(selectedGroup.value).map((contact) => (
                <ListItem key={contact.id}>
                  <ListItemText
                    primary={contact.name}
                    secondary={`${contact.phone} | ${contact.email}`}
                  />
                </ListItem>
              ))}
            </List>
          </Box>
        )}
      </Popover>
    </>
  );
}
