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
] satisfies StudyQuestion[];

export const questionsById = new Map(studyQuestions.map((question) => [question.id, question]));

export function getQuestionsForLesson(lesson: number) {
  return studyQuestions.filter((question) => question.lesson === lesson);
}
