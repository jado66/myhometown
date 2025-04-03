"use client";

import { useState, useEffect } from "react";
import { useCommunities } from "@/hooks/use-communities";
import { useFormResponses } from "@/hooks/useFormResponses";

export const useCommunityData = (communityId) => {
  const [community, setCommunity] = useState(null);
  const [formConfig, setFormConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const { getCommunity } = useCommunities();
  const { getFormById } = useFormResponses();

  useEffect(() => {
    const loadCommunityData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Get the community data
        const communityData = await getCommunity(communityId);
        setCommunity(communityData);

        if (communityData?.volunteerSignUpId) {
          // Get the form configuration
          const formConfigData = await getFormById(
            communityData.volunteerSignUpId
          );

          if (formConfigData) {
            const formattedFormData = {
              form_config: formConfigData.form_config || {},
              field_order: formConfigData.field_order || [],
            };
            setFormConfig(formattedFormData);
          }
        }
      } catch (err) {
        console.error("Error loading community data:", err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    if (communityId) {
      loadCommunityData();
    }
  }, [communityId]);

  return {
    community,
    formConfig,
    loading,
    error,
  };
};
