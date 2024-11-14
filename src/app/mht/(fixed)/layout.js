import ImpersonationBanner from "@/components/util/ImpersonationBanner";
import ProviderWrapper from "@/contexts/ProviderWrapper";
import AuthGuard from "@/guards/auth-guard";
import { FixedLayout } from "@/layout";

export default function Layout({ children }) {
  return (
    <ProviderWrapper>
      <AuthGuard>
        <ImpersonationBanner />

        <FixedLayout>{children}</FixedLayout>
      </AuthGuard>
    </ProviderWrapper>
  );
}
