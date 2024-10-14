import { CommunityListContext } from "@/contexts/CommuntyListProvider";
import { useContext } from "react";

export const useCommunityList = () => {
  const context = useContext(CommunityListContext);
  if (!context) {
    throw new Error("useCommunity must be used within a CommunityProvider");
  }
  return context;
};
