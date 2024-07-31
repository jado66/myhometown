import { mergeObjectTemplate } from "@/util/mergeObjectTemplate";
import { useState, useEffect } from "react";

export default function useCommunity(
  communityQuery,
  cityQuery,
  stateQuery,
  template = {}
) {
  const [community, setCommunity] = useState({});
  const [hasLoaded, setHasLoaded] = useState(false);

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
    }
  };

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        const res = await fetch(
          `/api/database/communities/${stateQuery}/${cityQuery}/${communityQuery}`
        );

        // Check if response status is either 404 or 403 before fetching json data
        if (res.status === 404 || res.status === 403) {
          console.error(
            "Unable to access the requested resource. Status Code:",
            res.status
          );
          setCommunity(null);
          setHasLoaded(true);
          return;
        }

        const data = await res.json();

        console.log("data[0]" + JSON.stringify(data[0], null, 4));

        const mergedCommunity = mergeObjectTemplate(data[0], template);

        setCommunity(mergedCommunity);
        setHasLoaded(true);
      } catch (e) {
        console.error("Error occurred while fetching community", e);
      }
    };

    fetchCommunity();
  }, [communityQuery]);

  return {
    community,
    hasLoaded,
    handleSaveCommunity,
  };
}
