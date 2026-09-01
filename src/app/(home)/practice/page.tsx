import type { Metadata } from 'next';
import { PracticeView } from '@/components/study/practice-view';

export const metadata: Metadata = {
  title: 'Cyfrowe arkusze ćwiczeń',
  description: 'Rozłączne z testem ćwiczenia Lektion 13–18 z obowiązkową poprawą.',
};

export default function PracticePage() {
  return <PracticeView />;
}
