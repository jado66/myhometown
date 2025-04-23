// src/hooks/communications/useScheduledTexts.js
import { useState, useCallback } from "react";
import { v4 as uuidv4 } from "uuid";
import { toast } from "react-toastify";
import { supabase } from "@/util/supabase";

export function useScheduledTexts() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch all scheduled texts for the current user
  const getScheduledTexts = useCallback(
    async (userId) => {
      if (!userId) return { data: [] };

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from("scheduled_texts")
          .select("*")
          .eq("user_id", userId)
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
    },
    [supabase]
  );

  // Create a new scheduled text
  const scheduleText = useCallback(
    async (messageContent, recipients, scheduledTime, mediaUrls = [], user) => {
      if (!user?.id) return { error: "Not authenticated" };

      setLoading(true);
      setError(null);

      try {
        // Prepare metadata
        const metadata = {
          createdAt: new Date().toISOString(),
          sender: user.email,
          totalRecipients: recipients.length,
        };

        const { data, error } = await supabase.from("scheduled_texts").insert({
          id: uuidv4(),
          user_id: user.id,
          message_content: messageContent,
          recipients: JSON.stringify(recipients),
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
    [supabase]
  );

  // Delete a scheduled text
  const deleteScheduledText = useCallback(
    async (id, userId) => {
      if (!userId) return { error: "Not authenticated" };

      setLoading(true);
      setError(null);

      try {
        const { error } = await supabase
          .from("scheduled_texts")
          .delete()
          .eq("id", id)
          .eq("user_id", userId);

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
    [supabase]
  );

  // Batch delete scheduled texts
  const batchDeleteScheduledTexts = useCallback(
    async (ids, userId) => {
      if (!userId || !ids.length) return { error: "Invalid request" };

      setLoading(true);
      setError(null);

      try {
        const { error } = await supabase
          .from("scheduled_texts")
          .delete()
          .in("id", ids)
          .eq("user_id", userId);

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
    [supabase]
  );

  return {
    loading,
    error,
    getScheduledTexts,
    scheduleText,
    deleteScheduledText,
    batchDeleteScheduledTexts,
  };
}
