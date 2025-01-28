"use client";

import { UserContext } from "@/contexts/UserProvider";
import { useContext } from "react";

// Create a custom hook to access the user data and update function
export const useUser = () => {
  const context = useContext(UserContext);
  return context;
};
