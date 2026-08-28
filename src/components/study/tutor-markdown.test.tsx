import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { TutorMarkdown } from './tutor-markdown';

describe('TutorMarkdown', () => {
  it('renders GFM tables, lists, quotes and fenced code as semantic HTML', () => {
    const html = renderToStaticMarkup(
      <TutorMarkdown>{`## Porównanie

| Forma | Przypadek |
| --- | --- |
| mit | Dativ |

1. Pierwsza zasada
2. Druga zasada

> Uwaga na rodzajnik.

\`\`\`text
Ich fahre mit dem Bus.
\`\`\``}</TutorMarkdown>,
    );

    expect(html).toContain('<table');
    expect(html).toContain('Tabela w odpowiedzi tutora');
    expect(html).toContain('<ol');
    expect(html).toContain('<blockquote');
    expect(html).toContain('<pre');
    expect(html).toContain('Ich fahre mit dem Bus.');
  });

  it('does not execute raw HTML or unsafe links from model output', () => {
    const html = renderToStaticMarkup(
      <TutorMarkdown>{`<script>alert('x')</script> [zły link](javascript:alert('x'))`}</TutorMarkdown>,
    );

    expect(html).not.toContain('<script');
    expect(html).not.toContain('javascript:');
  });
});
