# Architektura systemu nauki

## Cel produktu

Lokalna, osobista aplikacja do intensywnej powtórki **Lektion 13–18 w pięć dni**. Ma wyglądać jak istniejący szablon Fumadocs: spokojnie, neutralnie i dokumentacyjnie. Najważniejsza jest szybka droga od materiału do aktywnej odpowiedzi, błędu i poprawy.

## Zasady interfejsu

- zachowujemy typografię, szerokość treści, sidebar, jasny/ciemny motyw i oszczędne obramowania Fumadocs;
- nie budujemy marketingowego landing page ani siatki ozdobnych kart;
- jeden akcent kolorystyczny służy stanom aktywnym, postępowi i poprawnej odpowiedzi;
- najważniejsza akcja na ekranie jest jedna;
- ruch ograniczamy do krótkich przejść stanu; respektujemy `prefers-reduced-motion`;
- na telefonie sidebar przechodzi w istniejącą nawigację mobilną, a ćwiczenia pozostają jedną kolumną;
- nie pokazujemy fikcyjnych statystyk ani fałszywej aktywności.

## Mapa informacji i trasy

| Trasa | Funkcja |
| --- | --- |
| `/study` | dashboard pięciodniowego sprintu, bieżący dzień, postęp, szybki powrót |
| `/docs/lessons/13` … `/docs/lessons/18` | sześć zwartych notatek Fumadocs |
| `/docs/grammatik` | osobna, prosta powtórka całej gramatyki Lektion 13–18 |
| `/practice` | rekomendowany zestaw zadań, tryb tematyczny i mieszany |
| `/mistakes` | kolejka błędów i obowiązkowa poprawa |
| `/test` | pełna próba bez feedbacku w trakcie; wynik i analiza po oddaniu |
| `/api/tutor` | strumieniowana odpowiedź korepetytora z kontekstem i retrievalem |
| `/api/edit/propose` | propozycja zmiany dozwolonego pliku dla Edit Mode |
| `/api/edit/apply` | jawne zastosowanie wcześniej zatwierdzonej propozycji |

Strona główna `/` przekierowuje do `/study`. Główna nawigacja pozostaje krótka: **Nauka, Lekcje, Gramatyka, Ćwiczenia, Fiszki, Błędy, Test**. Repozytorium GitHub pozostaje dyskretnym linkiem w stopce/rogu, zgodnym z szablonem.

## Warstwa treści

### Notatki

Treść lekcji pozostaje w MDX pod `content/docs/lessons`. Każda lekcja ma ten sam rytm:

1. czego trzeba umieć;
2. aktywne przypomnienie bez podpowiedzi;
3. małe grupy słownictwa sytuacyjnego;
4. reguła gramatyczna po polsku;
5. naturalne przykłady niemieckie z tłumaczeniem tylko tam, gdzie pomaga;
6. typowe pułapki;
7. komunikacja/pisanie/mówienie;
8. krótki blok „sprawdź się” i link do ćwiczeń.

Rozszerzenia nauczyciela (`dies-`, `denn`, `um … zu`, opis ilustracji) są wyraźnie oznaczone, aby nie zacierać zakresu podręcznikowego.

### Dane ćwiczeń

Pytania przechowujemy jako typowane dane TypeScript, niezależnie od komponentów UI. Minimalny rekord:

```ts
type StudyQuestion = {
  id: string;
  lesson: 13 | 14 | 15 | 16 | 17 | 18;
  topic: string;
  skill: "vocabulary" | "grammar" | "reading" | "writing" | "speaking";
  type: "choice" | "true-false" | "input" | "order" | "correction" | "dialogue";
  prompt: string;
  options?: string[];
  acceptedAnswers?: string[];
  explanation: string;
  source: string;
  difficulty: 1 | 2 | 3;
};
```

Normalizacja odpowiedzi może ignorować wielkość liter, zbędne końcowe znaki i nadmiarowe spacje, ale nie może ukrywać błędu przypadka, końcówki albo szyku. Każde pytanie ma krótkie wyjaśnienie odnoszące się do konkretnej reguły.

## Stan nauki

To aplikacja osobista i lokalna, dlatego pierwsza wersja używa `localStorage`, bez konta i bazy danych. Dane nie opuszczają przeglądarki poza treścią świadomie wysłaną do korepetytora AI.

```ts
type StudyState = {
  version: 1;
  sprintStartedAt: string | null;
  activeDay: 1 | 2 | 3 | 4 | 5;
  lessonProgress: Record<string, number>;
  attempts: Attempt[];
  mistakes: MistakeRecord[];
  mockAttempts: MockAttempt[];
};
```

`MistakeRecord` zapisuje co najmniej:

- identyfikator pytania;
- lekcję, temat i umiejętność;
- odpowiedź użytkownika i odpowiedź oczekiwaną;
- wyjaśnienie;
- liczbę prób;
- datę ostatniej próby;
- stan `open` albo `resolved`.

Błąd znika z aktywnej kolejki dopiero po poprawnej odpowiedzi w trybie poprawy. Dashboard opiera rekomendację na otwartych błędach, wynikach tematów i zakresie bieżącego dnia, a nie na sztucznym liczniku „streak”.

## Logika pięciodniowego sprintu

- **Dzień 1:** Lektion 13–14, miasto, Akkusativ/Dativ, mapa.
- **Dzień 2:** Lektion 15–16 i szybka powtórka 13–15.
- **Dzień 3:** Lektion 17–18 oraz dodatki nauczyciela.
- **Dzień 4:** miks formatów egzaminacyjnych i celowane ćwiczenia słabych tematów.
- **Dzień 5:** próba generalna, analiza i obowiązkowa poprawa.

Użytkownik może ręcznie zmienić aktywny dzień. Aplikacja nie zakłada, że data systemowa równa się faktycznemu dniowi nauki.

## Silnik ćwiczeń

### Dobór rekomendowanego pytania

Kolejność priorytetów:

1. otwarte błędy, których jeszcze nie poprawiono;
2. tematy z najniższą skutecznością i co najmniej dwiema próbami;
3. materiał bieżącego dnia, którego jeszcze nie ćwiczono;
4. przeplatana powtórka wcześniejszych lekcji;
5. nowe pytanie o odpowiednim poziomie trudności.

Następne pytanie nie powinno powtarzać tego samego promptu bezpośrednio, chyba że użytkownik uruchomił poprawę błędu.

### Feedback

- zwykłe ćwiczenia: ocena po odpowiedzi, zwięzłe wyjaśnienie, link do właściwej lekcji;
- poprawa błędów: ta sama reguła w lekko zmienionym kontekście, a potem oryginalne pytanie kontrolne;
- próba: brak poprawności i wyjaśnień aż do końcowego oddania.

### Próba generalna

Próba ma stały, wersjonowany zestaw obejmujący wszystkie lekcje i cztery sekcje:

1. słownictwo i informacja w tekście;
2. gramatyka i szyk;
3. komunikacja/dialog;
4. pisanie i mówienie z checklistą.

Automatycznie liczymy zadania zamknięte i krótkie odpowiedzi z kontrolowanymi wariantami. Zadania otwarte otrzymują checklistę samooceny; opcjonalna ocena AI może pomóc, ale nie zastępuje jawnych kryteriów. Po oddaniu każdy błędny element trafia do kolejki poprawy.

## Korepetytor AI

### Technologia

- tylko **OpenAI Responses API** po stronie serwera;
- scentralizowany router: `OPENAI_FAST_MODEL` (Luna), `OPENAI_MODEL` (Terra) i `OPENAI_SMART_MODEL` (Sol);
- klucz wyłącznie w `OPENAI_API_KEY` po stronie serwera;
- `OPENAI_VECTOR_STORE_ID` wskazuje przygotowany magazyn wektorowy;
- odpowiedzi są strumieniowane;
- retrieval używa narzędzia `file_search` ograniczonego do wskazanego vector store.

Klient nigdy nie otrzymuje klucza API. Endpoint waliduje długość i kształt wejścia, ogranicza historię rozmowy oraz wysyła do modelu tylko potrzebny kontekst.

### Priorytet źródeł

1. znormalizowane notatki Lektion 13–18;
2. wyciągi z workbooka i oficjalnych testów;
3. materiały nauczyciela;
4. dopiero potem ogólna wiedza językowa modelu.

Prompt systemowy wymaga, aby tutor:

- odpowiadał po polsku z niemieckimi przykładami;
- tłumaczył naturalny sens przed ewentualnym objaśnieniem dosłownym;
- zachowywał osobę, czas, przeczenie i rejestr oraz podawał rodzajnik albo
  konstrukcję czasownika, gdy pomaga to w nauce;
- pokazywał pełną poprawioną odpowiedź, dokładny błąd i jego przyczynę;
- nie wychodził poza zakres, jeśli pytanie dotyczy egzaminu;
- jasno oznaczał rozszerzenia nauczyciela;
- przy niepewności mówił, czego nie znalazł w źródłach;
- nie udawał cytatu ani numeru strony;
- preferował krótkie wyjaśnienie i jedno minićwiczenie kontrolne.

Router nie rozrzuca identyfikatorów modeli po endpointach. Zadania klasyfikacji,
scoringu i metadanych kieruje do Luna z `reasoning: none`. Tutor korzysta z Sol:
z `low` dla szybkich tłumaczeń i zwykłych wyjaśnień oraz z `medium` dla pytań
trudnych lub niejednoznacznych. Terra pozostaje dla pozostałych zbalansowanych
zadań generacyjnych. Zwykła zmiana pliku ma `medium`, a większy
refaktor/debugging `high`. Deterministyczny scoring pytań nie wywołuje modelu.

Limit ochronny tutora jest ustawiony na 1000 pytań na 10 minut z jednego adresu
IP. Klient ponawia do dwóch razy chwilowe błędy sieciowe i odpowiedzi 5xx, ale nie
zapętla ponowień przy pracy offline ani przy limicie konta OpenAI. Treść pytania
pozostaje w panelu, aby użytkownik mógł ponowić je ręcznie.

### Ingest źródeł

Skrypt w `scripts`:

1. zbiera wyłącznie dozwolone pliki MD/MDX z zakresu 13–18 oraz jawnie wskazane wyciągi materiałów;
2. tworzy lub wykorzystuje vector store;
3. przesyła pliki i czeka na zakończenie indeksowania;
4. wypisuje identyfikator do ręcznego wklejenia jako `OPENAI_VECTOR_STORE_ID`;
5. nie zapisuje klucza i nie modyfikuje `.env.local`.

W UI, jeśli konfiguracji brak, panel pokazuje uczciwy komunikat konfiguracyjny; reszta aplikacji działa bez AI.

## Kontekstowe „Zapytaj AI”

Na stronach lekcji klient wykrywa świadome zaznaczenie tekstu. Pojawia się mały przycisk **Zapytaj AI**, a po kliknięciu panel wysyła:

- zaznaczenie;
- aktualną trasę i tytuł lekcji;
- najbliższy nagłówek;
- ograniczony fragment otaczającego akapitu;
- pytanie użytkownika.

Nie wysyłamy całej strony ani zaznaczenia automatycznie. Przy bardzo krótkim lub zbyt długim zaznaczeniu akcja jest niedostępna. Panel działa z klawiatury i ma czytelny fokus.

## Kontrolowany Edit Mode

Edit Mode jest narzędziem deweloperskim, nie częścią zwykłej nauki.

### Ograniczenia

- domyślnie wyłączony;
- uruchamiany tylko przy `EDIT_MODE_ENABLED=true` i poprawnym sekretnym `EDIT_MODE_TOKEN`;
- w produkcji pozostaje zablokowany, chyba że środowisko zostanie świadomie skonfigurowane;
- allowlista ścieżek obejmuje wyłącznie `content/docs/lessons` i wskazane pliki danych nauki;
- zakaz ścieżek absolutnych, `..`, symlinków wychodzących poza repo i plików sekretów;
- limity rozmiaru pliku, propozycji i liczby operacji;
- model najpierw zwraca ustrukturyzowaną propozycję, nigdy nie zapisuje pliku bezpośrednio.

### Przepływ

1. użytkownik opisuje zmianę i wskazuje plik;
2. serwer odczytuje tylko dozwolony plik;
3. AI przygotowuje propozycję;
4. aplikacja pokazuje podgląd różnicy;
5. użytkownik wybiera **Zastosuj** albo **Odrzuć**;
6. serwer ponownie sprawdza token, identyfikator propozycji, hash pliku i allowlistę;
7. zapis następuje tylko, jeśli plik nie zmienił się od wygenerowania różnicy.

To zapobiega niewidocznemu nadpisaniu zmian i ogranicza powierzchnię dostępu do repo.

## Struktura kodu

Planowane granice odpowiedzialności:

```text
content/docs/lessons/       pełne notatki MDX 13–18
content/docs/grammatik/     osobne, uproszczone objaśnienia gramatyki
src/app/study/              dashboard
src/app/practice/           ćwiczenia
src/app/mistakes/           poprawa błędów
src/app/test/               próba generalna
src/app/api/tutor/          Responses API + file_search
src/app/api/edit/           bezpieczny propose/apply
src/components/study/       małe komponenty interfejsu nauki
src/lib/study/              typy, pytania, scoring, rekomendacje, persistence
src/lib/ai/                 walidacja, prompt, retrieval i klient serwerowy
scripts/                    ingest do vector store
docs/                       audyt i architektura
```

Komponenty widoku nie zawierają banku odpowiedzi ani logiki rekomendacji. Funkcje scoringu i doboru pytania mają być czyste i testowalne bez przeglądarki.

## Dostępność i responsywność

- pełna obsługa odpowiedzi, paneli i dialogów klawiaturą;
- komunikaty wyniku przez właściwe regiony `aria-live`;
- kolor nigdy nie jest jedynym nośnikiem informacji;
- cele dotykowe co najmniej 44 px tam, gdzie to możliwe;
- brak poziomego przewijania przy szerokości telefonu;
- formularze mają widoczne etykiety, błędy i stan oczekiwania;
- test nie traci odpowiedzi przy przypadkowym odświeżeniu.

## Konfiguracja środowiska

`.env.example` dokumentuje bez wartości:

```dotenv
OPENAI_API_KEY=
OPENAI_FAST_MODEL=gpt-5.6-luna
OPENAI_MODEL=gpt-5.6-terra
OPENAI_SMART_MODEL=gpt-5.6-sol
OPENAI_VECTOR_STORE_ID=
EDIT_MODE_ENABLED=false
EDIT_MODE_TOKEN=
```

Sekrety nie trafiają do repo, kodu klienta, logów ani odpowiedzi endpointów.

## Weryfikacja końcowa

1. lint, TypeScript i build produkcyjny;
2. testy jednostkowe scoringu, normalizacji odpowiedzi i rekomendacji;
3. ręczne przejście desktop/mobile przez wszystkie trasy;
4. sprawdzenie jasnego i ciemnego motywu;
5. próba błędnej/pustej odpowiedzi, ponowienia błędu i odświeżenia stanu;
6. próba pełnego testu bez przecieku feedbacku przed oddaniem;
7. tutor bez klucza, z błędną konfiguracją i — jeśli dostępny klucz — z prawdziwym strumieniem/file search;
8. Edit Mode: odrzucenie niedozwolonej ścieżki, błędnego tokenu i nieaktualnego hasha;
9. sprawdzenie konsoli pod kątem hydration warnings i błędów runtime;
10. kontrola prostoty: usunięcie każdego elementu, który nie pomaga uczyć się, nawigować albo naprawiać błędu.
