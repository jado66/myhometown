import ProviderWrapper from "@/contexts/ProviderWrapper";
import { SessionProvider } from "next-auth/react";

import { FixedLayout } from "@/layout";

export default function Layout({ children }) {
  return (
    <ProviderWrapper>
      <SessionProvider>
        <FixedLayout>{children}</FixedLayout>
      </SessionProvider>
    </ProviderWrapper>
  );
}
