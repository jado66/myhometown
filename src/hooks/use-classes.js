// hooks/useClasses.js
import { useState } from "react";

export const useClasses = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchClasses = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/database/classes");
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch classes");
      }
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  const getClass = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/database/classes/${id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch class");
      }
      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  const createClass = async (classData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/database/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(classData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create class");
      }

      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  const updateClass = async (id, updateData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/database/classes/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to update class");
      }

      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  const deleteClass = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/database/classes/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to delete class");
      }

      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  const signupForClass = async (id, signupData) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/database/classes/${id}/signup`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(signupData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process signup");
      }

      const data = await response.json();
      setLoading(false);
      return data;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  const getClassesByCommunity = async (communityId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `/api/database/classes/by-community/${communityId}`
      );
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(
          errorData.error || "Failed to fetch classes for community"
        );
      }
      const data = await response.json();
      setLoading(false);
      return data.results;
    } catch (err) {
      setError(err.message);
      setLoading(false);
      return null;
    }
  };

  return {
    loading,
    error,
    fetchClasses,
    getClass,
    createClass,
    updateClass,
    deleteClass,
    getClassesByCommunity,
    signupForClass,
  };
};
