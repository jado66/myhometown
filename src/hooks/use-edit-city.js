import { EditCityContext } from "@/contexts/EditCityProvider";
import { useContext } from "react";

export function useEditCity() {
  const context = useContext(EditCityContext);

  if (context === undefined) {
    throw new Error("useEditCity must be used within a EditCityProvider");
  }

  return context;
}