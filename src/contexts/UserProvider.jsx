import { createContext, useState, useEffect } from "react";
import { useUser } from "@auth0/nextjs-auth0/client";

// Create a new context for the user
export const UserContext = createContext();

// Create a UserProvider component
export const UserProvider = ({ children }) => {
  const {
    user: authUser,
    error: authError,
    isLoading: isAuthError,
  } = useUser();
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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

      // Set the user data
      setUser(data);
      setIsLoading(false);
    } catch (error) {
      console.error("Could not fetch user", error);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authUser) {
      const { sub, email } = authUser;
      fetchUser(sub, email);
    }
  }, [authUser]);

  const impersonateUser = async (newSub, newEmail) => {
    setIsLoading(true);
    await fetchUser(newSub, newEmail);
  };

  return (
    // Provide the user data and update function to the children components
    <UserContext.Provider value={{ user, isLoading, impersonateUser }}>
      {children}
    </UserContext.Provider>
  );
};
