import { createContext, useContext, useState } from "react";

// Create the context
const DayOfServiceContext = createContext();

// Create a provider component
export const DayOfServiceIdProvider = ({ children }) => {
  const [dayOfServiceId, setDayOfServiceId] = useState(null);

  // Function to update both ID and label
  const updateDayOfService = (id) => {
    setDayOfServiceId(id);
  };

  // Value object to be provided to consumers
  const value = {
    dayOfServiceId,
    updateDayOfService,
  };

  return (
    <DayOfServiceContext.Provider value={value}>
      {children}
    </DayOfServiceContext.Provider>
  );
};

// Custom hook for using the context
export const useDayOfServiceId = () => {
  const context = useContext(DayOfServiceContext);
  if (context === undefined) {
    throw new Error(
      "useDayOfService must be used within a DayOfServiceProvider"
    );
  }
  return context;
};
