'use client'
import ProviderWrapper from '@/contexts/ProviderWrapper';
import { SimpleAuthGuard } from '@/guards/simple-auth-guard';
import { MainLayout } from '@/layout';


import { Home } from '@/views/landingPages';

export default function HomePage() {
  return (
    <ProviderWrapper>
      <SimpleAuthGuard>
        <MainLayout>
          <Home />
        </MainLayout>
      </SimpleAuthGuard>
    </ProviderWrapper>

  );
}
