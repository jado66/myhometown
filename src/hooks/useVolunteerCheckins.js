import { useState, useCallback } from "react";
import { supabase } from "@/util/supabase";

/**
 * Manages volunteer check-in state backed by the `volunteer_checkins` table.
 * A row existing with checked_in = true means the volunteer is checked in.
 * A missing row or checked_in = false means not checked in.
 */
export const useVolunteerCheckins = (formId) => {
  // Keyed by submission_id: { submission_id, checked_in, checked_in_at }
  const [checkins, setCheckins] = useState({});
  const [loading, setLoading] = useState(false);

  const loadCheckins = useCallback(async () => {
    if (!formId) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("volunteer_checkins")
        .select("submission_id, checked_in, checked_in_at")
        .eq("form_id", formId);

      if (error) throw error;

      const map = {};
      (data || []).forEach((row) => {
        map[row.submission_id] = row;
      });
      setCheckins(map);
    } catch (err) {
      console.error("Error loading volunteer checkins:", err);
    } finally {
      setLoading(false);
    }
  }, [formId]);

  const toggleCheckin = useCallback(
    async (submissionId, checkedIn) => {
      if (!formId || !submissionId) return;

      // Optimistic update
      setCheckins((prev) => ({
        ...prev,
        [submissionId]: {
          ...prev[submissionId],
          submission_id: submissionId,
          checked_in: checkedIn,
          checked_in_at: checkedIn ? new Date().toISOString() : null,
        },
      }));

      try {
        const { error } = await supabase.from("volunteer_checkins").upsert(
          {
            form_id: formId,
            submission_id: submissionId,
            checked_in: checkedIn,
            checked_in_at: checkedIn ? new Date().toISOString() : null,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "form_id,submission_id" },
        );

        if (error) throw error;
      } catch (err) {
        console.error("Error toggling checkin:", err);
        // Revert optimistic update
        setCheckins((prev) => ({
          ...prev,
          [submissionId]: {
            ...prev[submissionId],
            checked_in: !checkedIn,
          },
        }));
      }
    },
    [formId],
  );

  return { checkins, loading, loadCheckins, toggleCheckin };
};
