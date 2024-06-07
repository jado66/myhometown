import React from 'react';

export const AuthContext = React.createContext();

export default function AuthProvider({ children }) {
    async function isAdmin(req, res) {
        const session = await getSession(req, res);
        if (!session?.user['http://myhometown.com/roles'].includes('admin')) {
            return { props: { error: 'Forbidden' } }
        }
        return session;
    }

    return <AuthContext.Provider value={{ isAdmin }}>{children}</AuthContext.Provider>;
}