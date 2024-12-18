import ProviderWrapper from "@/contexts/ProviderWrapper";
import { FixedLayout } from "@/layout";

export default function Layout({ children }) {
  return (
    <ProviderWrapper>
      <FixedLayout>{children}</FixedLayout>
    </ProviderWrapper>
  );
}
