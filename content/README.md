# Plan treści

Ten katalog zawiera docelową mapę notatek. Plików lekcji jeszcze nie utworzono,
aby nie mieszać szablonowej treści z materiałami egzaminacyjnymi.

## Docelowa struktura

```text
content/docs/
├── index.mdx                         # Übersicht
├── start/
│   ├── lernplan.mdx
│   └── pruefung.mdx
├── grammatik/
│   ├── zeiten/
│   │   ├── praesens.mdx
│   │   ├── perfekt.mdx
│   │   ├── praeteritum.mdx
│   │   ├── plusquamperfekt.mdx
│   │   └── futur-i.mdx
│   ├── modalverben.mdx
│   ├── konjunktiv-ii.mdx
│   ├── passiv.mdx
│   ├── nebensaetze.mdx
│   ├── weil-dass-obwohl.mdx
│   ├── relativsaetze.mdx
│   ├── praepositionen.mdx
│   ├── verben-mit-praepositionen.mdx
│   ├── adjektivdeklination.mdx
│   └── wortstellung.mdx
├── wortschatz/
│   ├── mensch.mdx
│   ├── schule.mdx
│   ├── arbeit.mdx
│   ├── reisen.mdx
│   ├── wohnen.mdx
│   ├── gesundheit.mdx
│   ├── freizeit.mdx
│   └── umwelt.mdx
├── schreiben/
│   ├── e-mail.mdx
│   ├── nachricht.mdx
│   ├── beschreibung.mdx
│   ├── meinung.mdx
│   └── nuetzliche-wendungen.mdx
├── sprechen/
│   ├── ueber-mich.mdx
│   ├── bildbeschreibung.mdx
│   ├── meinung-aeussern.mdx
│   ├── diskussion.mdx
│   └── pruefungssaetze.mdx
└── pruefung/
    ├── wichtigste-themen.mdx
    ├── haeufige-fehler.mdx
    ├── cheat-sheet.mdx
    └── mini-tests.mdx
```

## Minimalny szablon lekcji

```mdx
---
title: Tytuł lekcji
description: Krótki opis widoczny pod tytułem.
---

## Pierwsza sekcja

Treść opracowana na podstawie materiałów.
```

Komponenty `Rule`, `Example`, `Mistake`, `Vocabulary`, `ExamTip`, `Exercise`
i `Flashcard` są dostępne w każdym pliku MDX bez dodatkowych importów.
