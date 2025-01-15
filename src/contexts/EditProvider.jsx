import { useClasses } from "@/hooks/use-classes";
import React, { createContext, useEffect, useState, useRef } from "react";
import { toast } from "react-toastify";

export const EditContext = createContext();

const INITIALIZATION_PERIOD = 5000; // 1 second initialization period

const EditProvider = ({ children }) => {
  const [initialData, setInitialData] = useState(null);
  const [entityType, setEntityType] = useState(null);
  const [stagedRequests, setStagedRequests] = useState([]);
  const [data, setData] = useState(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isInitializationComplete, setIsInitializationComplete] =
    useState(false);

  const { createClass, updateClass, deleteClass } = useClasses();

  // Set up initialization timer when data is first set
  useEffect(() => {
    if (data && !isInitializationComplete) {
      setInitialData(JSON.parse(JSON.stringify(data)));

      // Start initialization timer
      const timer = setTimeout(() => {
        setIsInitializationComplete(true);
      }, INITIALIZATION_PERIOD);

      return () => clearTimeout(timer);
    }
  }, [data]);

  // Only check for changes after initialization period
  useEffect(() => {
    if (!isInitializationComplete || !data || !initialData) {
      return;
    }

    const currentDataString = JSON.stringify(data);
    const initialDataString = JSON.stringify(initialData);
    setIsDirty(currentDataString !== initialDataString);
  }, [data, initialData, isInitializationComplete]);

  const processStagedRequests = async () => {
    const results = [];

    for (const [id, request] of Object.entries(stagedRequests)) {
      try {
        let result;
        switch (request.callVerb) {
          case "add":
            result = await createClass(request.data);
            break;
          case "edit":
            result = await updateClass(id, request.data);
            break;
          case "delete":
            result = await deleteClass(id);
            break;
          default:
            console.warn(`Unknown request verb: ${request.callVerb}`);
            continue;
        }

        if (result) {
          results.push({ id, success: true, data: result });
        } else {
          results.push({ id, success: false, error: "Operation failed" });
          toast.error(
            `Failed to process ${request.callVerb} request for ${request.type}`
          );
        }
      } catch (error) {
        results.push({ id, success: false, error: error.message });
        toast.error(
          `Error processing ${request.callVerb} request: ${error.message}`
        );
      }
    }

    return results;
  };

  const saveData = async () => {
    if (!isDirty) return;

    setIsSaving(true);
    try {
      if (entityType === "city") {
        await saveCityData();
      } else if (entityType === "community") {
        await saveCommunityData();
      }

      // After successful save, update the initial data
      setInitialData(JSON.parse(JSON.stringify(data)));
      setIsDirty(false);
    } finally {
      setIsSaving(false);
    }
  };

  const saveCityData = async () => {
    try {
      const response = await fetch(
        `/api/database/cities/${data.state}/${data.name}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ city: data }),
        }
      );

      if (response.ok) {
        toast.success("Data saved successfully");
      } else {
        throw new Error("Failed to save data");
      }
    } catch (error) {
      console.error("An error occurred while saving data:", error);
      toast.error("An error occurred while saving data");
      throw error;
    }
  };

  const saveCommunityData = async () => {
    try {
      const communityResponse = await fetch(
        `/api/database/communities/${data.state
          .toLowerCase()
          .replaceAll(/\s/g, "-")}/${data.city
          .toLowerCase()
          .replaceAll(/\s/g, "-")}/${data.name
          .toLowerCase()
          .replaceAll(/\s/g, "-")}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ community: data }),
        }
      );

      if (!communityResponse.ok) {
        throw new Error("Failed to save community data");
      }

      if (Object.keys(stagedRequests).length > 0) {
        const results = await processStagedRequests();
        const failures = results.filter((result) => !result.success);

        if (failures.length > 0) {
          console.error("Some staged requests failed:", failures);
          toast.warning("Some changes were not saved successfully");
        } else {
          toast.success("All changes saved successfully");
        }

        setStagedRequests({});
      } else {
        toast.success("Data saved successfully");
      }
    } catch (error) {
      console.error("An error occurred while saving data:", error);
      toast.error("An error occurred while saving data");
      throw error;
    }
  };

  return (
    <EditContext.Provider
      value={{
        data,
        setData,
        setEntityType,
        saveData,
        isDirty,
        isSaving,
        stagedRequests,
        setStagedRequests,
      }}
    >
      {children}
    </EditContext.Provider>
  );
};

export default EditProvider;
