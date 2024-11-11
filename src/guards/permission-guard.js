const PermissionGuard = ({
  requiredPermission,
  children,
  user,
  alternateContent,
}) => {
  if (!user) {
    return null;
  }

  if (!requiredPermission) {
    // If no permission is required, allow access
    return children;
  }

  // Check if user has the required permission
  if (user.permissions && user.permissions[requiredPermission]) {
    return children;
  } else if (alternateContent) {
    return alternateContent;
  }

  return null;
};

export default PermissionGuard;
