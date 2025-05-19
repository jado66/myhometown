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
import ClassRecipientsLoader from "@/components/texting/send/ClassRecipientsLoader";
import { expandGroups, formatGroupsForSelect } from "@/util/texting/utils";
import { useClasses } from "@/hooks/use-classes";

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
  const [className, setClassName] = useState("");
  const redisHealth = useRedisHealth(60000);

  const { getClass } = useClasses();

  // Helper function to determine file type from URL
  const getFileTypeFromUrl = (url) => {
    const extension = url.split(".").pop().toLowerCase();

    // Map common extensions to MIME types
    const mimeTypes = {
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      gif: "image/gif",
      webp: "image/webp",
      pdf: "application/pdf",
      mp4: "video/mp4",
      mov: "video/quicktime",
      mp3: "audio/mpeg",
    };

    return mimeTypes[extension] || "image/jpeg"; // Default to image/jpeg if unknown
  };

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
        label: `${contact.first_name} ${contact.last_name} - ${contact.phone}`,
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
          {/* <Info
            style={{ cursor: "pointer", marginLeft: "8px" }}
            onClick={(e) =>
              handleGroupInfoClick(e, {
                value: `group:${groupValue}`,
                label: groupValue,
              })
            }
          /> */}
        </div>
      ),
      originalValue: groupValue,
    }));

    setGroups(groupsArray);
  }, [contacts, user?.isAdmin]);

  // Updated URL parameter handling to support multiple recipients and media URLs
  useEffect(() => {
    const phone = searchParams.get("phone");
    const urlMessage = searchParams.get("message");
    const urlMediaUrls = searchParams.get("mediaUrls");
    const classId = searchParams.get("classId"); // New: Check for class ID in URL.
    const classNameFromUrl = searchParams.get("classTitle"); // New: Check for class name in URL.

    if (urlMessage) setMessage(decodeURIComponent(urlMessage));

    // Handle multiple phone numbers separated by commas
    if (phone) {
      const phoneNumbers = phone.split(",").map((number) => {
        return { value: number.trim(), label: `${number.trim()}` };
      });
      setSelectedRecipients(phoneNumbers);
    }

    // Handle class ID from URL - we'll implement this function next
    if (classId) {
      handleLoadClassFromUrl(classId);
    }

    // Set class name if provided in the URL
    if (classNameFromUrl) {
      setClassName(decodeURIComponent(classNameFromUrl));
    }

    // Handle media URLs passed in the URL
    if (urlMediaUrls) {
      try {
        // First decode the URL parameter
        const decodedUrlMediaUrls = decodeURIComponent(urlMediaUrls);

        // Check if it starts with '[' to determine if it's already a JSON string
        let mediaUrlsArray = [];

        if (decodedUrlMediaUrls.startsWith("[")) {
          // It's a JSON array string, parse it
          mediaUrlsArray = JSON.parse(decodedUrlMediaUrls);
        } else {
          // It's a single URL or comma-separated URLs
          mediaUrlsArray = decodedUrlMediaUrls.split(",");
        }

        // Convert URLs to media file format expected by the component
        const newMediaFiles = mediaUrlsArray.map((url, index) => {
          // Remove any surrounding quotes if present
          const cleanUrl = url.replace(/^["'](.*)["']$/, "$1");
          const filename = cleanUrl.substring(cleanUrl.lastIndexOf("/") + 1);

          return {
            id: `url-media-${index}`,
            name: filename,
            url: cleanUrl,
            // Add preview property for MediaPreview component
            preview: cleanUrl,
            // Set type based on file extension or default to image/jpeg
            type: getFileTypeFromUrl(cleanUrl),
            // We don't know the size from just the URL
            size: 0,
          };
        });

        setMediaFiles(newMediaFiles);

        // Calculate total file size (we'll set to 0 since we don't know the actual size)
        setTotalFileSize(0);

        console.log("Media files set from URL:", newMediaFiles);
      } catch (error) {
        console.error(
          "Failed to parse mediaUrls parameter:",
          error,
          urlMediaUrls
        );
      }
    }
  }, [searchParams]);

  // Function to load class members from URL parameter
  const handleLoadClassFromUrl = async (classId) => {
    try {
      // Import useClasses hook dynamically to avoid circular dependencies

      const classData = await getClass(classId);

      if (
        !classData ||
        !classData.signups ||
        !Array.isArray(classData.signups)
      ) {
        console.error("Could not load class data or no signups found");
        return;
      }

      // Filter and format class signups with phone numbers
      const classRecipients = classData.signups
        .filter((signup) => signup.phone)
        .map((signup) => ({
          value: signup.phone,
          label: `${signup.first_name || ""} ${signup.last_name || ""} (${
            signup.phone
          })`.trim(),
          contactId: signup.id || null,
          firstName: signup.first_name || "",
          lastName: signup.last_name || "",
          phone: signup.phone,
          email: signup.email || "",
          groups: [],
          ownerType: "class",
          ownerId: classId,
        }));

      if (classRecipients.length > 0) {
        setSelectedRecipients((prevRecipients) => {
          // Merge with existing recipients, avoiding duplicates by phone number
          const phoneSet = new Set(prevRecipients.map((r) => r.value));
          const newRecipients = classRecipients.filter(
            (r) => !phoneSet.has(r.value)
          );
          return [...prevRecipients, ...newRecipients];
        });

        toast.success(`Loaded ${classRecipients.length} recipients from class`);
      } else {
        toast.warning("No valid recipients found in class signups");
      }
    } catch (error) {
      console.error("Error loading class from URL:", error);
      toast.error("Failed to load class recipients");
    }
  };

  // New function to handle adding recipients from ClassRecipientsLoader
  const handleAddClassRecipients = (newRecipients) => {
    if (!newRecipients || newRecipients.length === 0) return;

    // Add new recipients while avoiding duplicates by phone number
    setSelectedRecipients((prevRecipients) => {
      const phoneSet = new Set(prevRecipients.map((r) => r.value));
      const filteredNewRecipients = newRecipients.filter(
        (r) => !phoneSet.has(r.value)
      );

      if (filteredNewRecipients.length === 0) {
        toast.info(
          "All selected class members are already in your recipient list"
        );
        return prevRecipients;
      }

      toast.success(
        `Added ${filteredNewRecipients.length} recipients from class`
      );
      return [...prevRecipients, ...filteredNewRecipients];
    });
  };

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
      // Pass selectedRecipients as the 5th parameter to track groups
      await sendMessages(
        message,
        uniqueRecipients,
        mediaUrls,
        user,
        selectedRecipients
      );
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
        text={activeTab === 0 ? "Back" : "Edit Message"}
        onClick={activeTab === 0 ? undefined : () => setActiveTab(0)}
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
                  {/* Add the Class Recipients Loader above the Recipient Selector */}
                  {/* <ClassRecipientsLoader
                    onAddRecipients={handleAddClassRecipients}
                  /> */}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mb: 2,
                    }}
                  >
                    <Typography
                      variant="h6"
                      sx={{ mb: 0, textAlign: "center" }}
                    >
                      Compose Message
                    </Typography>
                  </Box>

                  {className && (
                    <Typography variant="h6" sx={{ mb: 2 }}>
                      Class: {className}
                    </Typography>
                  )}

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

      {/* <GroupInfoPopover
        anchorEl={anchorEl}
        onClose={handleClosePopover}
        selectedGroup={selectedGroup}
        allContacts={getFilteredContactsForGroup(selectedGroup, allContacts)} // Filter contacts based on admin status
      /> */}
    </>
  );
}
