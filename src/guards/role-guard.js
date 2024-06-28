const RoleGuard = ({ requiredRole, children, user, alternateContent }) => {

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
    } else if (userRole === 'city-admin') {
        // City Admin has access to city-admin and community-admin
        if (requiredRole === 'city-admin' || requiredRole === 'community-admin') {
            return children;
        } else {
            // Redirect to unauthorized page for other roles
            return null;
        }
    } else if (userRole === 'community-admin') {
        // Community Admin has access to community-admin
        if (requiredRole === 'community-admin') {
            return children;
        } else {
            // Redirect to unauthorized page for other roles
            return null;
        }
    } else if (alternateContent){
        // return alternate
        return alternateContent;
    }
    
    else{
        // Redirect to unauthorized page if user's role is not recognized
        return null;
    }
};

export default RoleGuard;
