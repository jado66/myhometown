"use client";

import { useAuth } from "@/contexts/AuthContext";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";

const AuthGuard = ({ children }) => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading && !user) {
      // Get the current path.
      const returnTo = encodeURIComponent(pathname);

      // Use Router to push to another route.
      router.push(
        process.env.NEXT_PUBLIC_DOMAIN + "/auth/login?returnTo=" + returnTo
      );
    }
  }, [isLoading, user, router]);

  if (isLoading) return <div>Loading...</div>;
  if (!user) return <div>Redirecting...</div>;

  return children;
};

export default AuthGuard;
