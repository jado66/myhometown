
import React from "react";
import PropTypes from "prop-types";

/**
 * UserGuard component restricts access to children based on a list of allowed user emails.
 * @param {Object} props
 * @param {string[]} props.allowedEmails - List of allowed user emails (case-insensitive).
 * @param {Object} props.user - The user object, must have an `email` property.
 * @param {React.ReactNode} props.children - Content to render if user is allowed.
 * @param {React.ReactNode} [props.alternateContent] - Content to render if user is not allowed.
 */
const UserGuard = ({ allowedEmails, user, children, alternateContent }) => {
  if (!allowedEmails || allowedEmails.length === 0) {
    // If no emails specified, allow all users
    return children;
  }
  if (!user || !user.email) {
    return alternateContent || null;
  }
  const normalizedAllowed = allowedEmails.map((e) => e.trim().toLowerCase());
  const userEmail = user.email.trim().toLowerCase();
  if (normalizedAllowed.includes(userEmail)) {
    return children;
  }
  return alternateContent || null;
};

UserGuard.propTypes = {
  allowedEmails: PropTypes.arrayOf(PropTypes.string).isRequired,
  user: PropTypes.shape({
    email: PropTypes.string,
  }),
  children: PropTypes.node,
  alternateContent: PropTypes.node,
};

export default UserGuard;
