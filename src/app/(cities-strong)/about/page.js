'use client'
import { SimpleAuthGuard } from '@/guards/simple-auth-guard';
import CitiesStrongAbout from '@/views/supportingPages/CitiesStrongAbout';

export default function HomePage() {
  return (
    <SimpleAuthGuard>
      <CitiesStrongAbout />
    </SimpleAuthGuard>
  );
}
