'use client';

import Index from '@/screens/Index';
import { Suspense } from 'react';

export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <Index />
    </Suspense>
  );
}
