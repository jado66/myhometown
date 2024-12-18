import { useClasses } from "@/hooks/use-classes";
import React, { createContext, useState, useCallback } from "react";

// Create context
export const LoadedClassesContext = createContext(null);

// Context provider component
export const LoadedClassesProvider = ({
  children,
  stagedRequests = {},
  isEdit = false,
}) => {
  const [loadedClasses, setLoadedClasses] = useState({});
  const { getClass } = useClasses();

  // Load a class, checking staged requests first if in edit mode
  const loadClass = useCallback(
    async (classId) => {
      console.log("stagedRequests: ", stagedRequests);
      alert(JSON.stringify(stagedRequests));
      // Return cached class if available
      if (loadedClasses[classId]) {
        return loadedClasses[classId];
      }

      // Check staged requests if in edit mode
      if (isEdit && stagedRequests[classId]) {
        const stagedClass = stagedRequests[classId];

        // If it's a delete request, return null
        if (stagedClass.callVerb === "delete") {
          return null;
        }

        // For add or edit requests, cache and return the staged data
        if (stagedClass.callVerb === "add" || stagedClass.callVerb === "edit") {
          const newLoadedClasses = {
            ...loadedClasses,
            [classId]: stagedClass.data,
          };
          setLoadedClasses(newLoadedClasses);
          return stagedClass.data;
        }
      }

      // Fetch from API if not cached or staged
      try {
        const fetchedClass = await getClass(classId);
        if (fetchedClass) {
          const newLoadedClasses = {
            ...loadedClasses,
            [classId]: fetchedClass,
          };
          setLoadedClasses(newLoadedClasses);
          return fetchedClass;
        }
        return null;
      } catch (error) {
        console.error("Error loading class:", error);

        return null;
      }
    },
    [loadedClasses, stagedRequests, isEdit, getClass]
  );

  // Clear the cache for a specific class
  const clearClassCache = useCallback(
    (classId) => {
      const newLoadedClasses = { ...loadedClasses };
      delete newLoadedClasses[classId];
      setLoadedClasses(newLoadedClasses);
    },
    [loadedClasses]
  );

  // Clear the entire cache
  const clearCache = useCallback(() => {
    setLoadedClasses({});
  }, []);

  const value = {
    loadedClasses,
    loadClass,
    clearClassCache,
    clearCache,
  };

  return (
    <LoadedClassesContext.Provider value={value}>
      {JSON.stringify(stagedRequests)}
      {children}
    </LoadedClassesContext.Provider>
  );
};
