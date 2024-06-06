'use client'
import { SimpleAuthGuard } from '@/guards/simple-auth-guard';
import { MainLayout } from '@/layout';
import { About } from '@/views/supportingPages';

export default function HomePage() {
  return (
    <SimpleAuthGuard>
      <About />
    </SimpleAuthGuard>
  );
}
