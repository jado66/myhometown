// src/hooks/useScheduledTexts.js
import { useState, useCallback } from "react";
import { useSupabaseClient, useUser } from "@supabase/auth-helpers-react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";

export function useScheduledTexts() {
  const supabase = useSupabaseClient();
  const user = useUser();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all scheduled texts for the current user
  const getScheduledTexts = useCallback(async () => {
    if (!user) return { data: [] };

    setLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from("scheduled_texts")
        .select("*, contacts(id, first_name, last_name)")
        .eq("user_id", user.id)
        .order("scheduled_time", { ascending: true });

      if (error) throw error;

      return { data };
    } catch (err) {
      setError(err);
      console.error("Error fetching scheduled texts:", err);
      toast.error("Failed to load scheduled texts");
      return { data: [] };
    } finally {
      setLoading(false);
    }
  }, [supabase, user]);

  // Create a new scheduled text
  const createScheduledText = useCallback(
    async (messageContent, recipient, scheduledTime, mediaUrls = []) => {
      if (!user) return { error: "Not authenticated" };

      setLoading(true);
      setError(null);

      try {
        // Prepare metadata with recipient name
        const metadata = {
          recipientName: recipient.name || recipient.label || "",
          createdAt: new Date().toISOString(),
        };

        const { data, error } = await supabase.from("scheduled_texts").insert({
          id: uuidv4(),
          user_id: user.id,
          message_content: messageContent,
          recipient_phone: recipient.phone || recipient.value,
          recipient_contact_id: recipient.contactId || null,
          scheduled_time: scheduledTime.toISOString(),
          media_urls: mediaUrls.length ? JSON.stringify(mediaUrls) : null,
          metadata: JSON.stringify(metadata),
        });

        if (error) throw error;

        toast.success("Text message scheduled successfully");
        return { data };
      } catch (err) {
        setError(err);
        console.error("Error scheduling text:", err);
        toast.error("Failed to schedule text message");
        return { error: err };
      } finally {
        setLoading(false);
      }
    },
    [supabase, user]
  );

  // Update an existing scheduled text
  const updateScheduledText = useCallback(
    async (id, updates) => {
      if (!user) return { error: "Not authenticated" };

      setLoading(true);
      setError(null);

      try {
        // First get the existing scheduled text to ensure ownership
        const { data: existingText, error: fetchError } = await supabase
          .from("scheduled_texts")
          .select("*")
          .eq("id", id)
          .eq("user_id", user.id)
          .single();

        if (fetchError) throw fetchError;
        if (!existingText) throw new Error("Scheduled text not found");

        // Update with the new values
        const updateData = {
          ...updates,
          updated_at: new Date().toISOString(),
        };

        // If we're updating mediaUrls, ensure proper JSON format
        if (updates.media_urls !== undefined) {
          updateData.media_urls = updates.media_urls?.length
            ? JSON.stringify(updates.media_urls)
            : null;
        }

        // If we're updating metadata, merge with existing
        if (updates.metadata) {
          const existingMetadata = JSON.parse(existingText.metadata || "{}");
          updateData.metadata = JSON.stringify({
            ...existingMetadata,
            ...updates.metadata,
            updatedAt: new Date().toISOString(),
          });
        }

        const { data, error } = await supabase
          .from("scheduled_texts")
          .update(updateData)
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;

        toast.success("Scheduled text updated successfully");
        return { data };
      } catch (err) {
        setError(err);
        console.error("Error updating scheduled text:", err);
        toast.error("Failed to update scheduled text");
        return { error: err };
      } finally {
        setLoading(false);
      }
    },
    [supabase, user]
  );

  // Delete a scheduled text
  const deleteScheduledText = useCallback(
    async (id) => {
      if (!user) return { error: "Not authenticated" };

      setLoading(true);
      setError(null);

      try {
        const { error } = await supabase
          .from("scheduled_texts")
          .delete()
          .eq("id", id)
          .eq("user_id", user.id);

        if (error) throw error;

        toast.success("Scheduled text deleted successfully");
        return { success: true };
      } catch (err) {
        setError(err);
        console.error("Error deleting scheduled text:", err);
        toast.error("Failed to delete scheduled text");
        return { error: err };
      } finally {
        setLoading(false);
      }
    },
    [supabase, user]
  );

  // Batch delete scheduled texts
  const batchDeleteScheduledTexts = useCallback(
    async (ids) => {
      if (!user || !ids.length) return { error: "Invalid request" };

      setLoading(true);
      setError(null);

      try {
        const { error } = await supabase
          .from("scheduled_texts")
          .delete()
          .in("id", ids)
          .eq("user_id", user.id);

        if (error) throw error;

        toast.success(`${ids.length} scheduled texts deleted successfully`);
        return { success: true };
      } catch (err) {
        setError(err);
        console.error("Error batch deleting scheduled texts:", err);
        toast.error("Failed to delete scheduled texts");
        return { error: err };
      } finally {
        setLoading(false);
      }
    },
    [supabase, user]
  );

  return {
    loading,
    error,
    getScheduledTexts,
    createScheduledText,
    updateScheduledText,
    deleteScheduledText,
    batchDeleteScheduledTexts,
  };
}
