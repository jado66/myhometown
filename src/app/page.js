'use client'
import ProviderWrapper from '@/contexts/ProviderWrapper';
import { MainLayout } from '@/layout';


import { Home } from '@/views/landingPages';

export default function HomePage() {
  return (
    <ProviderWrapper>
      <MainLayout>
        <Home />
      </MainLayout>
    </ProviderWrapper>

  );
}
