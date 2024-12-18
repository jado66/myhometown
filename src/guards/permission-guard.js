import React from "react";
import PropTypes from "prop-types";

const checkPermission = (requiredPermission, userPermissions) => {
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

    return permissions.some(
      (permission) =>
        userPermissions[permission] || userPermissions["administrator"]
    );
  }

  // Single permission check
  return (
    userPermissions[requiredPermission] || userPermissions["administrator"]
  );
};

// Helper function to check if any child items have valid permissions
const hasValidChildPermissions = (pages, userPermissions) => {
  if (!pages) return false;

  return pages.some((page) => {
    if (page.requiredPermission) {
      return checkPermission(page.requiredPermission, userPermissions);
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

  if (checkPermission(requiredPermission, user.permissions)) {
    return children;
  }

  return alternateContent || null;
};

PermissionGuard.propTypes = {
  requiredPermission: PropTypes.string,
  children: PropTypes.node,
  user: PropTypes.shape({
    permissions: PropTypes.object,
  }),
  alternateContent: PropTypes.node,
  pages: PropTypes.arrayOf(
    PropTypes.shape({
      requiredPermission: PropTypes.string,
    })
  ),
};

export default PermissionGuard;
