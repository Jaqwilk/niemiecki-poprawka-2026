import { Suspense } from 'react';
import type { Metadata } from 'next';
import { PracticeView } from '@/components/study/practice-view';

export const metadata: Metadata = {
  title: 'Ćwiczenia',
  description: 'Mieszane ćwiczenia Lektion 13–18 z obowiązkową poprawą.',
};

export default function PracticePage() {
  return (
    <Suspense fallback={null}>
      <PracticeView />
    </Suspense>
  );
}
