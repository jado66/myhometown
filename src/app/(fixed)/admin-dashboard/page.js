'use client'
import { SimpleAuthGuard } from '@/guards/simple-auth-guard';
import AdminDashboardPages from '@/views/admin/AdminDashboard';

export default function AdminDashboardPage() {
  return (
    <SimpleAuthGuard>
      <AdminDashboardPages />
    </SimpleAuthGuard>
  );
}