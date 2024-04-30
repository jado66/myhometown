'use client'
import ProviderWrapper from "@/contexts/ProviderWrapper";
import { FixedLayout } from "@/layout";
import { withPageAuthRequired } from "@auth0/nextjs-auth0";

export default withPageAuthRequired(function Layout({ children }){
  return (
    <ProviderWrapper>
      <FixedLayout>
        {children}
      </FixedLayout>
    </ProviderWrapper>
  );
})