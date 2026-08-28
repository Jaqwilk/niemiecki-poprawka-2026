import type { Metadata } from 'next';
import { MistakesView } from '@/components/study/mistakes-view';

export const metadata: Metadata = {
  title: 'Moje błędy',
  description: 'Obowiązkowa poprawa błędów z Lektion 13–18.',
};

export default function MistakesPage() {
  return <MistakesView />;
}
