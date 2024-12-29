// useLocalStorageProjectForms.js
import { useState, useEffect } from "react";

const STORAGE_KEY = "projectForms";

export const useLocalStorageProjectForms = () => {
  const [projects, setProjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load projects from localStorage on initial mount
  useEffect(() => {
    const loadProjects = () => {
      try {
        setIsLoading(true);
        const storedProjects = localStorage.getItem(STORAGE_KEY);
        if (storedProjects) {
          setProjects(JSON.parse(storedProjects));
        }
        setError(null);
      } catch (error) {
        console.error("Error loading stored projects:", error);
        setError("Failed to load projects");
        setProjects([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadProjects();
  }, []);

  // Save to localStorage whenever projects change
  useEffect(() => {
    if (!isLoading) {
      // Only save if not in initial loading state
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
      } catch (error) {
        console.error("Error saving projects:", error);
        setError("Failed to save projects");
      }
    }
  }, [projects, isLoading]);

  const addProject = (id, details = {}) => {
    setProjects((prev) => {
      // Check if project already exists
      if (prev.some((project) => project.id === id)) {
        return prev;
      }

      return [
        ...prev,
        {
          id,
          createdTime: new Date().toISOString(),
          finishedTime: null,
          propertyOwner: details.propertyOwner || "",
          address: details.address || "",
          lastUpdated: new Date().toISOString(),
        },
      ];
    });
  };

  const updateProject = (id, updates) => {
    setProjects((prev) =>
      prev.map((project) =>
        project.id === id
          ? {
              ...project,
              ...updates,
              lastUpdated: new Date().toISOString(),
            }
          : project
      )
    );
  };

  const deleteProject = (id) => {
    setProjects((prev) => prev.filter((project) => project.id !== id));
  };

  const getProject = (id) => {
    return projects.find((project) => project.id === id);
  };

  return {
    projects,
    isLoading,
    error,
    addProject,
    updateProject,
    deleteProject,
    getProject,
  };
};
