// @util/texting/utils.js
export const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";
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

export const expandGroups = (recipients, allContacts) => {
  return recipients.map((recipient) => {
    if (
      typeof recipient.value === "string" &&
      recipient.value.startsWith("group:")
    ) {
      const groupName = recipient.value.replace("group:", "");
      const groupContacts = allContacts.filter((contact) => {
        if (!contact.groups || !Array.isArray(contact.groups)) return false;
        return contact.groups.some((group) =>
          typeof group === "string"
            ? group === groupName
            : group.value === groupName
        );
      });
      return { groupName, contacts: groupContacts };
    }
    return { groupName: "Individual Contacts", contacts: [recipient] };
  });
};

export const getGroupMembers = (groupValue, allContacts) => {
  return allContacts.filter((contact) => {
    if (!contact.groups || !Array.isArray(contact.groups)) return false;
    return contact.groups.some((group) =>
      typeof group === "string"
        ? group === groupValue
        : group.value === groupValue
    );
  });
};
