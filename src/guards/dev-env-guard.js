import React from "react";
import PropTypes from "prop-types";

const checkEnvironment = (requiredEnvironment) => {
  if (!requiredEnvironment) return true;

  // Get the current environment from environment variable
  const currentEnvironment = process.env.NEXT_PUBLIC_ENVIRONMENT || "";

  return currentEnvironment === requiredEnvironment;
};

const DevEnvGuard = ({ children, alternateContent }) => {
  // Only show children if environment is 'dev'
  if (checkEnvironment("dev")) {
    return children;
  }

  return alternateContent || null;
};

DevEnvGuard.propTypes = {
  children: PropTypes.node,
  alternateContent: PropTypes.node,
};

export default DevEnvGuard;
