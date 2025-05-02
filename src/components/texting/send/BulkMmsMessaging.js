import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CssBaseline,
  CircularProgress,
  Alert,
  AlertTitle,
  Typography,
  Button,
} from "@mui/material";
import { Send, Info } from "@mui/icons-material";
import BackButton from "@/components/BackButton";
import { useSendSMS } from "@/hooks/communications/useSendSMS";
import { useRedisHealth } from "@/hooks/health/useRedisHealth";
import { useSearchParams } from "next/navigation";
import { useUserContacts } from "@/hooks/useUserContacts";
import { useUser } from "@/hooks/use-user";
import { toast } from "react-toastify";
import RecipientSelector from "./RecipientSelector";
import MessageComposer from "./MessageComposer";
import ReviewAndSend from "./ReviewAndSend";
import ProgressTracker from "./ProgressTracker";
import GroupInfoPopover from "./GroupInfoPopover";
import { expandGroups, formatGroupsForSelect } from "@/util/texting/utils";

export default function BulkMMSMessaging() {
  const searchParams = useSearchParams();
  const { user } = useUser();
  const {
    contacts,
    loading: contactsLoading,
    error: contactsError,
    refreshContacts,
  } = useUserContacts(
    user?.id,
    user?.communities_details?.map((c) => c.id) || [],
    user?.cities_details?.map((c) => c.id) || []
  );
  const [message, setMessage] = useState("");
  const [allContacts, setAllContacts] = useState([]);
  const [groups, setGroups] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedGroup, setSelectedGroup] = useState(null);
  const { sendStatus, progress, sendMessages, reset } = useSendSMS();
  const [hasSent, setHasSent] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [mediaFiles, setMediaFiles] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [totalFileSize, setTotalFileSize] = useState(0);
  const redisHealth = useRedisHealth(60000);

  useEffect(() => {
    if (!contacts) return;
    let contactsList = [];

    // Only include user contacts if the user is an admin
    if (
      user?.isAdmin &&
      contacts.userContacts &&
      Array.isArray(contacts.userContacts)
    ) {
      contactsList = [...contacts.userContacts];
    } else if (contacts.userContacts && Array.isArray(contacts.userContacts)) {
      // For non-admin users, include contacts but will handle groups differently
      contactsList = [...contacts.userContacts];
    }

    // Include community contacts for all users
    if (contacts.communityContacts) {
      Object.values(contacts.communityContacts).forEach(
        (communityContactList) => {
          if (Array.isArray(communityContactList)) {
            contactsList = [...contactsList, ...communityContactList];
          }
        }
      );
    }

    // Include city contacts for all users
    if (contacts.cityContacts) {
      Object.values(contacts.cityContacts).forEach((cityContactList) => {
        if (Array.isArray(cityContactList)) {
          contactsList = [...contactsList, ...cityContactList];
        }
      });
    }

    // Format the contacts for use in the UI
    const formattedContacts = contactsList.map((contact) => {
      let contactGroups = contact.groups || [];
      if (typeof contact.groups === "string") {
        try {
          contactGroups = JSON.parse(contact.groups);
        } catch (error) {
          console.error("Failed to parse groups:", error);
          contactGroups = [];
        }
      }

      return {
        value: contact.phone,
        label: `${contact.first_name} ${contact.last_name} (${contact.phone})`,
        contactId: contact.id,
        firstName: contact.first_name,
        lastName: contact.last_name,
        phone: contact.phone,
        email: contact.email,
        groups: Array.isArray(contactGroups) ? contactGroups : [],
        ownerType: contact.owner_type, // Add owner type to track the contact source
        ownerId: contact.owner_id, // Add owner ID to track the contact source
      };
    });

    setAllContacts(formattedContacts);

    // Extract unique groups based on admin status and ownership
    const uniqueGroups = new Set();

    formattedContacts.forEach((contact) => {
      if (contact.groups && Array.isArray(contact.groups)) {
        // For user contacts, only include groups if user is admin
        if (contact.ownerType === "user") {
          if (user?.isAdmin) {
            contact.groups.forEach((group) => uniqueGroups.add(group));
          }
        } else {
          // For community and city contacts, include all groups
          contact.groups.forEach((group) => uniqueGroups.add(group));
        }
      }
    });

    // Create the groups array for the UI
    const groupsArray = Array.from(uniqueGroups).map((groupValue) => ({
      value: `group:${groupValue}`,
      label: (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <span>{`Group: ${groupValue}`}</span>
          <Info
            style={{ cursor: "pointer", marginLeft: "8px" }}
            onClick={(e) =>
              handleGroupInfoClick(e, {
                value: `group:${groupValue}`,
                label: groupValue,
              })
            }
          />
        </div>
      ),
      originalValue: groupValue,
    }));

    setGroups(groupsArray);
  }, [contacts, user?.isAdmin]);

  useEffect(() => {
    const phone = searchParams.get("phone");
    const urlMessage = searchParams.get("message");
    if (urlMessage) setMessage(decodeURIComponent(urlMessage));
    if (phone) setSelectedRecipients([{ value: phone, label: `${phone}` }]);
  }, [searchParams]);

  useEffect(() => {
    setHasSent(false);
    setIsSending(false);
  }, [message, selectedRecipients, mediaFiles]);

  // Helper function to expand groups but filter out user groups for non-admin users
  const expandGroupsWithAdminFilter = (selectedRecipients, allContacts) => {
    // Use the existing expandGroups function from utils
    const expanded = expandGroups(selectedRecipients, allContacts);

    // If user is not admin, filter out contacts from user groups in the expanded result
    if (!user?.isAdmin) {
      return expanded.map((group) => {
        // For group entries, filter the contacts
        if (group.isGroup) {
          return {
            ...group,
            contacts: group.contacts.filter(
              (contact) =>
                // Keep contacts that aren't from user groups
                contact.ownerType !== "user"
            ),
          };
        }
        // For individual contacts, keep them all (they were selected directly)
        return group;
      });
    }

    return expanded;
  };

  const handleSend = async () => {
    const phoneNumberMap = new Map();
    const uniqueRecipients = [];

    // Use the filtered expansion function
    const expandedRecipients = expandGroupsWithAdminFilter(
      selectedRecipients,
      allContacts
    ).flatMap((group) => group.contacts);

    expandedRecipients.forEach((recipient) => {
      if (!phoneNumberMap.has(recipient.value)) {
        phoneNumberMap.set(recipient.value, true);
        uniqueRecipients.push(recipient);
      }
    });

    try {
      const mediaUrls = mediaFiles.map((file) => file.url);
      setIsSending(true);
      await sendMessages(message, uniqueRecipients, mediaUrls, user);
      setHasSent(true);
      setIsSending(false);
    } catch (error) {
      console.error("Error sending messages:", error);
      toast.error("Failed to send messages: " + error.message);
      setIsSending(false);
    }
  };

  const handleGroupInfoClick = (event, group) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
    setSelectedGroup(group);
  };

  const handleClosePopover = () => {
    setAnchorEl(null);
    setSelectedGroup(null);
  };

  const handleNewMessage = () => {
    setMessage("");
    setSelectedRecipients([]);
    setMediaFiles([]);
    setHasSent(false);
    setTotalFileSize(0);
    setIsSending(false);
    reset();
    setActiveTab(0);
  };

  // Updated GroupInfoPopover to respect admin permissions
  const getFilteredContactsForGroup = (group, allContacts) => {
    if (!group || !group.originalValue) return [];

    return allContacts.filter((contact) => {
      // Check if contact has this group
      const hasGroup =
        contact.groups &&
        Array.isArray(contact.groups) &&
        contact.groups.includes(group.originalValue);

      // If not admin, hide user contacts in group info
      if (!user?.isAdmin && contact.ownerType === "user") {
        return false;
      }

      return hasGroup;
    });
  };

  if (!redisHealth.isConnected && !redisHealth.isLoading) {
    return (
      <Alert
        severity="error"
        sx={{ position: "sticky", top: "64px", zIndex: 1000, mx: 3, mt: 2 }}
      >
        <AlertTitle>Texting Service Unavailable</AlertTitle>
        The messaging service is currently experiencing technical difficulties.
        Please try again later.
        {redisHealth.lastChecked && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            Last checked: {new Date(redisHealth.lastChecked).toLocaleString()}
          </Typography>
        )}
      </Alert>
    );
  }

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
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          {contactsLoading ? (
            <Box sx={{ display: "flex", justifyContent: "center", my: 4 }}>
              <CircularProgress />
              <Typography variant="body1" sx={{ ml: 2 }}>
                Loading contacts...
              </Typography>
            </Box>
          ) : contactsError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              Error loading contacts: {contactsError}
            </Alert>
          ) : (
            <>
              {allContacts.length === 0 && (
                <Alert severity="info">
                  You don't have any contacts in your Directory. Visit your{" "}
                  <a href="./directory">Contact Directory</a> to add contacts.
                </Alert>
              )}
              {activeTab === 0 && (
                <>
                  <RecipientSelector
                    selectedRecipients={selectedRecipients}
                    onRecipientChange={setSelectedRecipients}
                    allContacts={allContacts}
                    groups={groups}
                    user={user}
                    contacts={contacts}
                    onRefreshContacts={refreshContacts}
                  />
                  <MessageComposer
                    message={message}
                    onMessageChange={setMessage}
                    mediaFiles={mediaFiles}
                    setMediaFiles={setMediaFiles}
                    totalFileSize={totalFileSize}
                    setTotalFileSize={setTotalFileSize}
                    isUploading={isUploading}
                    setIsUploading={setIsUploading}
                  />
                  <Button
                    sx={{ mt: 2 }}
                    variant="contained"
                    color="primary"
                    onClick={() => setActiveTab(2)}
                    startIcon={<Send />}
                    disabled={selectedRecipients.length === 0}
                  >
                    Review and Send
                  </Button>
                </>
              )}
              {activeTab === 2 && (
                <ReviewAndSend
                  selectedRecipients={selectedRecipients}
                  allContacts={allContacts}
                  message={message}
                  mediaFiles={mediaFiles}
                  onSend={handleSend}
                  hasSent={hasSent}
                  isSending={isSending}
                  onNewMessage={handleNewMessage}
                  user={user}
                  expandGroups={expandGroupsWithAdminFilter} // Use custom expand function that respects admin status
                />
              )}
            </>
          )}
        </Box>
      </Card>

      <ProgressTracker
        sendStatus={sendStatus}
        progress={progress}
        onReset={reset}
      />

      <Box
        sx={{
          padding: 2,
          ml: 3,
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          <strong>Note:</strong> Text messages sent through this system are
          stored in the database. Please do not use this service for your own
          personal use. Please do not include sensitive information.
        </Typography>
      </Box>

      <GroupInfoPopover
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        selectedGroup={selectedGroup}
        allContacts={getFilteredContactsForGroup(selectedGroup, allContacts)} // Filter contacts based on admin status
      />
    </>
  );
}
