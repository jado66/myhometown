"use client";
import { supabase } from "@/util/supabase";
import { createContext, useState, useEffect, useContext } from "react";

export const UserContext = createContext();

export const useUser = () => {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isImpersonating, setIsImpersonating] = useState(false);
  const [authUser, setAuthUser] = useState(null);

  const getImpersonatedUser = () => {
    if (typeof window === "undefined") return null;
    const stored = window.localStorage.getItem("impersonatedUser");
    return stored ? JSON.parse(stored) : null;
  };

  const fetchUser = async (id, email) => {
    try {
      // Query the users table in Supabase
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;

      // If user doesn't exist, create a new user record
      if (!data) {
        const { data: newUser, error: createError } = await supabase
          .from("users")
          .insert([
            {
              id: id,
              email: email,
              role: "User", // Default role
              created_at: new Date().toISOString(),
            },
          ])
          .select()
          .single();

        if (createError) throw createError;

        setUser(newUser);
        setIsLoading(false);
        return newUser;
      }

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
    // Set up Supabase auth listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setAuthUser(session?.user ?? null);

      if (event === "SIGNED_OUT") {
        setUser(null);
        window.localStorage.removeItem("impersonatedUser");
        setIsImpersonating(false);
      }
    });

    // Initial session check
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuthUser(session?.user ?? null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const initializeUser = async () => {
      // Check for impersonated user first
      const impersonatedUser = getImpersonatedUser();

      if (impersonatedUser) {
        setIsImpersonating(true);
        const { sub, email } = impersonatedUser;
        await fetchUser(sub, email);
      } else if (authUser) {
        setIsImpersonating(false);
        await fetchUser(authUser.id, authUser.email);
      } else {
        // No authenticated or impersonated user
        setUser(null);
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [authUser]);

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
      await fetchUser(authUser.id, authUser.email);
    } else {
      setUser(null);
      setIsLoading(false);
    }
  };

  // Authentication methods
  const signIn = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error("Error signing in:", error.message);
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Error signing out:", error.message);
      return { error };
    }
  };

  const resetPassword = async (email) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error("Error resetting password:", error.message);
      return { error };
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        authUser,
        isLoading,
        isAdmin: user?.role === "Admin",
        impersonateUser,
        stopImpersonation,
        isImpersonating,
        signIn,
        signOut,
        resetPassword,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};
