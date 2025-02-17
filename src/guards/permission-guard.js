import React from "react";
import PropTypes from "prop-types";

const checkPermission = (requiredPermission, userPermissions, user) => {
  if (!requiredPermission) return true;
  if (!userPermissions) return false;

  // Handle OR conditions
  if (
    typeof requiredPermission === "string" &&
    requiredPermission.includes("||")
  ) {
    const permissions = requiredPermission
      .split("||")
      .map((p) => p.trim())
      .filter(Boolean);

    return permissions.some((permission) => {
      // Special handling for cityManagement and communityManagement
      if (permission === "cityManagement") {
        return user.cities && user.cities.length > 0;
      }
      if (permission === "communityManagement") {
        return user.communities && user.communities.length > 0;
      }
      // Default permission check
      return userPermissions[permission] || userPermissions["administrator"];
    });
  }

  // Single permission check
  if (requiredPermission === "cityManagement") {
    return user.cities && user.cities.length > 0;
  }

  if (requiredPermission === "communityManagement") {
    return user.communities && user.communities.length > 0;
  }

  // Default single permission check
  return (
    userPermissions[requiredPermission] || userPermissions["administrator"]
  );
};

// Helper function to check if any child items have valid permissions
const hasValidChildPermissions = (pages, userPermissions, user) => {
  if (!pages) return false;

  return pages.some((page) => {
    if (page.requiredPermission) {
      return checkPermission(page.requiredPermission, userPermissions, user);
    }
    // If no permission required, page is valid
    return true;
  });
};

const PermissionGuard = ({
  requiredPermission,
  children,
  user,
  alternateContent,
}) => {
  if (!requiredPermission) {
    return children;
  }

  if (!user) return null;

  // For section-level guard with child pages

  // For individual items
  if (checkPermission(requiredPermission, user.permissions, user)) {
    return children;
  }

  return alternateContent || null;
};

PermissionGuard.propTypes = {
  requiredPermission: PropTypes.string,
  children: PropTypes.node,
  user: PropTypes.shape({
    permissions: PropTypes.object,
    cities: PropTypes.array,
    communities: PropTypes.array,
  }),
  alternateContent: PropTypes.node,
  pages: PropTypes.arrayOf(
    PropTypes.shape({
      requiredPermission: PropTypes.string,
    })
  ),
};

export default PermissionGuard;
