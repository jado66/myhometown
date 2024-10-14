import React, { createContext, useState } from "react";

export const CommunityListContext = createContext();

export const CommunityListProvider = ({ children }) => {
  const [communities, setCommunities] = useState([]);

  return (
    <CommunityListContext.Provider value={{ communities, setCommunities }}>
      {children}
    </CommunityListContext.Provider>
  );
};
