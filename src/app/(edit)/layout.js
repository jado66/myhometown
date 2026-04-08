"use client";
import ImpersonationBanner from "@/components/util/ImpersonationBanner";
import EditCityProvider from "@/contexts/EditProvider";
import ProviderWrapper from "@/contexts/ProviderWrapper";
import AuthGuard from "@/guards/auth-guard";

import { EditLayout } from "@/layout";

export default function Layout({ children }) {
  return (
    <ProviderWrapper>
      {/* <AuthGuard> */}
      <ImpersonationBanner />
      <EditCityProvider>
        <EditLayout>{children}</EditLayout>
      </EditCityProvider>
      {/* </AuthGuard> */}
    </ProviderWrapper>
  );
}
