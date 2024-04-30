'use client'
import { SimpleAuthGuard } from '@/guards/simple-auth-guard';

import { Home } from '@/views/landingPages';

export default function HomePage() {
  return (
    <SimpleAuthGuard>
        <Home />
    </SimpleAuthGuard>
  );
}