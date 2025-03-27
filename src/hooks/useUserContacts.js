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
        userCities
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
        })
    );
  }, [userId, userCommunities, userCities]);

  // Initial fetch
  useEffect(() => {
    if (!userId) {
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
  const addContact = async (newContactData) => {
    try {
      const contact = {
        ...newContactData,
        // If owner_type is 'user', set owner_id to userId
        owner_id:
          newContactData.owner_type === "user"
            ? userId
            : newContactData.owner_id,
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

      return { data: data[0], error: null };
    } catch (error) {
      return { data: null, error: error.message };
    }
  };

  // Update existing contact
  const updateContact = async (id, updatedData) => {
    try {
      const dataToUpdate = {
        ...updatedData,
        // If owner_type is 'user', set owner_id to userId
        owner_id:
          updatedData.owner_type === "user" ? userId : updatedData.owner_id,
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
          contact.id === id ? { ...contact, ...updatedData } : contact
        );

        // Update in communityContacts if found
        Object.keys(prev.communityContacts).forEach((communityId) => {
          updated.communityContacts[communityId] = prev.communityContacts[
            communityId
          ].map((contact) =>
            contact.id === id ? { ...contact, ...updatedData } : contact
          );
        });

        // Update in cityContacts if found
        Object.keys(prev.cityContacts).forEach((cityId) => {
          updated.cityContacts[cityId] = prev.cityContacts[cityId].map(
            (contact) =>
              contact.id === id ? { ...contact, ...updatedData } : contact
          );
        });

        return updated;
      });

      return { data: data[0], error: null };
    } catch (error) {
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
          (contact) => contact.id !== id
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
            (contact) => contact.id !== id
          );
        });

        return updated;
      });

      return { error: null };
    } catch (error) {
      return { error: error.message };
    }
  };

  return {
    contacts,
    loading,
    error,
    addContact,
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
        error
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
