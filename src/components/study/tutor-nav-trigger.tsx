'use client';

import { Bot } from 'lucide-react';

export function TutorNavTrigger() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent('study:tutor-open'))}
      className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm text-fd-muted-foreground transition-colors hover:bg-fd-muted hover:text-fd-foreground"
    >
      <Bot className="size-4" aria-hidden="true" />
      Tutor AI
      <span className="ml-auto text-[10px]">Ctrl J</span>
    </button>
  );
}
