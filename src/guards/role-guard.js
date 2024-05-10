const RoleGuard = ({ requiredRole, children, user }) => {

    if (!user) {
        return null;
    } 
    
    if (!requiredRole) {
        // If no role is required, allow access
        return children;
    }

    const userRole = user?.role.toLowerCase().replace(' ', '-');

    if (userRole === 'admin') {
        // Admin has access to everything
        return children;
    } else if (userRole === 'city-owner') {
        // City owner has access to city-owner and community-owner
        if (requiredRole === 'city-owner' || requiredRole === 'community-owner') {
            return children;
        } else {
            // Redirect to unauthorized page for other roles
            return null;
        }
    } else if (userRole === 'community-owner') {
        // Community owner has access to community-owner
        if (requiredRole === 'community-owner') {
            return children;
        } else {
            // Redirect to unauthorized page for other roles
            return null;
        }
    } else {
        // Redirect to unauthorized page if user's role is not recognized
        return null;
    }
};

export default RoleGuard;
