import { createContext, useState, useEffect } from 'react';
import { useUser } from '@auth0/nextjs-auth0/client';

// Create a new context for the user
export const UserContext = createContext();

// Create a UserProvider component
export const UserProvider = ({ children }) => {
    
    const { user: authUser, error: authError, isLoading: isAuthError } = useUser();

    const [user, setUser] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    const fetchUser = async (authUser) => {
        // Fetch user data from an API
        const { sub, email } = authUser;

        const response = await fetch('/api/database/users', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ sub, email })
        });
        const data = await response.json();
    
        // Set the user data
        setUser(data);
        setIsLoading(false);
    
        return;
    };

    useEffect(() => {
        if (authUser) {
            fetchUser(authUser);
            return;
        }
    }, [authUser]);

    return (
        // Provide the user data and update function to the children components
        <UserContext.Provider value={{ user, isLoading }}>
            {children}
        </UserContext.Provider>
    );
};
