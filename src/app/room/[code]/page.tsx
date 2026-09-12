'use client';

import Room from '@/screens/Room';
import { Suspense } from 'react';

export default function RoomPage() {
  return (
    <Suspense fallback={null}>
      <Room />
    </Suspense>
  );
}
