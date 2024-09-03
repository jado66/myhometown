"use client";

import ProviderWrapper from "@/contexts/ProviderWrapper";
import { CityLayout } from "@/layout/CityLayout";

export default function Layout({ children }) {
  return (
    <ProviderWrapper>
      <CityLayout>{children}</CityLayout>
    </ProviderWrapper>
  );
}
