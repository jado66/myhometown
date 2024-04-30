'use client'
import { SimpleAuthGuard } from '@/guards/simple-auth-guard';
import { MainLayout } from '@/layout';

import { NotFound } from '@/views/supportingPages';

export default function HomePage() {
  return (
    <h1>404 Not Found</h1>
    // <SimpleAuthGuard>
    //   <MainLayout>
    //     <NotFound />
    //   </MainLayout>
    // </SimpleAuthGuard>
  );
}
