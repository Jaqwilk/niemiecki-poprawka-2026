import type { Metadata } from 'next';
import { MockTest } from '@/components/study/mock-test';

export const metadata: Metadata = {
  title: 'Digital paper test',
  description: 'Pełny arkusz Lektion 13–18 wzorowany na szkolnych testach użytkownika.',
};

export default function TestPage() {
  return <MockTest />;
}
