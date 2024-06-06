'use client'
import { SimpleAuthGuard } from '@/guards/simple-auth-guard';
import { LoginSimple } from '@/views/authPages';


export default function AdminLoginPage() {
  return (
    // <SimpleAuthGuard>
      <LoginSimple />
    // </SimpleAuthGuard>
  );
}
