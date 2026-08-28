import type { Metadata } from 'next';
import { MockTest } from '@/components/study/mock-test';

export const metadata: Metadata = {
  title: 'Próba generalna',
  description: 'Próba Lektion 13–18 oparta na oficjalnych formatach testowych.',
};

export default function TestPage() {
  return <MockTest />;
}
