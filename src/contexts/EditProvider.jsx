import { useClasses } from "@/hooks/use-classes";
import React, { createContext, useEffect, useState } from "react";
import { toast } from "react-toastify";

export const EditContext = createContext();

const EditProvider = ({ children }) => {
  const [initialData, setInitialData] = useState({});
  const [entityType, setEntityType] = useState(null);
  const [stagedRequests, setStagedRequests] = useState([]);
  const [data, setData] = useState(null);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [isDirty, setIsDirty] = useState(false);

  const { createClass, updateClass, deleteClass } = useClasses();

  useEffect(() => {
    if (data) {
      if (hasLoaded) {
        setIsDirty(JSON.stringify(data) !== JSON.stringify(initialData));
      } else {
        setInitialData(data);
        setHasLoaded(true);
      }
    }
  }, [data]);

  const processStagedRequests = async () => {
    const results = [];

    for (const [id, request] of Object.entries(stagedRequests)) {
      try {
        let result;
        switch (request.callVerb) {
          case "add":
            result = await createClass(request.data);
            break;
          case "update":
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
          toast.success(
            `Successfully processed ${request.callVerb} request for ${request.type}`
          );
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
    if (entityType === "city") {
      await saveCityData();
    } else if (entityType === "community") {
      await saveCommunityData();
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
        console.error("Failed to save data");
        toast.error("Failed to save data");
      }
    } catch (error) {
      console.error("An error occurred while saving data:", error);
      toast.error("An error occurred while saving data");
    }
  };

  const saveCommunityData = async () => {
    try {
      // First save the community data
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

      // Then process any staged requests
      if (Object.keys(stagedRequests).length > 0) {
        const results = await processStagedRequests();
        const failures = results.filter((result) => !result.success);

        if (failures.length > 0) {
          console.error("Some staged requests failed:", failures);
          toast.warning("Some changes were not saved successfully");
        } else {
          toast.success("All changes saved successfully");
        }

        // Clear staged requests after processing
        setStagedRequests({});
      } else {
        toast.success("Data saved successfully");
      }

      setIsDirty(false);
    } catch (error) {
      console.error("An error occurred while saving data:", error);
      toast.error("An error occurred while saving data");
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
        stagedRequests,
        setStagedRequests,
      }}
    >
      {children}
    </EditContext.Provider>
  );
};

export default EditProvider;
