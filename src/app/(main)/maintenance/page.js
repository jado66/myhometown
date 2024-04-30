'use client'
import { SimpleAuthGuard } from '@/guards/simple-auth-guard';
import { MaintenanceMode } from '@/views/supportingPages';

export default function MainLayoutPage() {
  return (
    <SimpleAuthGuard>
        <MaintenanceMode/>
    </SimpleAuthGuard>
  );
}