// @util/texting/utils.js
export const formatFileSize = (bytes) => {
  if (bytes === 0) return null;
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

export const formatTimestamp = (timestamp) => {
  try {
    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date");
    }
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  } catch (error) {
    console.warn("Invalid timestamp:", timestamp);
    return "Time unavailable";
  }
};

// Convert array of group strings to react-select format
export const formatGroupsForSelect = (groups) => {
  if (!groups || !Array.isArray(groups)) return [];
  return groups.map((group) => ({
    value: group,
    label: group,
  }));
};

// Convert react-select format back to array of strings
export const formatGroupsForSave = (groupObjects) => {
  if (!groupObjects || !Array.isArray(groupObjects)) return [];
  return groupObjects.map((group) => group.value);
};

export const expandGroups = (recipients, allContacts) => {
  return recipients.map((recipient) => {
    if (
      typeof recipient.value === "string" &&
      recipient.value.startsWith("group:")
    ) {
      const groupName = recipient.value.replace("group:", "");
      const groupContacts = allContacts.filter((contact) => {
        if (!contact.groups || !Array.isArray(contact.groups)) return false;
        return contact.groups.includes(groupName);
      });
      return { groupName, contacts: groupContacts };
    }
    return { groupName: "Individual Contacts", contacts: [recipient] };
  });
};

export const getGroupMembers = (groupValue, allContacts) => {
  return allContacts.filter((contact) => {
    let contactGroups = contact.groups || [];
    // Handle JSON string case
    if (typeof contact.groups === "string") {
      try {
        contactGroups = JSON.parse(contact.groups);
      } catch (error) {
        console.error("Failed to parse contact groups:", error);
        contactGroups = [];
      }
    }
    // Ensure contactGroups is an array
    if (!Array.isArray(contactGroups)) return false;
    // Check if groupValue is included
    return contactGroups.includes(groupValue);
  });
};
