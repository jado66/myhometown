"use client";
import React, { use } from "react";
import { useSimpleAuth } from "@/contexts/SimpleAuthProvider";
import { useUser } from "@/contexts/UserProvider";

/**
 * HOC: withAuthenticatedOnce
 * Wrap a component so it only renders AFTER the user has authenticated at least once
 * (by any simple auth token OR via Supabase/UserProvider).
 *
 * Usage:
 *   export default withAuthenticatedOnce(MyComponent);
 *   // Or with a fallback placeholder:
 *   export default withAuthenticatedOnce(MyComponent, { fallback: <div>Locked</div> });
 */
export const withAuthenticatedOnce = (Component, options = {}) => {
  const { fallback = null, showWhileDetermining = null } = options;

  const Wrapped = (props) => {
    const { hasAuthenticatedOnce, isDetermining } = useSimpleAuth();

    if (isDetermining && showWhileDetermining) return showWhileDetermining;
    if (!hasAuthenticatedOnce) return fallback;
    return <Component {...props} />;
  };

  Wrapped.displayName = `WithAuthenticatedOnce(${
    Component.displayName || Component.name || "Component"
  })`;
  return Wrapped;
};

/**
 * Convenience component pattern if you prefer declarative usage:
 * <ShowIfAuthenticatedOnce fallback={<div>Login first">}>Secret</ShowIfAuthenticatedOnce>
 */
export const ShowIfAuthenticatedOnce = ({ children, fallback = null }) => {
  const { user } = useUser();

  if (user && user.email) {
    return <>{children}</>;
  }

  const { hasAuthenticatedOnce, isDetermining } = useSimpleAuth();
  if (isDetermining) return null; // or a spinner
  if (!hasAuthenticatedOnce) return fallback;
  return <>{children}</>;
};

export default withAuthenticatedOnce;
