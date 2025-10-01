"use client";
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
// We will attempt to import useUser. If not wrapped in UserProvider, we'll safely ignore.
import { useUser } from "@/contexts/UserProvider";

/**
 * SimpleAuthProvider
 * Tracks whether the user has authenticated at least once through ANY mechanism:
 *  - Supabase/UserProvider authentication (authUser present)
 *  - Simple auth tokens stored in localStorage (cityAuth_, communityAuth_, budgetAccess)
 *  - Previously recorded flag persisted under localStorage key `hasAuthenticatedOnce`
 *
 * Exposes:
 *  - hasAuthenticatedOnce: boolean
 *  - markAuthenticated: function to explicitly set the flag (and persist)
 *  - resetAuthenticated: clears the persisted flag (does NOT remove existing tokens)
 */

const SimpleAuthContext = createContext(null);

export const useSimpleAuth = () => {
  const ctx = useContext(SimpleAuthContext);
  if (!ctx) {
    throw new Error("useSimpleAuth must be used within a SimpleAuthProvider");
  }
  return ctx;
};

const LOCAL_STORAGE_KEY = "hasAuthenticatedOnce";

const detectSimpleAuthTokens = () => {
  if (typeof window === "undefined") return false;
  try {
    for (let i = 0; i < window.localStorage.length; i++) {
      const key = window.localStorage.key(i);
      if (!key) continue;
      if (
        key.startsWith("cityAuth_") ||
        key.startsWith("communityAuth_") ||
        key === "budgetAccess"
      ) {
        return true;
      }
    }
  } catch (e) {
    // ignore
  }
  return false;
};

export const SimpleAuthProvider = ({ children }) => {
  const [hasAuthenticatedOnce, setHasAuthenticatedOnce] = useState(false);
  const [checked, setChecked] = useState(false);

  // Try to access user context; if not available, swallow the error.
  let userCtx = {};
  try {
    userCtx = useUser();
  } catch (e) {
    // Not wrapped in UserProvider; that's okay.
  }

  const { authUser } = userCtx || {};

  const markAuthenticated = useCallback(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(LOCAL_STORAGE_KEY, "true");
    } catch (e) {
      // ignore storage write errors
    }
    setHasAuthenticatedOnce(true);
  }, []);

  const resetAuthenticated = useCallback(() => {
    if (typeof window !== "undefined") {
      try {
        window.localStorage.removeItem(LOCAL_STORAGE_KEY);
      } catch (e) {
        // ignore
      }
    }
    setHasAuthenticatedOnce(false);
  }, []);

  // Initial detection
  useEffect(() => {
    if (typeof window === "undefined") return;
    const already = window.localStorage.getItem(LOCAL_STORAGE_KEY) === "true";
    const tokensPresent = detectSimpleAuthTokens();
    const userAuthenticated = !!authUser; // if Supabase session exists

    if (already || tokensPresent || userAuthenticated) {
      markAuthenticated();
    }
    setChecked(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authUser, markAuthenticated]);

  // Listen for storage changes across tabs
  useEffect(() => {
    const handler = (e) => {
      if (e.key === LOCAL_STORAGE_KEY) {
        setHasAuthenticatedOnce(e.newValue === "true");
      }
      // If other auth tokens get added in another tab, auto-detect
      if (
        e.key &&
        (e.key.startsWith("cityAuth_") ||
          e.key.startsWith("communityAuth_") ||
          e.key === "budgetAccess")
      ) {
        markAuthenticated();
      }
    };
    if (typeof window !== "undefined") {
      window.addEventListener("storage", handler);
    }
    return () => {
      if (typeof window !== "undefined") {
        window.removeEventListener("storage", handler);
      }
    };
  }, [markAuthenticated]);

  const value = {
    hasAuthenticatedOnce,
    markAuthenticated,
    resetAuthenticated,
    // Optionally expose a loading state if consumer cares
    isDetermining: !checked,
  };

  return (
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
};

export default SimpleAuthProvider;
