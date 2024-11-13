import { useState, useEffect } from "react";
import { mergeObjectTemplate } from "@/util/mergeObjectTemplate";
import { toast } from "react-toastify";

export default function useCity(
  cityQuery,
  stateQuery,
  template = {},
  isEditing = false
) {
  const [city, setCity] = useState({});
  const [hasLoaded, setHasLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [isEditMode, setIsEditMode] = useState(isEditing);

  const handleSaveCity = async (city) => {
    try {
      const res = await fetch(`/api/database/cities`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          city,
        }),
      });

      toast.success("City updated successfully");
    } catch (e) {
      console.error("Error occurred while editing a city", e);
      toast.error("Failed to update city");
    }
  };

  useEffect(() => {
    const fetchCity = async () => {
      try {
        const res = await fetch(
          `/api/database/cities/${stateQuery}/${cityQuery}?isEditMode=${isEditMode}`
        );

        // Handle specific error status codes
        if (res.status === 404 || res.status === 403) {
          console.error(
            "Unable to access the requested resource. Status Code:",
            res.status
          );
          setCity(null);
          setError({ status: res.status });
          setHasLoaded(true);
          return;
        }

        const data = await res.json();

        if (!data || !data[0]) {
          setError({ status: 404 });
          setCity(null);
          setHasLoaded(true);
          return;
        }

        const mergedCity = mergeObjectTemplate(data[0], template);

        setCity(mergedCity);
        setError(null);
        setHasLoaded(true);
      } catch (e) {
        console.error("Error occurred while fetching city", e);
        setError({ status: 500 });
        setCity(null);
        setHasLoaded(true);
      }
    };

    fetchCity();
  }, [cityQuery, stateQuery, template]); // Added missing dependencies

  return {
    city,
    hasLoaded,
    handleSaveCity,
    error,
  };
}
