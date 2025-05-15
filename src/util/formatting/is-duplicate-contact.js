export const isDuplicateContact = (contact, contacts) => {
  if (!contact || !contact.phone || !contacts) return false;

  // Phone-based duplicate detection (primary method)
  // First normalize the phone number for comparison
  const normalizedPhone = contact.phone.replace(/\D/g, "");
  if (normalizedPhone.length < 10) return false; // Skip validation for incomplete phone numbers

  // Check user contacts
  if (Array.isArray(contacts.userContacts)) {
    const isDuplicate = contacts.userContacts.some((existingContact) => {
      const existingPhone = existingContact.phone?.replace(/\D/g, "") || "";
      return (
        normalizedPhone === existingPhone && existingContact.id !== contact.id
      );
    });
    if (isDuplicate) return true;
  }

  // Check community contacts
  if (contacts.communityContacts) {
    for (const communityId in contacts.communityContacts) {
      const communityContacts = contacts.communityContacts[communityId];
      if (Array.isArray(communityContacts)) {
        const isDuplicate = communityContacts.some((existingContact) => {
          const existingPhone = existingContact.phone?.replace(/\D/g, "") || "";
          return (
            normalizedPhone === existingPhone &&
            existingContact.id !== contact.id
          );
        });
        if (isDuplicate) return true;
      }
    }
  }

  // Check city contacts
  if (contacts.cityContacts) {
    for (const cityId in contacts.cityContacts) {
      const cityContacts = contacts.cityContacts[cityId];
      if (Array.isArray(cityContacts)) {
        const isDuplicate = cityContacts.some((existingContact) => {
          const existingPhone = existingContact.phone?.replace(/\D/g, "") || "";
          return (
            normalizedPhone === existingPhone &&
            existingContact.id !== contact.id
          );
        });
        if (isDuplicate) return true;
      }
    }
  }

  return false;
};
