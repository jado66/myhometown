'use client'
import { SimpleAuthGuard } from '@/guards/simple-auth-guard';

export default function MainLayoutPage() {
  return (
    <SimpleAuthGuard>
        <h1 style={{textAlign:"center"}}>Main Layout</h1>
    </SimpleAuthGuard>
  );
}