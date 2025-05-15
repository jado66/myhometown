export const findDuplicateContact = (contact, currentContacts) => {
  if (!currentContacts || !contact.phone) return null;

  const normalizedPhone = formatPhoneNumber(contact.phone);

  // Check in user contacts
  if (currentContacts.userContacts) {
    const duplicate = currentContacts.userContacts.find(
      (existingContact) =>
        formatPhoneNumber(existingContact.phone) === normalizedPhone
    );
    if (duplicate) return duplicate;
  }

  // Check in community contacts
  if (currentContacts.communityContacts) {
    for (const communityId in currentContacts.communityContacts) {
      const communityContacts = currentContacts.communityContacts[communityId];
      if (Array.isArray(communityContacts)) {
        const duplicate = communityContacts.find(
          (existingContact) =>
            formatPhoneNumber(existingContact.phone) === normalizedPhone
        );
        if (duplicate) return duplicate;
      }
    }
  }

  // Check in city contacts
  if (currentContacts.cityContacts) {
    for (const cityId in currentContacts.cityContacts) {
      const cityContacts = currentContacts.cityContacts[cityId];
      if (Array.isArray(cityContacts)) {
        const duplicate = cityContacts.find(
          (existingContact) =>
            formatPhoneNumber(existingContact.phone) === normalizedPhone
        );
        if (duplicate) return duplicate;
      }
    }
  }

  return null;
};

export const parseGroups = (groupsData) => {
  if (!groupsData) return [];

  // If already an array, return it
  if (Array.isArray(groupsData)) return groupsData;

  // If it's a string, try to parse it as JSON
  if (typeof groupsData === "string") {
    try {
      return JSON.parse(groupsData);
    } catch (error) {
      // If it fails to parse as JSON, treat it as a semicolon-separated string
      return groupsData
        .split(";")
        .filter(Boolean)
        .map((g) => g.trim());
    }
  }

  return [];
};
