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
    <DocsPage>
      <div className={cn(className)}>
        {eyebrow ? (
          <p className="text-xs font-semibold tracking-[0.15em] text-fd-muted-foreground uppercase">
            {eyebrow}
          </p>
        ) : null}
        <DocsTitle className={eyebrow ? 'mt-2' : undefined}>{title}</DocsTitle>
        {description ? (
          <DocsDescription>{description}</DocsDescription>
        ) : null}
        <div className="border-b border-fd-border pb-6" />
        <DocsBody>
          <div className="not-prose pt-2">{children}</div>
        </DocsBody>
      </div>
    </DocsPage>
  );
}
