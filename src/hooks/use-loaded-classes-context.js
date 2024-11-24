import { LoadedClassesProvider } from "@/contexts/LoadedClassesProvider";

// Custom hook to use the classes context
export const useLoadedClassesContext = () => {
  const context = useContext(LoadedClassesProvider);
  if (!context) {
    throw new Error("useClassesContext must be used within a ClassesProvider");
  }
  return context;
};
