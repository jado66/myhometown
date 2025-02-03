"use client";

import ProviderWrapper from "@/contexts/ProviderWrapper";
import SimpleAuthProvider from "@/contexts/SimpleAuthProvider";
import { FixedLayout } from "@/layout";

export default function Layout({ children }) {
  return (
    <ProviderWrapper>
      <FixedLayout>{children}</FixedLayout>
    </ProviderWrapper>
  );
}
