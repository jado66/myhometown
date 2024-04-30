'use client'
import { SimpleAuthGuard } from '@/guards/simple-auth-guard';

export default function FixedLayoutPage() {
  return (
    <SimpleAuthGuard>
        <h1 style={{textAlign:"center"}}>Fixed Layout</h1>
    </SimpleAuthGuard>
  );
}