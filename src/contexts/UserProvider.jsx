"use client";
import { createContext, useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const {
    user: authUser,
    error: authError,
    isLoading: isAuthLoading,
  } = useUser();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);

  const getImpersonatedUser = () => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem("impersonatedUser");
    return stored ? JSON.parse(stored) : null;
  };

  const fetchUser = async (sub, email) => {
    try {
      const response = await fetch("/api/database/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ sub, email }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setUser(data);
      setIsLoading(false);
      return data;
    } catch (error) {
      console.error("Could not fetch user", error);
      setIsLoading(false);
      return null;
    }
  };

  useEffect(() => {
    const initializeUser = async () => {
      // Wait for auth loading to complete
      if (isAuthLoading) return;

      // Check for impersonated user first
      const impersonatedUser = getImpersonatedUser();

      if (impersonatedUser) {
        setIsImpersonating(true);
        const { sub, email } = impersonatedUser;
        await fetchUser(sub, email);
      } else if (authUser) {
        setIsImpersonating(false);
        const { sub, email } = authUser;
        await fetchUser(sub, email);
      } else {
        // No authenticated or impersonated user
        setUser(null);
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [authUser, isAuthLoading]);

  const impersonateUser = async (newSub, newEmail) => {
    setIsLoading(true);
    const userData = await fetchUser(newSub, newEmail);

    if (userData) {
      // Store impersonation data
      window.localStorage.setItem(
        "impersonatedUser",
        JSON.stringify({
          sub: newSub,
          email: newEmail,
        })
      );
      setIsImpersonating(true);
    }
  };

  const stopImpersonation = async () => {
    setIsLoading(true);
    window.localStorage.removeItem("impersonatedUser");
    setIsImpersonating(false);

    if (authUser) {
      const { sub, email } = authUser;
      await fetchUser(sub, email);
    } else {
      setUser(null);
      setIsLoading(false);
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        isLoading,
        impersonateUser,
        stopImpersonation,
        isImpersonating,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
