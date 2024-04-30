import { createContext, useState, useContext, useEffect } from 'react';

// Create a new context for the user
export const UserContext = createContext();

// Create a UserProvider component
export const UserProvider = ({ children }) => {
    // State to store the user data
    const [user, setUser] = useState(null);
    const [hasLoaded, setHasLoaded] = useState(false);

    // Function to update the user data
    const updateUser = (userData) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    // Load data from localStorage upon mount
    useEffect(() => {
        const userData = JSON.parse(localStorage.getItem('user'));
        if (userData) {
            setUser(userData);
        }

        setHasLoaded(true);
    }, []);

    return (
        // Provide the user data and update function to the children components
        <UserContext.Provider value={{ user, updateUser, hasLoaded }}>
            {children}
        </UserContext.Provider>
    );
};
