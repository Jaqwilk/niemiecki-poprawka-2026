import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import { appName, githubUrl } from './shared';
import { TutorNavTrigger } from '@/components/study/tutor-nav-trigger';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: appName,
      url: '/study',
    },
    links: [
      {
        type: 'custom',
        children: <TutorNavTrigger />,
      },
    ],
    searchToggle: {
      enabled: true,
    },
    themeSwitch: {
      enabled: true,
    },
    githubUrl,
  };
}
