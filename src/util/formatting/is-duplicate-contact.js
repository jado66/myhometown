export const isDuplicateContact = (contact, contacts) => {
  if (!contact || !contacts) return false;

  // We now allow duplicate phone numbers unless FIRST + LAST NAME and PHONE all match
  // Normalize comparison fields (trim + lowercase for names, digits only for phone)
  const normalizePhone = (p) => (p ? p.replace(/\D/g, "") : "");
  const normalizeName = (n) => (n ? n.toString().trim().toLowerCase() : "");

  const phone = normalizePhone(contact.phone);
  const first = normalizeName(contact.first_name);
  const last = normalizeName(contact.last_name);

  if (!phone) return false; // If no phone, skip duplicate logic

  const isSameIdentity = (existingContact) => {
    if (!existingContact) return false;
    // Skip self when updating
    if (existingContact.id && contact.id && existingContact.id === contact.id)
      return false;
    return (
      normalizePhone(existingContact.phone) === phone &&
      normalizeName(existingContact.first_name) === first &&
      normalizeName(existingContact.last_name) === last
    );
  };

  // Helper to scan an array
  const arrayHasDuplicate = (arr) =>
    Array.isArray(arr) ? arr.some(isSameIdentity) : false;

  if (arrayHasDuplicate(contacts.userContacts)) return true;

  if (contacts.communityContacts) {
    for (const communityId in contacts.communityContacts) {
      if (arrayHasDuplicate(contacts.communityContacts[communityId]))
        return true;
    }
  }

  if (contacts.cityContacts) {
    for (const cityId in contacts.cityContacts) {
      if (arrayHasDuplicate(contacts.cityContacts[cityId])) return true;
    }
  }

  return false;
};
