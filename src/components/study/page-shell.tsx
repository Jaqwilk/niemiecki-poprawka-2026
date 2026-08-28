import type { ReactNode } from 'react';
import {
  DocsBody,
  DocsDescription,
  DocsPage,
  DocsTitle,
} from 'fumadocs-ui/layouts/docs/page';
import { cn } from '@/lib/cn';

type StudyPageShellProps = {
  eyebrow?: string;
  title: string;
  description?: string;
  children: ReactNode;
  className?: string;
};

export function StudyPageShell({
  eyebrow,
  title,
  description,
  children,
  className,
}: StudyPageShellProps) {
  return (
    <DocsPage footer={{ enabled: false }}>
      <div className={cn(className)}>
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.15em] text-fd-muted-foreground uppercase">
            {eyebrow}
          </p>
        ) : null}
        <DocsTitle className={eyebrow ? 'mt-2' : undefined}>{title}</DocsTitle>
        {description ? (
          <DocsDescription className="mb-0 mt-2">{description}</DocsDescription>
        ) : null}
        <DocsBody className={description ? 'mt-8' : 'mt-6'}>
          <div className="not-prose">{children}</div>
        </DocsBody>
      </div>
    </DocsPage>
  );
}
