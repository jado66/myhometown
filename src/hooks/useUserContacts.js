import { formatPhoneNumber } from "@/util/formatting/format-phone-number";
import { isDuplicateContact } from "@/util/formatting/is-duplicate-contact";
import { supabase } from "@/util/supabase";
import { useState, useEffect, useCallback } from "react";
import { toast } from "react-toastify";

export function useUserContacts(userId, userCommunities, userCities) {
  const [contacts, setContacts] = useState({
    userContacts: [],
    communityContacts: {},
    cityContacts: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [hasInitialized, setHasInitialized] = useState(false);

  // Fetch all contacts
  const fetchContacts = useCallback(async () => {
    if (!userId) {
      setLoading(false);
      return;
    }

    try {
      const fetchedContacts = await fetchUserContacts(
        userId,
        userCommunities,
        userCities,
      );
      setContacts(fetchedContacts);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }

    console.log(
      "fetching contacts" +
        JSON.stringify({
          userId,
          userCommunities,
          userCities,
        }),
    );
  }, [userId, userCommunities, userCities]);

  // Initial fetch
  useEffect(() => {
    if (!userId) {
      setContacts({
        userContacts: [],
        communityContacts: {},
        cityContacts: {},
      });
      setError(null);
      setLoading(false);
      return;
    }

    if (!hasInitialized) {
      setHasInitialized(true);
    } else {
      fetchContacts();
    }
    // fetchContacts();
  }, [hasInitialized, userId]);

  // Add new contact
  const addContact = async (newContactData, noToast) => {
    try {
      // Format the phone number
      const formattedContactData = {
        ...newContactData,
        phone: formatPhoneNumber(newContactData.phone),
      };

      // Check for duplicates
      const isDuplicate = await isDuplicateContact(
        formattedContactData,
        contacts,
      );
      if (isDuplicate) {
        return {
          data: null,
          error:
            "A contact with the same first name, last name, and phone already exists",
        };
      }

      const contact = {
        ...formattedContactData,
        owner_id:
          formattedContactData.owner_type === "user"
            ? userId
            : formattedContactData.owner_id,
        created_at: new Date(),
        updated_at: new Date(),
      };

      const { data, error } = await supabase
        .from("contacts")
        .insert([contact])
        .select();

      if (error) throw error;

      // Update the appropriate contacts list based on owner_type
      setContacts((prev) => {
        const updated = { ...prev };

        if (contact.owner_type === "user") {
          updated.userContacts = [...prev.userContacts, data[0]];
        } else if (contact.owner_type === "community") {
          const communityId = contact.owner_id;
          if (!updated.communityContacts[communityId]) {
            updated.communityContacts[communityId] = [];
          }
          updated.communityContacts[communityId] = [
            ...updated.communityContacts[communityId],
            data[0],
          ];
        } else if (contact.owner_type === "city") {
          const cityId = contact.owner_id;
          if (!updated.cityContacts[cityId]) {
            updated.cityContacts[cityId] = [];
          }
          updated.cityContacts[cityId] = [
            ...updated.cityContacts[cityId],
            data[0],
          ];
        }

        return updated;
      });

      if (!noToast) {
        toast.success("Contact added successfully");
      }
      return { data: data[0], error: null };
    } catch (error) {
      if (!noToast) {
        toast.error("Failed to add contact");
      }

      return { data: null, error: error.message };
    }
  };

  // Update existing contact
  const updateContact = async (id, updatedData, noToast) => {
    try {
      // Format the phone number
      const formattedData = {
        ...updatedData,
        phone: formatPhoneNumber(updatedData.phone),
      };

      // Check if the updated phone would create a duplicate
      // We need to exclude the current contact from the duplicate check
      const contactToCheck = { ...formattedData, id };
      const isDuplicate = await isDuplicateContact(contactToCheck, contacts);
      if (isDuplicate) {
        return {
          data: null,
          error:
            "A contact with the same first name, last name, and phone already exists",
        };
      }

      const dataToUpdate = {
        ...formattedData,
        owner_id:
          formattedData.owner_type === "user" ? userId : formattedData.owner_id,
        updated_at: new Date(),
      };

      const { data, error } = await supabase
        .from("contacts")
        .update(dataToUpdate)
        .eq("id", id)
        .select();

      if (error) throw error;

      // Update the appropriate contacts list
      setContacts((prev) => {
        const updated = { ...prev };

        // Update in userContacts if found
        updated.userContacts = prev.userContacts.map((contact) =>
          contact.id === id ? { ...contact, ...formattedData } : contact,
        );

        // Update in communityContacts if found
        Object.keys(prev.communityContacts).forEach((communityId) => {
          updated.communityContacts[communityId] = prev.communityContacts[
            communityId
          ].map((contact) =>
            contact.id === id ? { ...contact, ...formattedData } : contact,
          );
        });

        // Update in cityContacts if found
        Object.keys(prev.cityContacts).forEach((cityId) => {
          updated.cityContacts[cityId] = prev.cityContacts[cityId].map(
            (contact) =>
              contact.id === id ? { ...contact, ...formattedData } : contact,
          );
        });

        return updated;
      });

      if (!noToast) {
        toast.success("Contact updated successfully");
      }
      return { data: data[0], error: null };
    } catch (error) {
      if (!noToast) {
        toast.error("Failed to update contact");
      }
      return { data: null, error: error.message };
    }
  };

  const moveContact = async (contactId, newOwnerType, newOwnerId) => {
    try {
      const { data, error } = await supabase
        .from("contacts")
        .update({
          owner_type: newOwnerType,
          owner_id: newOwnerId,
          updated_at: new Date(),
        })
        .eq("id", contactId)
        .select();

      if (error) throw error;

      toast.success("Contact moved successfully");

      // Refresh contacts after moving
      await fetchContacts();
      return { data: data[0], error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  // Delete contact
  const deleteContact = async (id) => {
    try {
      const { error } = await supabase.from("contacts").delete().eq("id", id);

      if (error) throw error;

      // Remove from all contact lists
      setContacts((prev) => {
        const updated = { ...prev };

        // Remove from userContacts
        updated.userContacts = prev.userContacts.filter(
          (contact) => contact.id !== id,
        );

        // Remove from communityContacts
        Object.keys(prev.communityContacts).forEach((communityId) => {
          updated.communityContacts[communityId] = prev.communityContacts[
            communityId
          ].filter((contact) => contact.id !== id);
        });

        // Remove from cityContacts
        Object.keys(prev.cityContacts).forEach((cityId) => {
          updated.cityContacts[cityId] = prev.cityContacts[cityId].filter(
            (contact) => contact.id !== id,
          );
        });

        return updated;
      });

      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  // Bulk delete contacts
  const bulkDeleteContacts = async (ids) => {
    if (!Array.isArray(ids) || ids.length === 0) {
      return { error: null };
    }

    try {
      const { error } = await supabase.from("contacts").delete().in("id", ids);

      if (error) throw error;

      // Remove from all contact lists
      setContacts((prev) => {
        const updated = { ...prev };

        updated.userContacts = prev.userContacts.filter(
          (contact) => !ids.includes(contact.id),
        );

        Object.keys(prev.communityContacts).forEach((communityId) => {
          updated.communityContacts[communityId] = prev.communityContacts[
            communityId
          ].filter((contact) => !ids.includes(contact.id));
        });

        Object.keys(prev.cityContacts).forEach((cityId) => {
          updated.cityContacts[cityId] = prev.cityContacts[cityId].filter(
            (contact) => !ids.includes(contact.id),
          );
        });

        return updated;
      });

      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  // Bulk add contacts
  const bulkAddContacts = async (contactsToAdd) => {
    try {
      const formattedContacts = contactsToAdd.map((contact) => ({
        ...contact,
        phone: formatPhoneNumber(contact.phone),
        owner_id: contact.owner_type === "user" ? userId : contact.owner_id,
        created_at: new Date(),
        updated_at: new Date(),
      }));

      const { data, error } = await supabase
        .from("contacts")
        .insert(formattedContacts)
        .select();

      if (error) throw error;

      // Update local state with all new contacts
      setContacts((prev) => {
        const updated = { ...prev };

        data.forEach((contact) => {
          if (contact.owner_type === "user") {
            updated.userContacts = [...updated.userContacts, contact];
          } else if (contact.owner_type === "community") {
            const communityId = contact.owner_id;
            if (!updated.communityContacts[communityId]) {
              updated.communityContacts[communityId] = [];
            }
            updated.communityContacts[communityId] = [
              ...updated.communityContacts[communityId],
              contact,
            ];
          } else if (contact.owner_type === "city") {
            const cityId = contact.owner_id;
            if (!updated.cityContacts[cityId]) {
              updated.cityContacts[cityId] = [];
            }
            updated.cityContacts[cityId] = [
              ...updated.cityContacts[cityId],
              contact,
            ];
          }
        });

        return updated;
      });

      return { data, error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  // Bulk update contacts
  const bulkUpdateContacts = async (updates) => {
    try {
      // Execute all updates in parallel
      const updatePromises = updates.map(({ id, data }) => {
        const formattedData = {
          ...data,
          phone: formatPhoneNumber(data.phone),
          owner_id: data.owner_type === "user" ? userId : data.owner_id,
          updated_at: new Date(),
        };

        return supabase
          .from("contacts")
          .update(formattedData)
          .eq("id", id)
          .select();
      });

      const results = await Promise.all(updatePromises);

      // Check for errors
      const errors = results.filter((result) => result.error);
      if (errors.length > 0) {
        throw new Error(
          `Failed to update ${errors.length} contacts: ${errors[0].error.message}`,
        );
      }

      // Update local state with all updated contacts
      setContacts((prev) => {
        const updated = { ...prev };
        const updatedContactsMap = new Map();

        results.forEach((result) => {
          if (result.data && result.data[0]) {
            updatedContactsMap.set(result.data[0].id, result.data[0]);
          }
        });

        // Update in userContacts
        updated.userContacts = prev.userContacts.map((contact) =>
          updatedContactsMap.has(contact.id)
            ? updatedContactsMap.get(contact.id)
            : contact,
        );

        // Update in communityContacts
        Object.keys(prev.communityContacts).forEach((communityId) => {
          updated.communityContacts[communityId] = prev.communityContacts[
            communityId
          ].map((contact) =>
            updatedContactsMap.has(contact.id)
              ? updatedContactsMap.get(contact.id)
              : contact,
          );
        });

        // Update in cityContacts
        Object.keys(prev.cityContacts).forEach((cityId) => {
          updated.cityContacts[cityId] = prev.cityContacts[cityId].map(
            (contact) =>
              updatedContactsMap.has(contact.id)
                ? updatedContactsMap.get(contact.id)
                : contact,
          );
        });

        return updated;
      });

      return { data: results.map((r) => r.data[0]), error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  return {
    contacts,
    loading,
    error,
    addContact,
    bulkAddContacts,
    bulkUpdateContacts,
    bulkDeleteContacts,
    moveContact,
    updateContact,
    deleteContact,
    refreshContacts: fetchContacts,
  };
}

async function fetchUserContacts(userId, userCommunities, userCities) {
  const result = {
    userContacts: [],
    communityContacts: {},
    cityContacts: {},
  };

  // Fetch user's own contacts
  const { data: userData, error: userError } = await supabase
    .from("contacts")
    .select("*")
    .eq("owner_id", userId)
    .eq("owner_type", "user");

  if (userError) {
    console.error("Error fetching user contacts:", userError);
  } else {
    result.userContacts = userData || [];
  }

  // Fetch community contacts
  for (const communityId of userCommunities) {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("owner_id", communityId)
      .eq("owner_type", "community");

    if (error) {
      console.error(
        `Error fetching contacts for community ${communityId}:`,
        error,
      );
      result.communityContacts[communityId] = [];
    } else {
      result.communityContacts[communityId] = data || [];
    }
  }

  // Fetch city contacts
  for (const cityId of userCities) {
    const { data, error } = await supabase
      .from("contacts")
      .select("*")
      .eq("owner_id", cityId)
      .eq("owner_type", "city");

    if (error) {
      console.error(`Error fetching contacts for city ${cityId}:`, error);
      result.cityContacts[cityId] = [];
    } else {
      result.cityContacts[cityId] = data || [];
    }
  }

  return result;
}
