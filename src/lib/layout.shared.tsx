import type { BaseLayoutProps } from 'fumadocs-ui/layouts/shared';
import Image from 'next/image';
import brandIcon from '@/app/icon.png';
import { appName, githubUrl } from './shared';
import { TutorNavTrigger } from '@/components/study/tutor-nav-trigger';

export function baseOptions(): BaseLayoutProps {
  return {
    nav: {
      title: (
        <>
          <Image
            src={brandIcon}
            alt=""
            width={24}
            height={24}
            sizes="24px"
            className="size-6 shrink-0 object-contain invert dark:invert-0"
            aria-hidden="true"
          />
          <span>{appName}</span>
        </>
      ),
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
