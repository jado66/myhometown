"use client";

import ProviderWrapper from "@/contexts/ProviderWrapper";
import SimpleAuthProvider from "@/contexts/SimpleAuthProvider";
import { FixedLayout } from "@/layout";

export default function Layout({ children }) {
  return (
    <ProviderWrapper>
      <SimpleAuthProvider>
        <FixedLayout>{children}</FixedLayout>
      </SimpleAuthProvider>
    </ProviderWrapper>
  );
}
