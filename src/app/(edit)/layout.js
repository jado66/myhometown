'use client'
import ProviderWrapper from "@/contexts/ProviderWrapper";

import { EditLayout } from "@/layout";

export default function Layout({ children }){
  return (
    <ProviderWrapper>
      <EditLayout>
        {children}
      </EditLayout>
    </ProviderWrapper>
  );
}