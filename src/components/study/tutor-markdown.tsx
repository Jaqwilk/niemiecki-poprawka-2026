import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';

function safeTutorUrl(value: string) {
  const url = value.trim();
  if (/^(https?:|mailto:|\/|#)/i.test(url)) return url;
  return '';
}

const components: Components = {
  h1: ({ children }) => <h1 className="mt-5 mb-2 text-base font-semibold tracking-tight first:mt-0">{children}</h1>,
  h2: ({ children }) => <h2 className="mt-5 mb-2 text-[15px] font-semibold tracking-tight first:mt-0">{children}</h2>,
  h3: ({ children }) => <h3 className="mt-4 mb-1.5 text-sm font-semibold first:mt-0">{children}</h3>,
  p: ({ children }) => <p className="my-2.5 first:mt-0 last:mb-0">{children}</p>,
  strong: ({ children }) => <strong className="font-semibold text-fd-foreground">{children}</strong>,
  em: ({ children }) => <em className="text-fd-foreground/90">{children}</em>,
  ul: ({ children }) => <ul className="my-3 list-disc space-y-1.5 pl-5 marker:text-fd-muted-foreground">{children}</ul>,
  ol: ({ children }) => <ol className="my-3 list-decimal space-y-1.5 pl-5 marker:font-medium marker:text-fd-muted-foreground">{children}</ol>,
  li: ({ children }) => <li className="pl-1 [&>p]:my-0">{children}</li>,
  blockquote: ({ children }) => (
    <blockquote className="my-3 rounded-r-lg border-l-2 border-fd-primary bg-fd-muted/45 px-3 py-2 text-fd-muted-foreground [&>p]:my-0">
      {children}
    </blockquote>
  ),
  a: ({ href = '', children }) => {
    const external = /^https?:\/\//i.test(href);
    return (
      <a
        href={safeTutorUrl(href)}
        target={external ? '_blank' : undefined}
        rel={external ? 'noreferrer noopener' : undefined}
        className="font-medium text-fd-primary underline decoration-fd-primary/35 underline-offset-2 hover:decoration-fd-primary"
      >
        {children}
      </a>
    );
  },
  code: ({ className, children }) => {
    const block = Boolean(className?.startsWith('language-')) || String(children).includes('\n');
    return (
      <code
        className={
          block
            ? `font-mono text-[12px] leading-5 ${className ?? ''}`
            : 'rounded-md border border-fd-border/70 bg-fd-muted px-1.5 py-0.5 font-mono text-[0.9em] text-fd-foreground'
        }
      >
        {children}
      </code>
    );
  },
  pre: ({ children }) => (
    <pre
      tabIndex={0}
      className="my-3 max-w-full overflow-x-auto rounded-lg border border-fd-border bg-fd-muted/55 p-3 text-fd-foreground outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
    >
      {children}
    </pre>
  ),
  table: ({ children }) => (
    <div
      role="region"
      aria-label="Tabela w odpowiedzi tutora"
      tabIndex={0}
      className="my-3 max-w-full overflow-x-auto rounded-lg border border-fd-border outline-none focus-visible:ring-2 focus-visible:ring-fd-ring"
    >
      <table className="w-full min-w-[34rem] border-collapse text-left text-xs leading-5">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-fd-muted/75 text-fd-foreground">{children}</thead>,
  tbody: ({ children }) => <tbody className="divide-y divide-fd-border">{children}</tbody>,
  tr: ({ children }) => <tr className="align-top even:bg-fd-muted/20">{children}</tr>,
  th: ({ children }) => <th className="min-w-28 border-r border-fd-border px-3 py-2 font-semibold last:border-r-0">{children}</th>,
  td: ({ children }) => <td className="min-w-28 border-r border-fd-border px-3 py-2 last:border-r-0">{children}</td>,
  hr: () => <hr className="my-4 border-fd-border" />,
  del: ({ children }) => <del className="text-fd-muted-foreground decoration-fd-muted-foreground/70">{children}</del>,
  input: ({ checked }) => (
    <input
      type="checkbox"
      checked={Boolean(checked)}
      disabled
      readOnly
      className="mr-2 size-3.5 translate-y-0.5 accent-fd-primary"
      aria-label={checked ? 'Wykonane' : 'Niewykonane'}
    />
  ),
  img: ({ alt = '' }) => (
    <span className="inline-flex rounded-md border border-fd-border bg-fd-muted px-2 py-1 text-xs text-fd-muted-foreground">
      Obraz{alt ? `: ${alt}` : ''}
    </span>
  ),
};

export function TutorMarkdown({ children }: { children: string }) {
  return (
    <div className="min-w-0 [overflow-wrap:anywhere] text-sm leading-6 text-fd-foreground">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={components}
        skipHtml
        urlTransform={safeTutorUrl}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
