import type { StudyQuestion } from './types';

const workbook = (printedPage: number) => ({
  label: `Momente A1.2 Arbeitsbuch, s. ${printedPage}`,
  printedPage,
  type: 'workbook' as const,
});

const review = (printedPage: number) => ({
  label: `Momente A1.2 Wiederholung, s. ${printedPage}`,
  printedPage,
  type: 'review' as const,
});

const test = (printedPage: number) => ({
  label: `Momente A1.2 Test/Prüfungstraining, s. ${printedPage}`,
  printedPage,
  type: 'test' as const,
});

const teacher = (label: string) => ({ label, type: 'teacher' as const });

const fokusBeruf = (module: 5 | 6, title: string) => ({
  label: `Momente A1.2 Fokus Beruf, Modul ${module}: ${title}`,
  type: 'workbook' as const,
});

const moduleTest = (module: 5 | 6) => ({
  label: `Momente A1.2 TEST, Modul ${module}`,
  type: 'test' as const,
});

export const studyQuestions = [
  {
    id: 'l13-es-gibt-einen', lesson: 13, topic: 'es gibt + Akkusativ', skill: 'grammar', kind: 'choice',
    prompt: 'In Berlin gibt es ___ großen Park.', options: ['ein', 'einen', 'einem'],
    acceptedAnswers: ['einen'], correctAnswer: 'einen',
    explanation: '`es gibt` wymaga Akkusativu. `der Park` zmienia się na `einen Park`.', source: workbook(7), difficulty: 1,
  },
  {
    id: 'l13-es-gibt-keine', lesson: 13, topic: 'es gibt + Akkusativ', skill: 'grammar', kind: 'input',
    prompt: 'Uzupełnij: Hier gibt es ___ Apotheke. (kein)', acceptedAnswers: ['keine'], correctAnswer: 'keine',
    explanation: '`die Apotheke` w Akkusativie ma formę `keine Apotheke`.', source: workbook(7), difficulty: 1,
  },
  {
    id: 'l13-gefallen-mir', lesson: 13, topic: 'Dativ przy gefallen', skill: 'grammar', kind: 'choice',
    prompt: '___ gefällt der Tierpark sehr.', options: ['Ich', 'Mich', 'Mir'], acceptedAnswers: ['Mir'], correctAnswer: 'Mir',
    explanation: 'Osoba, której coś się podoba, stoi przy `gefallen` w Dativie: `mir`.', source: workbook(8), difficulty: 1,
  },
  {
    id: 'l13-helfen-ihm', lesson: 13, topic: 'zaimki w Dativie', skill: 'grammar', kind: 'correction',
    prompt: 'Popraw zdanie: Ich helfe ihn.', acceptedAnswers: ['Ich helfe ihm'], correctAnswer: 'Ich helfe ihm.',
    explanation: '`helfen` łączy się z Dativem: `er → ihm`, nie `ihn`.', source: teacher('GiE 31032026'), difficulty: 2,
  },
  {
    id: 'l13-danken-dir', lesson: 13, topic: 'zaimki w Dativie', skill: 'grammar', kind: 'input',
    prompt: 'Ich danke ___. (du)', acceptedAnswers: ['dir'], correctAnswer: 'dir',
    explanation: '`danken` wymaga Dativu: `du → dir`.', source: workbook(8), difficulty: 1,
  },
  {
    id: 'l13-sehenswuerdigkeit', lesson: 13, topic: 'miasto', skill: 'vocabulary', kind: 'input',
    prompt: 'fontanna / studnia → ?', acceptedAnswers: ['der Brunnen', 'Brunnen'], correctAnswer: 'der Brunnen',
    explanation: '`der Brunnen` jest jednym z miejsc podpisywanych na planie miasta.', source: workbook(7), difficulty: 1,
  },
  {
    id: 'l13-order-gefaellt', lesson: 13, topic: 'ocenianie miejsca', skill: 'communication', kind: 'order',
    prompt: 'Ułóż zdanie.', tokens: ['Berlin', 'gefällt', 'mir', 'sehr'], acceptedAnswers: ['Berlin gefällt mir sehr'], correctAnswer: 'Berlin gefällt mir sehr.',
    explanation: 'Rzecz, która się podoba, jest podmiotem; osoba stoi w Dativie.', source: workbook(9), difficulty: 1,
  },
  {
    id: 'l13-dialogue-tip', lesson: 13, topic: 'polecanie miejsca', skill: 'communication', kind: 'dialogue',
    prompt: '— Was kann man in Berlin machen?\n— ___', options: ['Du kannst den Tierpark besuchen.', 'Ich bin ein Tierpark.', 'Der Tierpark hilft mir.'],
    acceptedAnswers: ['Du kannst den Tierpark besuchen.'], correctAnswer: 'Du kannst den Tierpark besuchen.',
    explanation: 'W odpowiedzi na prośbę o wskazówkę pasuje konkretna propozycja z `kannst`.', source: workbook(9), difficulty: 1,
  },
  {
    id: 'l13-viele-cafes', lesson: 13, topic: 'es gibt + Akkusativ', skill: 'writing', kind: 'input',
    prompt: 'Przetłumacz: W Berlinie jest wiele kawiarni.', acceptedAnswers: ['In Berlin gibt es viele Cafés', 'In Berlin gibt es viele Cafes'], correctAnswer: 'In Berlin gibt es viele Cafés.',
    explanation: 'Po `es gibt` używamy Akkusativu; przy liczbie mnogiej pasuje `viele`.', source: review(18), difficulty: 2,
  },
  {
    id: 'l13-reading-place', lesson: 13, topic: 'informacja o miejscu', skill: 'reading', kind: 'true-false',
    prompt: 'Tekst: „Der Park ist groß und kostet keinen Eintritt.” Zdanie: Za wejście do parku trzeba zapłacić.', options: ['Richtig', 'Falsch'],
    acceptedAnswers: ['Falsch'], correctAnswer: 'Falsch',
    explanation: '`kostet keinen Eintritt` znaczy, że wejście jest bezpłatne.', source: test(21), difficulty: 1,
  },

  {
    id: 'l14-vor-dem', lesson: 14, topic: 'Wo? + Dativ', skill: 'grammar', kind: 'choice',
    prompt: 'Der Bus hält vor ___ Kaufhaus.', options: ['das', 'dem', 'den'], acceptedAnswers: ['dem'], correctAnswer: 'dem',
    explanation: 'Położenie odpowiada na `Wo?`, dlatego `vor + Dativ`: `das Kaufhaus → dem Kaufhaus`.', source: workbook(11), difficulty: 1,
  },
  {
    id: 'l14-neben-der', lesson: 14, topic: 'Wo? + Dativ', skill: 'grammar', kind: 'input',
    prompt: 'Die Bank ist neben ___ Apotheke. (die)', acceptedAnswers: ['der'], correctAnswer: 'der',
    explanation: '`neben` przy położeniu wymaga Dativu: `die Apotheke → der Apotheke`.', source: workbook(11), difficulty: 1,
  },
  {
    id: 'l14-im-zentrum', lesson: 14, topic: 'am / im', skill: 'grammar', kind: 'choice',
    prompt: 'Das Museum liegt ___ Zentrum.', options: ['im', 'am', 'ins'], acceptedAnswers: ['im'], correctAnswer: 'im',
    explanation: '`im` to `in dem`; mówimy `im Zentrum`.', source: workbook(12), difficulty: 1,
  },
  {
    id: 'l14-am-bahnhof', lesson: 14, topic: 'am / im', skill: 'grammar', kind: 'input',
    prompt: 'Wir treffen uns ___ Bahnhof.', acceptedAnswers: ['am'], correctAnswer: 'am',
    explanation: 'Stałe połączenie brzmi `am Bahnhof` (`an dem Bahnhof`).', source: workbook(12), difficulty: 1,
  },
  {
    id: 'l14-direction-right', lesson: 14, topic: 'opisywanie drogi', skill: 'communication', kind: 'dialogue',
    prompt: '— Wie komme ich zum Markt?\n— Gehen Sie hier ___.', options: ['nach rechts', 'im rechts', 'zu rechts'],
    acceptedAnswers: ['nach rechts'], correctAnswer: 'nach rechts',
    explanation: 'Kierunek podajemy jako `nach rechts` albo `nach links`.', source: workbook(13), difficulty: 1,
  },
  {
    id: 'l14-second-street', lesson: 14, topic: 'liczebniki porządkowe', skill: 'communication', kind: 'input',
    prompt: 'Nehmen Sie die ___ Straße links. (druga)', acceptedAnswers: ['zweite'], correctAnswer: 'zweite',
    explanation: '`die zweite Straße` znaczy „druga ulica”.', source: workbook(13), difficulty: 1,
  },
  {
    id: 'l14-order-route', lesson: 14, topic: 'opisywanie drogi', skill: 'communication', kind: 'order',
    prompt: 'Ułóż instrukcję.', tokens: ['Gehen', 'Sie', 'geradeaus', 'und', 'dann', 'nach', 'links'],
    acceptedAnswers: ['Gehen Sie geradeaus und dann nach links'], correctAnswer: 'Gehen Sie geradeaus und dann nach links.',
    explanation: 'Formalna instrukcja zaczyna się od `Gehen Sie`; kolejne etapy łączy `und dann`.', source: workbook(13), difficulty: 2,
  },
  {
    id: 'l14-between', lesson: 14, topic: 'Wo? + Dativ', skill: 'grammar', kind: 'correction',
    prompt: 'Popraw: Das Café ist zwischen dem Kino und die Bank.', acceptedAnswers: ['Das Café ist zwischen dem Kino und der Bank'], correctAnswer: 'Das Café ist zwischen dem Kino und der Bank.',
    explanation: 'Oba rzeczowniki po `zwischen` opisującym położenie są w Dativie: `dem Kino`, `der Bank`.', source: review(19), difficulty: 2,
  },
  {
    id: 'l14-cant-help', lesson: 14, topic: 'uprzejma odmowa', skill: 'communication', kind: 'dialogue',
    prompt: 'Ktoś pyta Cię o drogę, ale jej nie znasz. Wybierz naturalną odpowiedź.', options: ['Tut mir leid, ich bin auch fremd hier.', 'Nein, ich bin keine Straße.', 'Gehen Sie mir nicht.'],
    acceptedAnswers: ['Tut mir leid, ich bin auch fremd hier.'], correctAnswer: 'Tut mir leid, ich bin auch fremd hier.',
    explanation: 'To uprzejmy sposób powiedzenia, że samemu nie zna się okolicy.', source: workbook(13), difficulty: 1,
  },
  {
    id: 'l14-location-vocab', lesson: 14, topic: 'miejsca w mieście', skill: 'vocabulary', kind: 'input',
    prompt: 'skrzyżowanie → ?', acceptedAnswers: ['die Kreuzung', 'Kreuzung'], correctAnswer: 'die Kreuzung',
    explanation: '`die Kreuzung` pojawia się przy opisywaniu etapów drogi.', source: workbook(11), difficulty: 1,
  },

  {
    id: 'l15-sein-zimmer', lesson: 15, topic: 'sein- / ihr-', skill: 'grammar', kind: 'choice',
    prompt: 'Paul zeigt uns ___ Zimmer.', options: ['sein', 'seinen', 'seinem'], acceptedAnswers: ['sein'], correctAnswer: 'sein',
    explanation: '`das Zimmer` w Akkusativie zachowuje formę `sein Zimmer`.', source: workbook(16), difficulty: 1,
  },
  {
    id: 'l15-seinen-schreibtisch', lesson: 15, topic: 'sein- / ihr-', skill: 'grammar', kind: 'choice',
    prompt: 'Ich finde ___ Schreibtisch praktisch. (on)', options: ['sein', 'seinen', 'seinem'], acceptedAnswers: ['seinen'], correctAnswer: 'seinen',
    explanation: '`der Schreibtisch` jest tu w Akkusativie: `seinen Schreibtisch`.', source: workbook(16), difficulty: 2,
  },
  {
    id: 'l15-ihre-kueche', lesson: 15, topic: 'sein- / ihr-', skill: 'grammar', kind: 'input',
    prompt: 'Anna mag ___ Küche. (jej)', acceptedAnswers: ['ihre'], correctAnswer: 'ihre',
    explanation: '`die Küche` w Akkusativie ma formę `ihre Küche`.', source: workbook(16), difficulty: 1,
  },
  {
    id: 'l15-ihren-balkon', lesson: 15, topic: 'sein- / ihr-', skill: 'grammar', kind: 'correction',
    prompt: 'Popraw: Ich finde ihr Balkon schön.', acceptedAnswers: ['Ich finde ihren Balkon schön'], correctAnswer: 'Ich finde ihren Balkon schön.',
    explanation: '`finden` przyjmuje obiekt w Akkusativie; `der Balkon → ihren Balkon`.', source: review(19), difficulty: 2,
  },
  {
    id: 'l15-bedroom', lesson: 15, topic: 'pomieszczenia', skill: 'vocabulary', kind: 'input',
    prompt: 'korytarz / przedpokój → ?', acceptedAnswers: ['der Flur', 'Flur'], correctAnswer: 'der Flur',
    explanation: '`der Flur` to korytarz lub przedpokój w mieszkaniu.', source: workbook(15), difficulty: 1,
  },
  {
    id: 'l15-rent', lesson: 15, topic: 'mieszkanie i najem', skill: 'vocabulary', kind: 'choice',
    prompt: '„Die Wohnung kostet 700 Euro im Monat.” O jakiej informacji mowa?', options: ['o czynszu/cenie', 'o piętrze', 'o liczbie pokoi'],
    acceptedAnswers: ['o czynszu/cenie'], correctAnswer: 'o czynszu/cenie',
    explanation: '`im Monat` przy kwocie wskazuje miesięczny koszt mieszkania.', source: test(20), difficulty: 1,
  },
  {
    id: 'l15-floor', lesson: 15, topic: 'mieszkanie i najem', skill: 'reading', kind: 'true-false',
    prompt: 'Ogłoszenie: „Die Wohnung liegt im dritten Stock.” Zdanie: Mieszkanie jest na parterze.', options: ['Richtig', 'Falsch'],
    acceptedAnswers: ['Falsch'], correctAnswer: 'Falsch',
    explanation: '`im dritten Stock` znaczy „na trzecim piętrze”.', source: test(20), difficulty: 1,
  },
  {
    id: 'l15-evaluate-room', lesson: 15, topic: 'ocenianie mieszkania', skill: 'communication', kind: 'order',
    prompt: 'Ułóż zdanie.', tokens: ['Ich', 'finde', 'ihr', 'Zimmer', 'sehr', 'gemütlich'],
    acceptedAnswers: ['Ich finde ihr Zimmer sehr gemütlich'], correctAnswer: 'Ich finde ihr Zimmer sehr gemütlich.',
    explanation: 'Po `finden` oceniany obiekt stoi w Akkusativie; nijakie `Zimmer` ma formę `ihr Zimmer`.', source: workbook(17), difficulty: 2,
  },
  {
    id: 'l15-ad-question', lesson: 15, topic: 'pytania o mieszkanie', skill: 'communication', kind: 'dialogue',
    prompt: 'Chcesz zapytać o metraż mieszkania.', options: ['Wie groß ist die Wohnung?', 'Wie alt kostet die Wohnung?', 'Wo groß ist die Wohnung?'],
    acceptedAnswers: ['Wie groß ist die Wohnung?'], correctAnswer: 'Wie groß ist die Wohnung?',
    explanation: '`Wie groß …?` służy do pytania o wielkość lub metraż.', source: test(20), difficulty: 1,
  },
  {
    id: 'l15-email-info', lesson: 15, topic: 'e-mail o mieszkaniu', skill: 'writing', kind: 'choice',
    prompt: 'Która informacja najlepiej odpowiada na pytanie „Wie teuer ist die Wohnung?”', options: ['Sie kostet 700 Euro im Monat.', 'Sie hat drei Zimmer.', 'Sie liegt am Park.'],
    acceptedAnswers: ['Sie kostet 700 Euro im Monat.'], correctAnswer: 'Sie kostet 700 Euro im Monat.',
    explanation: '`Wie teuer?` pyta o cenę; odpowiedź musi podać koszt.', source: test(21), difficulty: 1,
  },
  {
    id: 'l15-office-room', lesson: 15, topic: 'Fokus Beruf 5 · pomieszczenia', skill: 'vocabulary', kind: 'choice',
    prompt: 'Wo kopiert man Dokumente?', options: ['Im Kopierraum.', 'In der Kantine.', 'In den Toiletten.'],
    acceptedAnswers: ['Im Kopierraum.'], correctAnswer: 'Im Kopierraum.',
    explanation: '`der Kopierraum` to pomieszczenie przeznaczone do kopiowania dokumentów.', source: fokusBeruf(5, 'Erster Arbeitstag'), difficulty: 1,
  },
  {
    id: 'l15-office-supply', lesson: 15, topic: 'Fokus Beruf 5 · wyposażenie', skill: 'vocabulary', kind: 'input',
    instruction: 'Antworten Sie mit dem passenden Gegenstand.',
    prompt: 'Was braucht man zum Heften?', acceptedAnswers: ['der Tacker', 'Tacker', 'einen Tacker'], correctAnswer: 'der Tacker',
    explanation: '`der Tacker` to zszywacz; służy do łączenia kartek.', hint: 'Der Gegenstand beginnt mit T.', source: fokusBeruf(5, 'Erster Arbeitstag'), difficulty: 1,
  },
  {
    id: 'l15-office-position', lesson: 15, topic: 'Fokus Beruf 5 · położenie', skill: 'communication', kind: 'order',
    prompt: 'Bringen Sie die Antwort in die richtige Reihenfolge.', tokens: ['Die Textmarker', 'sind', 'im Regal', 'neben', 'den Ordnern'],
    acceptedAnswers: ['Die Textmarker sind im Regal neben den Ordnern'], correctAnswer: 'Die Textmarker sind im Regal neben den Ordnern.',
    explanation: 'Odpowiedź podaje dokładne miejsce: w regale obok segregatorów.', source: fokusBeruf(5, 'Erster Arbeitstag'), difficulty: 2,
  },
  {
    id: 'l15-office-dialogue', lesson: 15, topic: 'Fokus Beruf 5 · dialog', skill: 'communication', kind: 'dialogue',
    prompt: '— Kann ich Sie noch etwas fragen?\n— Ja, natürlich.\n— ___\n— Hinter der Tür.',
    options: ['Wo ist der Konferenzraum?', 'Wie teuer ist der Tacker?', 'Wann ist die Kantine?'],
    acceptedAnswers: ['Wo ist der Konferenzraum?'], correctAnswer: 'Wo ist der Konferenzraum?',
    explanation: 'Odpowiedź `Hinter der Tür` wskazuje miejsce, więc pasuje pytanie `Wo ist …?`.', source: fokusBeruf(5, 'Erster Arbeitstag'), difficulty: 1,
  },
  {
    id: 'l15-email-six-points', lesson: 15, topic: 'TEST Modul 5 · pełny e-mail', skill: 'writing', kind: 'input',
    instruction: 'Schreiben Sie eine E-Mail. Antworten Sie auf alle sechs Fragen.',
    prompt: 'Wie geht es dir? Wo lebst du jetzt? Was machst du? Wie gefällt es dir dort? Was gibt es in deiner Stadt? Was gibt es dort nicht?',
    acceptedAnswers: ['Hallo Mia, mir geht es gut. Ich lebe jetzt in Potsdam. Ich studiere hier und arbeite am Wochenende. Es gefällt mir dort sehr gut. In meiner Stadt gibt es einen Park, ein Museum und viele Cafés. Leider gibt es dort kein Schwimmbad. Liebe Grüße, Alex'],
    correctAnswer: 'Hallo Mia, mir geht es gut. Ich lebe jetzt in Potsdam. Ich studiere hier und arbeite am Wochenende. Es gefällt mir dort sehr gut. In meiner Stadt gibt es einen Park, ein Museum und viele Cafés. Leider gibt es dort kein Schwimmbad. Liebe Grüße, Alex',
    explanation: 'Pełna odpowiedź zawiera osobne zdanie do każdego z sześciu punktów. Inne poprawne dane osobiste również są akceptowane przez ocenę AI.',
    hint: 'Odznacz kolejno sześć informacji: samopoczucie, miejsce, zajęcie, ocena, co jest i czego nie ma.', source: moduleTest(5), difficulty: 3,
  },
  {
    id: 'l15-lake-voice-message', lesson: 15, topic: 'Urlaub im Haus am See', skill: 'speaking', kind: 'input',
    instruction: 'Lesen Sie die Anzeige. Nehmen Sie eine kurze Sprachnachricht auf und schreiben Sie danach Ihre Antwort auf.',
    prompt: 'HAUS AM SEE · Ferienwohnung direkt am See · 65 m² · 80 Euro pro Nacht · schwimmen, angeln, ein Boot mieten. Wo liegt die Wohnung? Wie groß ist sie? Wie viel kostet sie? Was kann man dort machen?',
    acceptedAnswers: ['Hallo Nina, ich habe eine Ferienwohnung direkt am See gefunden. Sie ist 65 Quadratmeter groß und kostet 80 Euro pro Nacht. Dort können wir schwimmen, angeln und ein Boot mieten. Ruf mich bitte zurück.'],
    correctAnswer: 'Hallo Nina, ich habe eine Ferienwohnung direkt am See gefunden. Sie ist 65 Quadratmeter groß und kostet 80 Euro pro Nacht. Dort können wir schwimmen, angeln und ein Boot mieten. Ruf mich bitte zurück.',
    explanation: 'Wiadomość przekazuje położenie, metraż, cenę oraz czynności nad jeziorem. Inne naturalne sformułowania może zaakceptować AI.',
    hint: 'Powiedz cztery rzeczy: `am See`, `65 m²`, `80 Euro pro Nacht` i możliwe aktywności.', source: moduleTest(5), difficulty: 3,
  },

  {
    id: 'l16-vor-zwei-wochen', lesson: 16, topic: 'in / vor / nach', skill: 'grammar', kind: 'choice',
    prompt: 'Die Waschmaschine war ___ zwei Wochen kaputt.', options: ['in', 'vor', 'nach'], acceptedAnswers: ['vor'], correctAnswer: 'vor',
    explanation: '`vor zwei Wochen` oznacza „dwa tygodnie temu”, czyli przeszłość.', source: workbook(27), difficulty: 1,
  },
  {
    id: 'l16-in-zwei-tagen', lesson: 16, topic: 'in / vor / nach', skill: 'grammar', kind: 'input',
    prompt: 'Der Techniker kommt ___ zwei Tagen.', acceptedAnswers: ['in'], correctAnswer: 'in',
    explanation: '`in zwei Tagen` oznacza „za dwa dni”, czyli przyszłość.', source: workbook(27), difficulty: 1,
  },
  {
    id: 'l16-nach-dem-gespraech', lesson: 16, topic: 'in / vor / nach', skill: 'grammar', kind: 'choice',
    prompt: 'Wir schreiben die E-Mail ___ dem Gespräch.', options: ['nach', 'in', 'zu'], acceptedAnswers: ['nach'], correctAnswer: 'nach',
    explanation: '`nach dem Gespräch` znaczy „po rozmowie”; `nach` wymaga Dativu.', source: workbook(27), difficulty: 1,
  },
  {
    id: 'l16-vor-termin', lesson: 16, topic: 'in / vor / nach', skill: 'grammar', kind: 'correction',
    prompt: 'Popraw: Wir telefonieren vor den Termin.', acceptedAnswers: ['Wir telefonieren vor dem Termin'], correctAnswer: 'Wir telefonieren vor dem Termin.',
    explanation: '`vor` w określeniu czasu wymaga Dativu: `der Termin → dem Termin`.', source: review(38), difficulty: 2,
  },
  {
    id: 'l16-printer', lesson: 16, topic: 'urządzenia i awarie', skill: 'vocabulary', kind: 'input',
    prompt: 'ogrzewanie → ?', acceptedAnswers: ['die Heizung', 'Heizung'], correctAnswer: 'die Heizung',
    explanation: '`Die Heizung funktioniert nicht` to typowe zgłoszenie awarii.', source: workbook(26), difficulty: 1,
  },
  {
    id: 'l16-device-problem', lesson: 16, topic: 'zgłaszanie problemu', skill: 'communication', kind: 'dialogue',
    prompt: '— Was ist los?\n— ___', options: ['Die Heizung funktioniert nicht.', 'Die Heizung ist morgen.', 'Ich funktioniere eine Heizung.'],
    acceptedAnswers: ['Die Heizung funktioniert nicht.'], correctAnswer: 'Die Heizung funktioniert nicht.',
    explanation: 'Problem z urządzeniem zgłaszamy prosto: urządzenie + `funktioniert nicht`.', source: workbook(26), difficulty: 1,
  },
  {
    id: 'l16-ask-help', lesson: 16, topic: 'proszenie o pomoc', skill: 'communication', kind: 'choice',
    prompt: 'Które zdanie jest naturalną prośbą o pomoc?', options: ['Können Sie mir bitte helfen?', 'Helfen Sie mich?', 'Kann ich Sie kaputt?'],
    acceptedAnswers: ['Können Sie mir bitte helfen?'], correctAnswer: 'Können Sie mir bitte helfen?',
    explanation: '`helfen` wymaga Dativu (`mir`), a `bitte` łagodzi prośbę.', source: workbook(28), difficulty: 1,
  },
  {
    id: 'l16-reschedule', lesson: 16, topic: 'zmiana terminu', skill: 'communication', kind: 'order',
    prompt: 'Ułóż prośbę o przełożenie terminu.', tokens: ['Können', 'wir', 'den', 'Termin', 'verschieben'],
    acceptedAnswers: ['Können wir den Termin verschieben'], correctAnswer: 'Können wir den Termin verschieben?',
    explanation: 'W pytaniu z modalnym `können` stoi na początku, a `verschieben` na końcu.', source: teacher('Alltagssituation 12.05.2026'), difficulty: 2,
  },
  {
    id: 'l16-formal-email', lesson: 16, topic: 'formalny e-mail', skill: 'writing', kind: 'choice',
    prompt: 'Które zakończenie pasuje do formalnego e-maila do serwisu?', options: ['Mit freundlichen Grüßen', 'Tschüs, bis später!', 'Liebe Grüße, dein Laptop'],
    acceptedAnswers: ['Mit freundlichen Grüßen'], correctAnswer: 'Mit freundlichen Grüßen',
    explanation: 'Formalny e-mail kończymy zwrotem `Mit freundlichen Grüßen`.', source: test(40), difficulty: 1,
  },
  {
    id: 'l16-elevator', lesson: 16, topic: 'awaria windy', skill: 'reading', kind: 'true-false',
    prompt: 'Sytuacja: „Der Aufzug steckt fest und das Handy hat kein Netz.” Zdanie: Można bez problemu zadzwonić po pomoc.', options: ['Richtig', 'Falsch'],
    acceptedAnswers: ['Falsch'], correctAnswer: 'Falsch',
    explanation: '`kein Netz haben` oznacza brak zasięgu.', source: teacher('Alltagssituation 12.05.2026'), difficulty: 1,
  },
  {
    id: 'l16-files-order', lesson: 16, topic: 'Fokus Beruf 6 · Arbeitsauftrag', skill: 'communication', kind: 'order',
    prompt: 'Bringen Sie den Arbeitsauftrag in die richtige Reihenfolge.', tokens: ['Bitte', 'schicken', 'Sie', 'mir', 'die Dateien'],
    acceptedAnswers: ['Bitte schicken Sie mir die Dateien'], correctAnswer: 'Bitte schicken Sie mir die Dateien.',
    explanation: 'W formalnym poleceniu `schicken Sie` stoi bezpośrednio po `Bitte`.', source: fokusBeruf(6, 'Arbeitsaufträge'), difficulty: 1,
  },
  {
    id: 'l16-work-message-note', lesson: 16, topic: 'Fokus Beruf 6 · Telefonnotiz', skill: 'listening', kind: 'choice',
    instruction: 'Hören Sie die Sprachnachricht und wählen Sie die vollständige Telefonnotiz.',
    audioText: 'Guten Tag, hier ist Jana Favre aus der Marketingabteilung. Für die Präsentation des neuen Telefonmodells brauche ich bis Dienstag die Produktinformationen und die Marktanalyse. Bitte schicken Sie mir die Dateien und rufen Sie mich zurück.',
    prompt: 'Welche Telefonnotiz ist vollständig?',
    options: [
      'Jana Favre · Marketing · Produktinformationen und Marktanalyse · bis Dienstag · Dateien schicken und zurückrufen',
      'Jana Favre · Kantine · Büromaterial · heute · nichts tun',
      'Herr David · Verkauf · Telefonmodell · bis Freitag · Termin absagen',
    ],
    acceptedAnswers: ['Jana Favre · Marketing · Produktinformationen und Marktanalyse · bis Dienstag · Dateien schicken und zurückrufen'],
    correctAnswer: 'Jana Favre · Marketing · Produktinformationen und Marktanalyse · bis Dienstag · Dateien schicken und zurückrufen',
    explanation: 'Poprawna notatka zawiera wszystkie cztery elementy: osobę, potrzebę, termin i działanie.', source: fokusBeruf(6, 'Arbeitsaufträge'), difficulty: 2,
  },
  {
    id: 'l16-architecture-materials', lesson: 16, topic: 'Fokus Beruf 6 · Büromaterial', skill: 'reading', kind: 'choice',
    prompt: 'Im Architekturbüro fehlen Briefumschläge, Notizzettel und Ordner. Was ist richtig?',
    options: ['Das Büromaterial fehlt.', 'Die Marktanalyse ist fertig.', 'Der Aufzug ist kaputt.'],
    acceptedAnswers: ['Das Büromaterial fehlt.'], correctAnswer: 'Das Büromaterial fehlt.',
    explanation: 'Koperty, kartki do notatek i segregatory należą do `Büromaterial`.', source: fokusBeruf(6, 'Arbeitsaufträge'), difficulty: 1,
  },
  {
    id: 'l16-phone-presentation', lesson: 16, topic: 'Fokus Beruf 6 · Präsentation', skill: 'communication', kind: 'dialogue',
    prompt: '— Wir präsentieren morgen das neue Telefonmodell.\n— ___',
    options: ['Wie viel kostet das neue Telefonmodell?', 'Wo ist die Aufzugsfirma krank?', 'Wer kopiert die Kantine?'],
    acceptedAnswers: ['Wie viel kostet das neue Telefonmodell?'], correctAnswer: 'Wie viel kostet das neue Telefonmodell?',
    explanation: 'W tej sytuacji trzeba dopytać o cenę prezentowanego telefonu.', source: fokusBeruf(6, 'Arbeitsaufträge'), difficulty: 1,
  },
  {
    id: 'l16-workshop-child', lesson: 16, topic: 'Fokus Beruf 6 · termin', skill: 'writing', kind: 'input',
    instruction: 'Schreiben Sie zwei vollständige Sätze.',
    prompt: 'Ihre Tochter ist krank. Bitten Sie darum, den Teamarbeit-Workshop zu verschieben.',
    acceptedAnswers: ['Meine Tochter ist krank. Können wir den Teamarbeit-Workshop verschieben'],
    correctAnswer: 'Meine Tochter ist krank. Können wir den Teamarbeit-Workshop verschieben?',
    explanation: 'Pierwsze zdanie podaje powód, a drugie jasno prosi o przełożenie warsztatu.', hint: 'Powód: `Meine Tochter ist krank.` Prośba: `Können wir … verschieben?`', source: fokusBeruf(6, 'Arbeitsaufträge'), difficulty: 2,
  },
  {
    id: 'l16-elevator-details', lesson: 16, topic: 'winda · rozpoznawanie szczegółów', skill: 'reading', kind: 'true-false',
    prompt: 'Text: „Die Frau trägt eine graue Jacke, einen bunten Schal und eine Brille. Sie ist gut gelaunt. Eric hat Klaustrophobie.” Aussage: Die Frau ist fröhlich, aber Eric hat Angst vor engen Räumen.',
    options: ['Richtig', 'Falsch'], acceptedAnswers: ['Richtig'], correctAnswer: 'Richtig',
    explanation: '`gut gelaunt / fröhlich` opisuje kobietę, a `Klaustrophobie` oznacza lęk przed ciasnymi pomieszczeniami.', source: teacher('Alltagssituation 08/12.05.2026'), difficulty: 2,
  },

  {
    id: 'l17-werden-ich', lesson: 17, topic: 'werden', skill: 'grammar', kind: 'input',
    prompt: 'Ich ___ Ärztin.', acceptedAnswers: ['werde'], correctAnswer: 'werde',
    explanation: 'Pierwsza osoba liczby pojedynczej czasownika `werden` to `ich werde`.', source: workbook(30), difficulty: 1,
  },
  {
    id: 'l17-werden-er', lesson: 17, topic: 'werden', skill: 'grammar', kind: 'choice',
    prompt: 'Mein Bruder ___ Architekt.', options: ['werde', 'wird', 'werden'], acceptedAnswers: ['wird'], correctAnswer: 'wird',
    explanation: 'Trzecia osoba liczby pojedynczej ma nieregularną formę `er wird`.', source: workbook(30), difficulty: 1,
  },
  {
    id: 'l17-wollen-order', lesson: 17, topic: 'wollen i szyk', skill: 'grammar', kind: 'order',
    prompt: 'Ułóż zdanie.', tokens: ['Ich', 'will', 'später', 'im', 'Ausland', 'leben'],
    acceptedAnswers: ['Ich will später im Ausland leben'], correctAnswer: 'Ich will später im Ausland leben.',
    explanation: '`will` stoi na pozycji 2, a bezokolicznik `leben` na końcu.', source: workbook(33), difficulty: 2,
  },
  {
    id: 'l17-mit-meinem', lesson: 17, topic: 'mit + Dativ', skill: 'grammar', kind: 'choice',
    prompt: 'Ich reise mit ___ Freund.', options: ['mein', 'meinen', 'meinem'], acceptedAnswers: ['meinem'], correctAnswer: 'meinem',
    explanation: '`mit` zawsze wymaga Dativu: `der Freund → dem Freund`, `mein → meinem`.', source: workbook(32), difficulty: 2,
  },
  {
    id: 'l17-ohne-meinen', lesson: 17, topic: 'ohne + Akkusativ', skill: 'grammar', kind: 'choice',
    prompt: 'Ich reise ohne ___ Freund.', options: ['mein', 'meinen', 'meinem'], acceptedAnswers: ['meinen'], correctAnswer: 'meinen',
    explanation: '`ohne` wymaga Akkusativu: `der Freund → meinen Freund`.', source: workbook(32), difficulty: 2,
  },
  {
    id: 'l17-mit-ohne-contrast', lesson: 17, topic: 'mit / ohne', skill: 'grammar', kind: 'correction',
    prompt: 'Popraw: Sie trainiert mit ihre Fitnessuhr.', acceptedAnswers: ['Sie trainiert mit ihrer Fitnessuhr'], correctAnswer: 'Sie trainiert mit ihrer Fitnessuhr.',
    explanation: '`mit + Dativ`; `die Fitnessuhr → ihrer Fitnessuhr`.', source: workbook(32), difficulty: 3,
  },
  {
    id: 'l17-profession', lesson: 17, topic: 'zawody', skill: 'vocabulary', kind: 'input',
    prompt: 'lekarz / lekarka → ?', acceptedAnswers: ['der Arzt / die Ärztin', 'Arzt / Ärztin', 'der Arzt, die Ärztin'], correctAnswer: 'der Arzt / die Ärztin',
    explanation: 'Formy zawodu: `der Arzt`, `die Ärztin`.', source: workbook(30), difficulty: 1,
  },
  {
    id: 'l17-plan-question', lesson: 17, topic: 'plany', skill: 'communication', kind: 'dialogue',
    prompt: '— Was willst du später machen?\n— ___', options: ['Ich will Informatik studieren.', 'Ich studieren will Informatik.', 'Ich werde gestern.'],
    acceptedAnswers: ['Ich will Informatik studieren.'], correctAnswer: 'Ich will Informatik studieren.',
    explanation: 'Po `will` bezokolicznik trafia na koniec: `will … studieren`.', source: workbook(33), difficulty: 1,
  },
  {
    id: 'l17-werde-teacher', lesson: 17, topic: 'werden', skill: 'writing', kind: 'input',
    prompt: 'Przetłumacz: Chcę zostać nauczycielem.', acceptedAnswers: ['Ich will Lehrer werden', 'Ich möchte Lehrer werden'], correctAnswer: 'Ich will Lehrer werden.',
    explanation: 'W zakresie lekcji używamy `will … werden`; oba bezokoliczniki zamykają zdanie, a `werden` stoi na końcu.', source: workbook(33), difficulty: 2,
  },
  {
    id: 'l17-reading-plan', lesson: 17, topic: 'plany', skill: 'reading', kind: 'true-false',
    prompt: 'Tekst: „Nach der Schule will Mia eine Ausbildung machen. Später möchte sie selbstständig arbeiten.” Zdanie: Mia najpierw planuje studia uniwersyteckie.', options: ['Richtig', 'Falsch'],
    acceptedAnswers: ['Falsch'], correctAnswer: 'Falsch',
    explanation: '`eine Ausbildung machen` oznacza kształcenie zawodowe, nie studia uniwersyteckie.', source: test(41), difficulty: 2,
  },

  {
    id: 'l18-aufstehen', lesson: 18, topic: 'czasowniki rozdzielne', skill: 'grammar', kind: 'order',
    prompt: 'Ułóż zdanie.', tokens: ['Ich', 'stehe', 'jeden', 'Tag', 'um', 'sieben', 'Uhr', 'auf'],
    acceptedAnswers: ['Ich stehe jeden Tag um sieben Uhr auf'], correctAnswer: 'Ich stehe jeden Tag um sieben Uhr auf.',
    explanation: 'W zdaniu oznajmującym `aufstehen` rozdziela się: `stehe` na pozycji 2, `auf` na końcu.', source: workbook(35), difficulty: 2,
  },
  {
    id: 'l18-sollen', lesson: 18, topic: 'sollen i rada', skill: 'grammar', kind: 'choice',
    prompt: 'Der Arzt sagt, ich ___ viel Wasser trinken.', options: ['soll', 'will', 'kannst'], acceptedAnswers: ['soll'], correctAnswer: 'soll',
    explanation: '`sollen` przekazuje zalecenie innej osoby: lekarz mówi, co mam zrobić.', source: workbook(36), difficulty: 1,
  },
  {
    id: 'l18-imperative', lesson: 18, topic: 'Imperativ Sie', skill: 'grammar', kind: 'choice',
    prompt: 'Która forma jest poprawnym formalnym poleceniem?', options: ['Trinken Sie viel Wasser.', 'Sie trinken viel Wasser.', 'Trinkst Sie viel Wasser.'],
    acceptedAnswers: ['Trinken Sie viel Wasser.'], correctAnswer: 'Trinken Sie viel Wasser.',
    explanation: 'Imperativ formalny ma układ: bezokolicznik + `Sie`.', source: workbook(36), difficulty: 1,
  },
  {
    id: 'l18-doch-mal', lesson: 18, topic: 'łagodna rada', skill: 'communication', kind: 'dialogue',
    prompt: 'Ktoś jest przemęczony. Wybierz łagodną radę.', options: ['Machen Sie doch mal eine Pause.', 'Sie muss Pause jetzt!', 'Pause ist Wasser.'],
    acceptedAnswers: ['Machen Sie doch mal eine Pause.'], correctAnswer: 'Machen Sie doch mal eine Pause.',
    explanation: '`doch mal` łagodzi formalną radę lub polecenie.', source: workbook(36), difficulty: 2,
  },
  {
    id: 'l18-headache', lesson: 18, topic: 'dolegliwości', skill: 'vocabulary', kind: 'input',
    prompt: 'ból głowy → ?', acceptedAnswers: ['Kopfschmerzen', 'die Kopfschmerzen'], correctAnswer: 'Kopfschmerzen',
    explanation: 'Naturalnie mówimy `Ich habe Kopfschmerzen`.', source: workbook(34), difficulty: 1,
  },
  {
    id: 'l18-pharmacy', lesson: 18, topic: 'apteka', skill: 'communication', kind: 'dialogue',
    prompt: '— Was fehlt Ihnen?\n— ___', options: ['Ich habe Halsschmerzen.', 'Ich bin eine Apotheke.', 'Mir fehlt um acht Uhr.'],
    acceptedAnswers: ['Ich habe Halsschmerzen.'], correctAnswer: 'Ich habe Halsschmerzen.',
    explanation: 'Na pytanie o dolegliwość odpowiadamy `Ich habe …schmerzen` albo opisem objawu.', source: review(39), difficulty: 1,
  },
  {
    id: 'l18-dieser-mann', lesson: 18, topic: 'dies-', skill: 'grammar', kind: 'input',
    prompt: '___ Mann macht Sport. (ten)', acceptedAnswers: ['Dieser'], correctAnswer: 'Dieser',
    explanation: 'Dla rzeczownika męskiego w Nominativie używamy `dieser Mann`.', source: teacher('22052026 GIE Kap. 18'), difficulty: 2,
  },
  {
    id: 'l18-um-zu', lesson: 18, topic: 'um … zu', skill: 'grammar', kind: 'order',
    prompt: 'Ułóż zdanie z materiału nauczyciela.', tokens: ['Ich', 'treibe', 'Sport', 'um', 'fit', 'zu', 'bleiben'],
    acceptedAnswers: ['Ich treibe Sport, um fit zu bleiben', 'Ich treibe Sport um fit zu bleiben'], correctAnswer: 'Ich treibe Sport, um fit zu bleiben.',
    explanation: '`um … zu` wyraża cel: uprawiam sport po to, żeby pozostać w formie.', source: teacher('26052026 GiE'), difficulty: 3,
  },
  {
    id: 'l18-health-advice', lesson: 18, topic: 'zdrowe nawyki', skill: 'communication', kind: 'input',
    prompt: 'Napisz krótką radę: Powinieneś pić dużo wody.', acceptedAnswers: ['Du sollst viel Wasser trinken'], correctAnswer: 'Du sollst viel Wasser trinken.',
    explanation: '`sollst` przekazuje radę, a bezokolicznik `trinken` stoi na końcu.', source: teacher('26052026 GiE'), difficulty: 2,
  },
  {
    id: 'l18-correct-separable', lesson: 18, topic: 'czasowniki rozdzielne', skill: 'grammar', kind: 'correction',
    prompt: 'Popraw: Ich aufstehe um sieben Uhr.', acceptedAnswers: ['Ich stehe um sieben Uhr auf'], correctAnswer: 'Ich stehe um sieben Uhr auf.',
    explanation: 'W zdaniu oznajmującym czasownik rozdziela się: `stehe` + `auf` na końcu.', source: workbook(35), difficulty: 2,
  },

  // Dodatkowe zadania równoważące sprawności: słuchanie, czytanie i pisanie.
  {
    id: 'l13-listening-weekend', lesson: 13, topic: 'miasto i wycieczka', skill: 'listening', kind: 'choice',
    instruction: 'Odtwórz nagranie i wybierz właściwą informację.',
    audioText: 'Am Samstag besuchen wir zuerst das Schloss. Am Nachmittag machen wir am See ein Picknick. Das Museum besuchen wir am Sonntag.',
    prompt: 'Co grupa robi w sobotę po południu?',
    options: ['Robi piknik nad jeziorem.', 'Zwiedza muzeum.', 'Idzie do zoo.'],
    acceptedAnswers: ['Robi piknik nad jeziorem.'], correctAnswer: 'Robi piknik nad jeziorem.',
    explanation: 'W nagraniu pada: `Am Nachmittag machen wir am See ein Picknick`.',
    hint: 'Posłuchaj jeszcze raz fragmentu po `Am Nachmittag`.', source: test(20), difficulty: 1,
  },
  {
    id: 'l13-reading-city-tip', lesson: 13, topic: 'informacja o miejscu', skill: 'reading', kind: 'choice',
    prompt: 'Przeczytaj: „Der Tierpark ist am Montag geschlossen. Am Dienstag ist der Eintritt für Kinder frei.” Kiedy dziecko może wejść bezpłatnie?',
    options: ['W poniedziałek.', 'We wtorek.', 'Codziennie.'], acceptedAnswers: ['We wtorek.'], correctAnswer: 'We wtorek.',
    explanation: '`Am Dienstag` oznacza we wtorek, a `für Kinder frei` — bezpłatnie dla dzieci.',
    hint: 'Szukaj dnia połączonego ze słowem `frei`.', source: test(23), difficulty: 1,
  },
  {
    id: 'l13-writing-recommendation', lesson: 13, topic: 'polecanie miejsca', skill: 'writing', kind: 'input',
    prompt: 'Napisz po niemiecku: W Berlinie jest piękny park. Można tam spacerować.',
    acceptedAnswers: [
      'In Berlin gibt es einen schönen Park. Dort kann man spazieren gehen',
      'In Berlin gibt es einen schönen Park. Man kann dort spazieren gehen',
    ],
    correctAnswer: 'In Berlin gibt es einen schönen Park. Dort kann man spazieren gehen.',
    explanation: 'Pierwsze zdanie używa `es gibt + Akkusativ`, a drugie dodaje aktywność z `kann man`.',
    hint: 'Zacznij od `In Berlin gibt es …`, a potem użyj `Dort kann man …`.', source: review(18), difficulty: 2,
  },

  {
    id: 'l14-listening-route', lesson: 14, topic: 'opisywanie drogi', skill: 'listening', kind: 'choice',
    instruction: 'Odtwórz wskazówki i wybierz miejsce docelowe.',
    audioText: 'Gehen Sie geradeaus bis zur Ampel. Biegen Sie dort rechts ab. Die Apotheke ist an der nächsten Ecke, neben der Bank.',
    prompt: 'Dokąd prowadzi instrukcja?', options: ['Do apteki.', 'Do ratusza.', 'Do szpitala.'],
    acceptedAnswers: ['Do apteki.'], correctAnswer: 'Do apteki.',
    explanation: 'Cel zostaje nazwany w ostatnim zdaniu: `Die Apotheke ist …`.',
    hint: 'Najważniejsza nazwa miejsca pada na końcu nagrania.', source: workbook(13), difficulty: 1,
  },
  {
    id: 'l14-reading-opening-hours', lesson: 14, topic: 'miejsca w mieście', skill: 'reading', kind: 'true-false',
    prompt: 'Informacja: „Die Post ist neben dem Rathaus. Eingang über die Goethestraße.” Zdanie: Wejście jest od strony Goethestraße.',
    options: ['Richtig', 'Falsch'], acceptedAnswers: ['Richtig'], correctAnswer: 'Richtig',
    explanation: '`Eingang über die Goethestraße` wskazuje wejście od strony tej ulicy.',
    hint: 'Porównaj polskie „wejście” z niemieckim `Eingang`.', source: test(23), difficulty: 1,
  },
  {
    id: 'l14-writing-directions', lesson: 14, topic: 'opisywanie drogi', skill: 'writing', kind: 'input',
    prompt: 'Napisz: Proszę iść prosto i skręcić przy drugiej ulicy w lewo.',
    acceptedAnswers: [
      'Gehen Sie geradeaus und biegen Sie an der zweiten Straße links ab',
      'Gehen Sie geradeaus. Biegen Sie an der zweiten Straße links ab',
    ],
    correctAnswer: 'Gehen Sie geradeaus und biegen Sie an der zweiten Straße links ab.',
    explanation: 'Naturalny schemat to `an der zweiten Straße links abbiegen`.',
    hint: 'Użyj `Gehen Sie …` oraz `an der zweiten Straße … abbiegen`.', source: workbook(13), difficulty: 2,
  },

  {
    id: 'l15-listening-apartment', lesson: 15, topic: 'ogłoszenie mieszkaniowe', skill: 'listening', kind: 'choice',
    instruction: 'Odtwórz opis mieszkania i wybierz poprawną ofertę.',
    audioText: 'Die Wohnung hat zwei Zimmer und einen Balkon. Sie ist fünfundfünfzig Quadratmeter groß. Die Miete beträgt sechshundertneunzig Euro. Die Nebenkosten sind inklusive.',
    prompt: 'Która informacja jest poprawna?',
    options: ['Mieszkanie ma balkon.', 'Opłaty nie są wliczone.', 'Mieszkanie ma trzy pokoje.'],
    acceptedAnswers: ['Mieszkanie ma balkon.'], correctAnswer: 'Mieszkanie ma balkon.',
    explanation: 'W nagraniu słyszysz `zwei Zimmer und einen Balkon` oraz `Nebenkosten sind inklusive`.',
    hint: 'Zapisz osobno liczbę pokoi, wyposażenie i informację o opłatach.', source: test(20), difficulty: 2,
  },
  {
    id: 'l15-reading-match-ad', lesson: 15, topic: 'dopasowanie ogłoszenia', skill: 'reading', kind: 'choice',
    prompt: 'Mia szuka umeblowanego pokoju w centrum. Ma maksymalnie 500 euro miesięcznie. Która oferta pasuje?\nA: „WG-Zimmer, Zentrum, möbliert, 480 Euro inkl. NK.”\nB: „Wohnung am Stadtrand, unmöbliert, 450 Euro + NK.”',
    options: ['Oferta A', 'Oferta B', 'Żadna'], acceptedAnswers: ['Oferta A'], correctAnswer: 'Oferta A',
    explanation: 'Oferta A spełnia wszystkie trzy warunki: centrum, umeblowanie i koszt do 500 euro z opłatami.',
    hint: 'Sprawdź kolejno: położenie, `möbliert` i pełny koszt.', source: test(23), difficulty: 2,
  },
  {
    id: 'l15-writing-compare', lesson: 15, topic: 'porównanie mieszkań', skill: 'writing', kind: 'input',
    prompt: 'Napisz: Jej mieszkanie jest większe, ale uważam, że jego balkon jest ładniejszy.',
    acceptedAnswers: ['Ihre Wohnung ist größer, aber ich finde seinen Balkon schöner'],
    correctAnswer: 'Ihre Wohnung ist größer, aber ich finde seinen Balkon schöner.',
    explanation: '`ihre Wohnung` zależy od właścicielki; po `finden` męski `Balkon` ma formę `seinen Balkon`.',
    hint: 'Najpierw ustal dwóch właścicieli, potem przypadek rzeczownika po `finden`.', source: review(19), difficulty: 3,
  },

  {
    id: 'l16-listening-service', lesson: 16, topic: 'telefon do serwisu', skill: 'listening', kind: 'choice',
    instruction: 'Odtwórz rozmowę i wybierz termin wizyty technika.',
    audioText: 'Guten Tag. Meine Heizung funktioniert nicht. Heute ist leider kein Termin frei. Der Techniker kann morgen um acht Uhr kommen. Ja, morgen um acht Uhr passt sehr gut.',
    prompt: 'Kiedy przyjdzie technik?', options: ['Dzisiaj o 8:00.', 'Jutro o 8:00.', 'Jutro o 18:00.'],
    acceptedAnswers: ['Jutro o 8:00.'], correctAnswer: 'Jutro o 8:00.',
    explanation: 'Obie osoby potwierdzają `morgen um acht Uhr`.',
    hint: 'Nie wybieraj pierwszego dnia, który słyszysz — poczekaj na potwierdzenie terminu.', source: test(43), difficulty: 1,
  },
  {
    id: 'l16-reading-calendar', lesson: 16, topic: 'kalendarz i termin', skill: 'reading', kind: 'choice',
    prompt: 'Kalendarz: Montag 10:00 Arzt; Dienstag 15:00 Kurs; Donnerstag 9:00–12:00 frei. Serwis może przyjechać rano. Który termin jest możliwy?',
    options: ['Montag 10:00', 'Dienstag 15:00', 'Donnerstag 10:00'],
    acceptedAnswers: ['Donnerstag 10:00'], correctAnswer: 'Donnerstag 10:00',
    explanation: 'W czwartek między 9:00 a 12:00 kalendarz jest wolny.',
    hint: 'Szukaj porannego przedziału oznaczonego `frei`.', source: test(42), difficulty: 1,
  },
  {
    id: 'l16-writing-email-lines', lesson: 16, topic: 'formalny e-mail', skill: 'writing', kind: 'input',
    prompt: 'Napisz formalne zakończenie e-maila wraz z nazwiskiem Anna Nowak.',
    acceptedAnswers: ['Mit freundlichen Grüßen Anna Nowak'],
    correctAnswer: 'Mit freundlichen Grüßen\nAnna Nowak',
    explanation: 'Po `Mit freundlichen Grüßen` nie ma przecinka; podpis trafia do następnej linii.',
    hint: 'Nie stawiaj przecinka po `Grüßen`.', source: test(40), difficulty: 1,
  },

  {
    id: 'l17-listening-plans', lesson: 17, topic: 'plany po szkole', skill: 'listening', kind: 'choice',
    instruction: 'Odtwórz wypowiedź i wybierz pierwszy plan.',
    audioText: 'Nach dem Schulabschluss will ich zuerst den Führerschein machen. Danach fahre ich nach Schweden. Später will ich eine Firma gründen.',
    prompt: 'Co osoba chce zrobić najpierw?',
    options: ['Zrobić prawo jazdy.', 'Pojechać do Szwecji.', 'Założyć firmę.'],
    acceptedAnswers: ['Zrobić prawo jazdy.'], correctAnswer: 'Zrobić prawo jazdy.',
    explanation: '`zuerst` wskazuje pierwszy krok: `den Führerschein machen`.',
    hint: 'Posłuchaj słów porządkujących: `zuerst`, `danach`, `später`.', source: workbook(33), difficulty: 1,
  },
  {
    id: 'l17-reading-career', lesson: 17, topic: 'zawód i nauka', skill: 'reading', kind: 'choice',
    prompt: 'Tekst: „Noah will Menschen helfen. Er möchte im Krankenhaus arbeiten, aber nicht Medizin studieren. Er beginnt eine Ausbildung.” Jaki plan najlepiej pasuje?',
    options: ['Ausbildung zum Krankenpfleger', 'Medizinstudium', 'Arbeit als Architekt'],
    acceptedAnswers: ['Ausbildung zum Krankenpfleger'], correctAnswer: 'Ausbildung zum Krankenpfleger',
    explanation: 'Praca w szpitalu, pomaganie ludziom i `Ausbildung` wskazują kształcenie pielęgniarskie.',
    hint: 'Nie wybieraj studiów, ponieważ tekst wprost je wyklucza.', source: test(41), difficulty: 2,
  },
  {
    id: 'l17-writing-travel-plan', lesson: 17, topic: 'plany i podróże', skill: 'writing', kind: 'input',
    prompt: 'Napisz: W przyszłym roku chcę pojechać do Włoch bez rodziców.',
    acceptedAnswers: ['Nächstes Jahr will ich ohne meine Eltern nach Italien fahren', 'Im nächsten Jahr will ich ohne meine Eltern nach Italien fahren'],
    correctAnswer: 'Nächstes Jahr will ich ohne meine Eltern nach Italien fahren.',
    explanation: 'Po `will` bezokolicznik `fahren` stoi na końcu; `ohne` wymaga Akkusativu.',
    hint: 'Zbuduj klamrę `will … fahren` i użyj `ohne meine Eltern`.', source: workbook(33), difficulty: 2,
  },

  {
    id: 'l18-listening-doctor', lesson: 18, topic: 'rada lekarska', skill: 'listening', kind: 'choice',
    instruction: 'Odtwórz zalecenie lekarza i wybierz dwie wskazane czynności.',
    audioText: 'Sie sollen heute im Bett bleiben und viel Wasser trinken. Nehmen Sie diese Tabletten zweimal am Tag. Sport dürfen Sie heute nicht machen.',
    prompt: 'Co pacjent ma zrobić?',
    options: ['Zostać w łóżku i dużo pić.', 'Uprawiać sport i mało pić.', 'Iść do pracy i nie brać tabletek.'],
    acceptedAnswers: ['Zostać w łóżku i dużo pić.'], correctAnswer: 'Zostać w łóżku i dużo pić.',
    explanation: 'Pierwsze zdanie zawiera oba zalecenia: `im Bett bleiben` i `viel Wasser trinken`.',
    hint: 'Skup się na czynnościach po `Sie sollen`.', source: test(44), difficulty: 1,
  },
  {
    id: 'l18-reading-forum', lesson: 18, topic: 'zdrowe nawyki', skill: 'reading', kind: 'true-false',
    prompt: 'Post: „Seit zwei Wochen schlafe ich schlecht und bin tagsüber müde. Abends trinke ich oft drei koffeinhaltige Getränke.” Zdanie: Osoba opisuje możliwy związek między kofeiną a problemami ze snem.',
    options: ['Richtig', 'Falsch'], acceptedAnswers: ['Richtig'], correctAnswer: 'Richtig',
    explanation: 'Tekst łączy `schlafe ich schlecht` z częstym piciem napojów zawierających kofeinę wieczorem.',
    hint: 'Porównaj porę picia kofeiny z opisanym objawem.', source: teacher('26052026 GiE'), difficulty: 2,
  },
  {
    id: 'l18-writing-purpose', lesson: 18, topic: 'um … zu', skill: 'writing', kind: 'input',
    prompt: 'Połącz: Ich gehe früh ins Bett. Ich will morgen früh aufstehen.',
    acceptedAnswers: ['Ich gehe früh ins Bett, um morgen früh aufzustehen'],
    correctAnswer: 'Ich gehe früh ins Bett, um morgen früh aufzustehen.',
    explanation: 'Podmiot jest ten sam, więc używamy `um … zu`; przy `aufstehen` powstaje `aufzustehen`.',
    hint: 'W czasowniku rozdzielnym wstaw `zu` między przedrostek i rdzeń.', source: teacher('26052026 GiE'), difficulty: 3,
  },
] satisfies StudyQuestion[];

export const questionsById = new Map(studyQuestions.map((question) => [question.id, question]));

export function getQuestionsForLesson(lesson: number) {
  return studyQuestions.filter((question) => question.lesson === lesson);
}
