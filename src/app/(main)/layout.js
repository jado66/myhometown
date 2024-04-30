'use client'

import { MainLayout } from "@/layout";
import ProviderWrapper from "@/contexts/ProviderWrapper";

export default function Layout({ children }){
  return (
    <ProviderWrapper>
      <MainLayout>
        {children}
      </MainLayout>
    </ProviderWrapper>
  );
}