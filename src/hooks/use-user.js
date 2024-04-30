import { UserContext } from "@/contexts/UserProvider";
import { useContext } from "react";

// Create a custom hook to access the user data and update function
export const useUser = () => {
    const { user, updateUser, hasLoaded } = useContext(UserContext);
    return { user, updateUser, hasLoaded };
};

