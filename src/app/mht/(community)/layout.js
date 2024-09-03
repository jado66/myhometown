"use client";

import ProviderWrapper from "@/contexts/ProviderWrapper";
import { CommunityLayout } from "@/layout/CommunityLayout";

export default function Layout({ children }) {
  return (
    <ProviderWrapper>
      <CommunityLayout>{children}</CommunityLayout>
    </ProviderWrapper>
  );
}
