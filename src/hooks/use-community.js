import { mergeObjectTemplate } from "@/util/mergeObjectTemplate";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";

export default function useCommunity(
  communityQuery,
  cityQuery,
  stateQuery,
  template = {},
  isEditing = false
) {
  const [community, setCommunity] = useState({});
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(isEditing);

  const handleSaveCommunity = async (community) => {
    try {
      const res = await fetch(`/api/database/communities`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          community,
        }),
      });

      toast.success("Community updated successfully");
    } catch (e) {
      console.error("Error occurred while editing a community", e);
      toast.error("Failed to update community");
    }
  };

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const res = await fetch(
          `/api/database/communities/${stateQuery}/${cityQuery}/${communityQuery}?isEditMode=${isEditMode}`
        );

        if (res.status === 404 || res.status === 403) {
          console.error(
            "Unable to access the requested resource. Status Code:",
            res.status
          );
          setCommunity(null);
          setError({ status: res.status });
          setHasLoaded(true);
          return;
        }

        const data = await res.json();

        if (!data || !data[0]) {
          setError({ status: 404 });
          setCommunity(null);
          setHasLoaded(true);
          return;
        }

        const mergedCommunity = mergeObjectTemplate(data[0], template);

        setCommunity(mergedCommunity);
        setError(null);
        setHasLoaded(true);
      } catch (e) {
        console.error("Error occurred while fetching community", e);
        setError({ status: 500 });
        setCommunity(null);
        setHasLoaded(true);
      }
    };

    fetchCommunity();
  }, [communityQuery, cityQuery, stateQuery, template, isEditMode]);

  return {
    community,
    hasLoaded,
    handleSaveCommunity,
    error,
  };
}
