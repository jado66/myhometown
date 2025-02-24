import { supabase } from "@/util/supabase";
import { useState, useEffect, useCallback } from "react";

export function useUserContacts(userId, userCommunities, userCities) {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch all contacts
  const fetchContacts = useCallback(async () => {
    if (!userId || !userCommunities || !userCities) {
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
      setError(err);
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
    updateContact,
    deleteContact,
    refreshContacts: fetchContacts,
  };
}

async function fetchUserContacts(userId, userCommunities, userCities) {
  // Fetch user's own contacts
  const { data: userContacts, error: userError } = await supabase
    .from("contacts")
    .select("*")
    .eq("owner_id", userId)
    .eq("owner_type", "user");

  if (userError) {
    console.error("Error fetching user contacts:", userError);
    return [];
  }

  // Fetch contacts from user's communities
  const { data: communityContacts, error: communityError } = await supabase
    .from("contacts")
    .select("*")
    .in("owner_id", userCommunities)
    .eq("owner_type", "community")
    .eq("visibility", true);

  if (communityError) {
    console.error("Error fetching community contacts:", communityError);
    return userContacts;
  }

  // Fetch contacts from user's cities
  const { data: cityContacts, error: cityError } = await supabase
    .from("contacts")
    .select("*")
    .in("owner_id", userCities)
    .eq("owner_type", "city")
    .eq("visibility", true);

  if (cityError) {
    console.error("Error fetching city contacts:", cityError);
    return [...userContacts, ...communityContacts];
  }

  // Combine all contacts
  return [...userContacts, ...communityContacts, ...cityContacts];
}
