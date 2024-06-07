import ProviderWrapper from "@/contexts/ProviderWrapper";
import AuthGuard from "@/guards/auth-guard";
import { FixedLayout } from "@/layout";

export default function Layout({ children }){
  return (
    <ProviderWrapper>
      <AuthGuard>
        <FixedLayout>
            {children}
        </FixedLayout>
      </AuthGuard>
    </ProviderWrapper>
  );
}