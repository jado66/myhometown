"use client";

import ProviderWrapper from "@/contexts/ProviderWrapper";
import { CityCommunityLayout } from "@/layout/CityCommunityLayout";

export default function Layout({ children }) {
  return (
    <ProviderWrapper>
      <CityCommunityLayout>{children}</CityCommunityLayout>
    </ProviderWrapper>
  );
}
