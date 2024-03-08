'use client'

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const SimpleAuthGuard = (props) => {
  const { children } = props;
  const router = useRouter();

  useEffect(() => {
    const isAuthenticated = localStorage.getItem('isAuthenticated');

    if (!isAuthenticated) {
      router.replace('/simple-login');
    }
  }, [router]);

  return <>{children}</>;
};



