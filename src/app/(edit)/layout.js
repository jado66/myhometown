'use client'
import EditCityProvider from "@/contexts/EditCityProvider";
import ProviderWrapper from "@/contexts/ProviderWrapper";

import { EditLayout } from "@/layout";

export default function Layout({ children }){
  return (
    <ProviderWrapper>
      <EditCityProvider>
        <EditLayout>
          {children}
        </EditLayout>
      </EditCityProvider>
    </ProviderWrapper>
  );
}