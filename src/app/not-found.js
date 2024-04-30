'use client'
import { SimpleAuthGuard } from '@/guards/simple-auth-guard';
import { MainLayout } from '@/layout';

import { NotFound } from '@/views/supportingPages';

export default function HomePage() {
  return (
    <SimpleAuthGuard>
      <MainLayout>
        <NotFound />
      </MainLayout>
    </SimpleAuthGuard>
  );
}
