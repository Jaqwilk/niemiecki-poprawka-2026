# Deutsch

Prywatna strona do nauki przed egzaminem poprawkowym z języka niemieckiego.
Projekt bazuje na aktualnym, oficjalnym szkielecie Fumadocs: Next.js, TypeScript,
Fumadocs UI, Fumadocs MDX i Tailwind CSS.

## Uruchomienie

Wymagany jest Node.js 24.

```bash
npm install
npm run dev
```

Strona będzie dostępna pod adresem `http://localhost:3000`.

## Najważniejsze polecenia

```bash
npm run dev          # tryb deweloperski
npm run lint         # ESLint
npm run types:check  # typy Next.js i TypeScript
npm run build        # build produkcyjny
npm run check        # kompletna walidacja
```

## Gdzie trafiają materiały

- `materials/` — oryginalne pliki źródłowe, np. PDF-y od prowadzącego.
- `content/docs/` — gotowe notatki w formacie MDX.
- `content/README.md` — docelowa mapa tematów i nazwy plików.
- `src/components/study/` — komponenty do reguł, przykładów, błędów, słownictwa i ćwiczeń.

Nowa notatka `.mdx` umieszczona w odpowiednim folderze jest automatycznie
indeksowana przez Fumadocs i dostępna dla wyszukiwarki. Kolejność stron można
kontrolować w plikach `meta.json`.

## Architektura

- `src/app/(home)` — strona startowa.
- `src/app/docs` — układ notatek, sidebar, breadcrumbs i spis treści.
- `src/app/api/search` — lokalna wyszukiwarka Fumadocs.
- `src/components/mdx.tsx` — globalny rejestr komponentów dostępnych w MDX.
- `src/lib/source.ts` — źródło treści oparte na Fumadocs MDX Macro API.

Repozytorium celowo zawiera na razie wyłącznie infrastrukturę i krótką stronę
oczekiwania. Właściwa treść zostanie opracowana po zebraniu kompletu materiałów.
