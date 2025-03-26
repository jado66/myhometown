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
  }, [userId, userCommunities, userCities]);

  // Initial fetch
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

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

      setContacts((prev) => [...prev, data[0]]);
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

      setContacts((prev) =>
        prev.map((contact) =>
          contact.id === id ? { ...contact, ...updatedData } : contact
        )
      );
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

      setContacts((prev) => prev.filter((contact) => contact.id !== id));
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
