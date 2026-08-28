import type { Metadata } from 'next';
import { StudyDashboard } from '@/components/study/dashboard';

export const metadata: Metadata = {
  title: 'Plan nauki',
  description: 'Pięciodniowy plan nauki Lektion 13–18.',
};

export default function StudyPage() {
  return <StudyDashboard />;
}
