# Hostinger deployment

The shared-hosting variant uses a static Next.js export and two PHP endpoints:

- `/api/tutor` proxies OpenAI Responses API requests without exposing the API key;
- `/api/search` serves the generated local lesson search index.

Run `npm run build:hostinger`. Generated files are written to ignored folders under
`output/`. The real `deutsch-ai.php` configuration must be stored outside
`public_html`, under `domains/jebaccwelazniemieckiego.pl/config/`, and must never be
committed.
