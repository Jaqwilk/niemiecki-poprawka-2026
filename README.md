# Deutsch A1.2 — 5-Day Exam Sprint

Prywatna strona do nauki przed egzaminem poprawkowym z języka niemieckiego.
Projekt bazuje na aktualnym, oficjalnym szkielecie Fumadocs: Next.js, TypeScript,
Fumadocs UI, Fumadocs MDX i Tailwind CSS.

Zakres jest celowo zamknięty do **Momente A1.2, Lektion 13–18**.

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
npm test             # testy logiki nauki
npm run check        # kompletna walidacja
```

## Gdzie trafiają materiały

- `materials/` — oryginalne pliki źródłowe, np. PDF-y od prowadzącego.
- `content/docs/` — gotowe notatki w formacie MDX.
- `docs/study-audit.md` — audyt wszystkich materiałów i formatów testowych.
- `docs/study-architecture.md` — uzasadnienie architektury nauki i aplikacji.
- `src/components/study/` — komponenty do reguł, przykładów, błędów, słownictwa i ćwiczeń.

Nowa notatka `.mdx` umieszczona w odpowiednim folderze jest automatycznie
indeksowana przez Fumadocs i dostępna dla wyszukiwarki. Kolejność stron można
kontrolować w plikach `meta.json`.

## Architektura

- `src/app/(home)` — plan, ćwiczenia, błędy i próba generalna.
- `src/app/docs` — układ notatek, sidebar, breadcrumbs i spis treści.
- `src/app/api/tutor` — strumieniowany tutor przez OpenAI Responses API.
- `src/app/api/edit` — lokalny, kontrolowany Edit Mode z podglądem diffu.
- `src/app/api/search` — lokalna wyszukiwarka Fumadocs.
- `src/components/mdx.tsx` — globalny rejestr komponentów dostępnych w MDX.
- `src/lib/source.ts` — źródło treści oparte na Fumadocs MDX Macro API.

Stan nauki jest zapisywany lokalnie w przeglądarce. Nie ma konta, gamifikacji ani
zewnętrznej bazy danych.

## Tutor AI i źródła

Skopiuj `.env.example` do `.env.local` i ustaw:

```dotenv
OPENAI_API_KEY=
OPENAI_FAST_MODEL=gpt-5.6-luna
OPENAI_MODEL=gpt-5.6-terra
OPENAI_SMART_MODEL=gpt-5.6-sol
OPENAI_VECTOR_STORE_ID=
```

Klucz pozostaje wyłącznie po stronie serwera. Tutor zawsze wyszukuje najpierw w
lokalnych notatkach. Jeśli ustawiony jest `OPENAI_VECTOR_STORE_ID`, Responses API
dodatkowo korzysta z narzędzia `file_search`.

Modele wybiera jedno miejsce: `src/lib/ai/model-router.ts`. Luna obsługuje tanie
zadania strukturalne (`reasoning: none`), Sol wszystkie pytania tutora (`low` dla
szybkiej odpowiedzi, `medium` dla złożonych wyjątków), a Terra pozostaje
zbalansowanym modelem dla pozostałych zadań generacyjnych. Klient automatycznie
ponawia chwilowe błędy połączenia, a limit aplikacji tutora wynosi 1000 pytań na
10 minut z jednego adresu IP.

Indeks źródeł tworzysz poleceniem:

```bash
npm run ai:ingest
```

Skrypt indeksuje notatki i audyt, a także lokalne PDF-y/bazę wiedzy, jeśli są
dostępne. Nie zapisuje klucza ani nie modyfikuje `.env.local`. Skrócony workbook
w `materials/book` pozostaje lokalny i poza Git — repozytorium GitHub nie publikuje
chronionego podręcznika.

## Edit Mode

To narzędzie jest przeznaczone wyłącznie do lokalnego developmentu. Decyzja jest
celowa: wdrożony filesystem bywa nietrwały, a publiczny endpoint zapisu byłby
niepotrzebnym ryzykiem. W `.env.local` ustaw:

```dotenv
EDIT_MODE_ENABLED=true
EDIT_MODE_TOKEN=długi-losowy-sekret
```

Edit Mode działa tylko poza `NODE_ENV=production`, udostępnia wyłącznie jawnie
dozwolone pliki edukacyjne i komponenty nauki, zawsze pokazuje różnicę i zapisuje
dopiero po kliknięciu „Zastosuj”. Przed zapisem tworzy lokalną kopię w
`.codex-backups/`.
