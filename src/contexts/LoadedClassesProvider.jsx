import JsonViewer from "@/components/util/debug/DebugOutput";
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
  // Track explicitly not found classes to prevent repeated fetching
  const [notFoundClasses, setNotFoundClasses] = useState(new Set());
  const { getClass } = useClasses();

  // Load a class, checking staged requests first if in edit mode
  const loadClass = useCallback(
    async (classId) => {
      // Return null early if we know the class doesn't exist
      if (notFoundClasses.has(classId)) {
        return null;
      }

      // Return cached class if available
      if (loadedClasses[classId]) {
        return loadedClasses[classId];
      }

      // Check staged requests if in edit mode
      if (isEdit && stagedRequests[classId]) {
        const stagedClass = stagedRequests[classId];

        // If it's a delete request, mark as not found and return null
        if (stagedClass.callVerb === "delete") {
          setNotFoundClasses((prev) => new Set([...prev, classId]));
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
        } else {
          // Mark class as not found to prevent future fetches
          setNotFoundClasses((prev) => new Set([...prev, classId]));
          return null;
        }
      } catch (error) {
        console.error("Error loading class:", error);
        // Mark class as not found on error
        setNotFoundClasses((prev) => new Set([...prev, classId]));
        return null;
      }
    },
    [loadedClasses, stagedRequests, isEdit, getClass, notFoundClasses]
  );

  // Clear the cache for a specific class
  const clearClassCache = useCallback(
    (classId) => {
      const newLoadedClasses = { ...loadedClasses };
      delete newLoadedClasses[classId];
      setLoadedClasses(newLoadedClasses);
      // Also remove from notFoundClasses if present
      if (notFoundClasses.has(classId)) {
        const newNotFound = new Set(notFoundClasses);
        newNotFound.delete(classId);
        setNotFoundClasses(newNotFound);
      }
    },
    [loadedClasses, notFoundClasses]
  );

  // Clear the entire cache
  const clearCache = useCallback(() => {
    setLoadedClasses({});
    setNotFoundClasses(new Set());
  }, []);

  const value = {
    loadedClasses,
    loadClass,
    clearClassCache,
    clearCache,
  };

  return (
    <LoadedClassesContext.Provider value={value}>
      <JsonViewer data={loadedClasses} title="Loaded Class" />
      {children}
    </LoadedClassesContext.Provider>
  );
};
