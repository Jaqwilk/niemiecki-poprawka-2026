import type { Metadata } from 'next';
import { FlashcardsView } from '@/components/study/flashcards-view';

export const metadata: Metadata = {
  title: 'Fiszki',
  description: 'Wszystkie słówka z Lektion 13–18: fiszki, adaptacyjna nauka i ocenianie AI.',
};

export default function FlashcardsPage() {
  return <FlashcardsView />;
}

