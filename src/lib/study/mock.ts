import { questionsById } from './questions';
import type { LessonNumber, StudyQuestion } from './types';

const photoTestSource = {
  label: 'Wzorzec z testów użytkownika · zakres Lektion 13–18',
  type: 'teacher' as const,
};

const clozeQuestions = [
  {
    id: 'mock-cloze-park', lesson: 13, topic: 'miasto', skill: 'reading', kind: 'input',
    prompt: 'Im Zentrum gibt es einen großen ___.', acceptedAnswers: ['Park', 'park'], correctAnswer: 'Park',
    explanation: '`der Park` pasuje do informacji o miejscu w centrum miasta.', source: photoTestSource, difficulty: 1,
  },
  {
    id: 'mock-cloze-schloss', lesson: 13, topic: 'atrakcje w mieście', skill: 'reading', kind: 'input',
    prompt: 'Am Samstag besucht Lea das alte ___.', acceptedAnswers: ['Schloss', 'schloss'], correctAnswer: 'Schloss',
    explanation: '`das Schloss besuchen` oznacza zwiedzać zamek.', source: photoTestSource, difficulty: 1,
  },
  {
    id: 'mock-cloze-gefaellt', lesson: 13, topic: 'gefallen', skill: 'reading', kind: 'input',
    prompt: 'Die Stadt ___ ihr sehr.', acceptedAnswers: ['gefällt'], correctAnswer: 'gefällt',
    explanation: 'Podmiot `die Stadt` jest w liczbie pojedynczej, dlatego używamy `gefällt`.', source: photoTestSource, difficulty: 1,
  },
  {
    id: 'mock-cloze-wohnung', lesson: 15, topic: 'mieszkanie', skill: 'reading', kind: 'input',
    prompt: 'Lea wohnt in einer kleinen ___.', acceptedAnswers: ['Wohnung', 'wohnung'], correctAnswer: 'Wohnung',
    explanation: '`in einer kleinen Wohnung` opisuje miejsce zamieszkania.', source: photoTestSource, difficulty: 1,
  },
  {
    id: 'mock-cloze-balkon', lesson: 15, topic: 'mieszkanie', skill: 'reading', kind: 'input',
    prompt: 'Ihr Zimmer hat einen sonnigen ___.', acceptedAnswers: ['Balkon', 'balkon'], correctAnswer: 'Balkon',
    explanation: '`der Balkon` jest częścią mieszkania i po `haben` stoi w Akkusativie.', source: photoTestSource, difficulty: 1,
  },
  {
    id: 'mock-cloze-heizung', lesson: 16, topic: 'awarie', skill: 'reading', kind: 'input',
    prompt: 'Gestern war die ___ kaputt.', acceptedAnswers: ['Heizung', 'heizung'], correctAnswer: 'Heizung',
    explanation: '`Die Heizung ist kaputt` to typowe zgłoszenie awarii.', source: photoTestSource, difficulty: 1,
  },
  {
    id: 'mock-cloze-termin', lesson: 16, topic: 'terminy', skill: 'reading', kind: 'input',
    prompt: 'Deshalb hat Lea heute einen ___ mit dem Techniker.', acceptedAnswers: ['Termin', 'termin'], correctAnswer: 'Termin',
    explanation: 'Naturalne połączenie brzmi `einen Termin mit dem Techniker haben`.', source: photoTestSource, difficulty: 1,
  },
  {
    id: 'mock-cloze-werden', lesson: 17, topic: 'plany zawodowe', skill: 'reading', kind: 'input',
    prompt: 'Später will Lea Ärztin ___.', acceptedAnswers: ['werden'], correctAnswer: 'werden',
    explanation: 'Po `will` bezokolicznik `werden` stoi na końcu zdania.', source: photoTestSource, difficulty: 1,
  },
  {
    id: 'mock-cloze-ausland', lesson: 17, topic: 'plany i podróże', skill: 'reading', kind: 'input',
    prompt: 'Sie möchte ein Jahr im ___ leben.', acceptedAnswers: ['Ausland', 'ausland'], correctAnswer: 'Ausland',
    explanation: 'Stałe połączenie brzmi `im Ausland leben`.', source: photoTestSource, difficulty: 1,
  },
  {
    id: 'mock-cloze-sport', lesson: 18, topic: 'zdrowe nawyki', skill: 'reading', kind: 'input',
    prompt: 'Lea treibt regelmäßig ___, um gesund zu bleiben.', acceptedAnswers: ['Sport', 'sport'], correctAnswer: 'Sport',
    explanation: '`Sport treiben` to stałe połączenie oznaczające uprawianie sportu.', source: photoTestSource, difficulty: 1,
  },
] satisfies StudyQuestion[];

export const matchingAnswerBank = [
  { code: 'A', label: 'der Brunnen' },
  { code: 'B', label: 'einen schönen Park empfehlen' },
  { code: 'C', label: 'nach rechts abbiegen' },
  { code: 'D', label: 'die Kreuzung' },
  { code: 'E', label: 'der Flur' },
  { code: 'F', label: 'die Nebenkosten' },
  { code: 'G', label: 'einen Termin verschieben' },
  { code: 'H', label: 'die Heizung' },
  { code: 'I', label: 'Arzt / Ärztin' },
  { code: 'J', label: 'im Ausland leben' },
  { code: 'K', label: 'Kopfschmerzen haben' },
  { code: 'L', label: 'sich ausruhen' },
] as const;

const matchingOptions = matchingAnswerBank.map((answer) => answer.label);

const matchingRows: readonly [string, LessonNumber, string, string][] = [
  ['mock-match-brunnen', 13, 'fontanna / studnia', 'der Brunnen'],
  ['mock-match-park', 13, 'polecić piękny park', 'einen schönen Park empfehlen'],
  ['mock-match-rechts', 14, 'skręcić w prawo', 'nach rechts abbiegen'],
  ['mock-match-kreuzung', 14, 'skrzyżowanie', 'die Kreuzung'],
  ['mock-match-flur', 15, 'korytarz / przedpokój', 'der Flur'],
  ['mock-match-nebenkosten', 15, 'opłaty dodatkowe', 'die Nebenkosten'],
  ['mock-match-termin', 16, 'przełożyć termin', 'einen Termin verschieben'],
  ['mock-match-heizung', 16, 'ogrzewanie', 'die Heizung'],
  ['mock-match-arzt', 17, 'lekarz / lekarka', 'Arzt / Ärztin'],
  ['mock-match-ausland', 17, 'mieszkać za granicą', 'im Ausland leben'],
  ['mock-match-kopf', 18, 'mieć ból głowy', 'Kopfschmerzen haben'],
  ['mock-match-rest', 18, 'odpoczywać', 'sich ausruhen'],
];

const matchingQuestions: StudyQuestion[] = matchingRows.map(([id, lesson, prompt, answer]) => ({
  id,
  lesson,
  topic: 'słownictwo przekrojowe',
  skill: 'vocabulary',
  kind: 'choice',
  prompt,
  options: matchingOptions,
  acceptedAnswers: [answer],
  correctAnswer: answer,
  explanation: `Poprawne połączenie: ${prompt} → ${answer}.`,
  source: photoTestSource,
  difficulty: 1,
}));

const supplementalQuestions: StudyQuestion[] = [...clozeQuestions, ...matchingQuestions];
const supplementalById = new Map(supplementalQuestions.map((question) => [question.id, question]));

export const paperTestSections = [
  {
    id: 'hoeren',
    title: 'HÖRVERSTEHEN',
    instruction: 'Hören Sie jede Aufnahme zweimal. Kreuzen Sie die richtige Antwort an.',
    layout: 'listening',
    questionIds: [
      'l13-listening-weekend',
      'l14-listening-route',
      'l15-listening-apartment',
      'l16-listening-service',
      'l17-listening-plans',
      'l18-listening-doctor',
    ],
  },
  {
    id: 'lesen-luecken',
    title: 'LESEVERSTEHEN 1',
    instruction: 'Lesen Sie den Text. Ergänzen Sie jede Lücke mit einem Wort aus dem Kasten. Jedes Wort passt einmal.',
    layout: 'cloze',
    wordBank: ['Ausland', 'Balkon', 'gefällt', 'Heizung', 'Park', 'Schloss', 'Sport', 'Termin', 'werden', 'Wohnung'],
    questionIds: clozeQuestions.map((question) => question.id),
  },
  {
    id: 'lesen-informationen',
    title: 'LESEVERSTEHEN 2',
    instruction: 'Lesen Sie die kurzen Informationen. Entscheiden Sie oder wählen Sie die passende Antwort.',
    layout: 'reading',
    questionIds: [
      'l13-reading-city-tip',
      'l14-reading-opening-hours',
      'l15-reading-match-ad',
      'l16-reading-calendar',
      'l17-reading-career',
      'l18-reading-forum',
    ],
  },
  {
    id: 'wortschatz',
    title: 'WORTSCHATZ',
    instruction: 'Was passt zusammen? Ordnen Sie A–L zu. Jede Antwort passt einmal.',
    layout: 'matching',
    questionIds: matchingQuestions.map((question) => question.id),
  },
  {
    id: 'grammatik-luecken',
    title: 'GRAMMATIK 1',
    instruction: 'Ergänzen Sie die richtige Form. Schreiben Sie nur das fehlende Wort.',
    layout: 'gaps',
    questionIds: [
      'l13-es-gibt-einen',
      'l13-gefallen-mir',
      'l14-vor-dem',
      'l14-neben-der',
      'l15-seinen-schreibtisch',
      'l16-in-zwei-tagen',
      'l17-werden-er',
      'l17-mit-meinem',
      'l18-sollen',
      'l18-dieser-mann',
    ],
  },
  {
    id: 'grammatik-saetze',
    title: 'GRAMMATIK 2',
    instruction: 'Bilden oder korrigieren Sie ganze Sätze. Achten Sie auf Satzklammer, Fälle und trennbare Verben.',
    layout: 'sentences',
    questionIds: [
      'l14-order-route',
      'l14-between',
      'l16-reschedule',
      'l17-wollen-order',
      'l18-writing-purpose',
      'l18-correct-separable',
    ],
  },
] as const;

export type PaperTestSection = (typeof paperTestSections)[number];

export const mockQuestionIds = paperTestSections.flatMap((section) => section.questionIds);

export const mockQuestions: StudyQuestion[] = mockQuestionIds.map((id) => {
  const question = questionsById.get(id) ?? supplementalById.get(id);
  if (!question) throw new Error(`Missing mock question: ${id}`);
  return question;
});

export const openMockTasks = [
  {
    id: 'mock-writing-apartment',
    section: 'writing',
    visual: 'apartment',
    label: 'Pisanie · wiadomość o mieszkaniu',
    prompt:
      'Ogłoszenie: „WG-Zimmer im Zentrum, 18 m², möbliert, Balkon, 490 Euro inklusive Nebenkosten”. Napisz do kolegi krótką wiadomość: przekaż trzy informacje z ogłoszenia, oceń pokój i zapytaj, czy jest zainteresowany.',
    checklist: [
      'co najmniej trzy poprawne informacje z ogłoszenia',
      'własna ocena pokoju lub oferty',
      'pytanie o zainteresowanie',
      'czytelne rozpoczęcie i zakończenie wiadomości',
    ],
    model:
      'Hallo Jan! Ich habe ein WG-Zimmer im Zentrum gefunden. Es ist 18 Quadratmeter groß, möbliert und hat einen Balkon. Die Miete beträgt 490 Euro inklusive Nebenkosten. Ich finde das Angebot sehr gut. Hast du Interesse? Liebe Grüße',
  },
  {
    id: 'mock-writing-service',
    section: 'writing',
    visual: 'none',
    label: 'Pisanie · e-mail formalny',
    prompt:
      'Twój laptop nie działa. Napisz krótki formalny e-mail do serwisu. Napisz, co jest zepsute, poproś o naprawę, zapytaj o cenę i podaj, kiedy jesteś dostępny/a.',
    checklist: [
      'formalny zwrot na początku i na końcu',
      'jasna informacja, co nie działa',
      'prośba o naprawę i pytanie o cenę',
      'konkretny termin dostępności',
    ],
    model:
      'Sehr geehrte Damen und Herren, mein Laptop funktioniert nicht. Können Sie ihn bitte reparieren? Wie viel kostet die Reparatur? Am Freitag bin ich ab 15 Uhr zu Hause. Mit freundlichen Grüßen',
  },
  {
    id: 'mock-speaking-map',
    section: 'speaking',
    visual: 'map',
    label: 'Mówienie · droga na mapie',
    prompt:
      'Wyjaśnij formalnie drogę od dworca do apteki. Użyj co najmniej trzech etapów, dwóch kierunków i jednego punktu orientacyjnego.',
    checklist: [
      'formalna forma `Sie`',
      'co najmniej trzy logiczne etapy trasy',
      'poprawne kierunki `links/rechts/geradeaus`',
      'położenie celu przy punkcie orientacyjnym',
    ],
    model:
      'Gehen Sie zuerst geradeaus bis zur Parkstraße. Biegen Sie links ab. Gehen Sie bis zur Goethestraße und dort rechts. An der Lessingstraße biegen Sie links ab. Die Apotheke ist rechts, neben der Bank.',
  },
  {
    id: 'mock-speaking-appointment',
    section: 'speaking',
    visual: 'calendar',
    label: 'Mówienie · telefon i kalendarz',
    prompt:
      'Masz wizytę u dentysty we wtorek o 10:00, ale nie możesz przyjść. Zostaw krótką wypowiedź: przedstaw problem, odwołaj termin, zaproponuj czwartek po 14:00 i poproś o potwierdzenie.',
    checklist: [
      'podany stary termin',
      'powód lub jasna informacja, że termin nie pasuje',
      'konkretna propozycja nowego terminu',
      'prośba o odpowiedź/potwierdzenie',
    ],
    model:
      'Guten Tag. Ich habe am Dienstag um zehn Uhr einen Termin, aber leider kann ich dann nicht. Können wir den Termin verschieben? Am Donnerstag kann ich nach 14 Uhr. Bitte rufen Sie mich zurück. Vielen Dank.',
  },
  {
    id: 'mock-speaking-photo',
    section: 'speaking',
    visual: 'photo',
    label: 'Mówienie · opis ilustracji',
    prompt:
      'Opisz ilustrację. Powiedz, kto i gdzie się znajduje, co robią osoby, jak wyglądają lub jak mogą się czuć oraz co może wydarzyć się później.',
    checklist: [
      'miejsce i co najmniej dwie osoby',
      'co najmniej dwie widoczne czynności',
      'jedna cecha wyglądu lub wieku',
      'emocja albo przypuszczenie z uzasadnieniem',
    ],
    model:
      'Auf dem Bild sehe ich ein Büro. Im Vordergrund macht ein Mann mittleren Alters Gymnastik. Eine blonde Frau steht am Schreibtisch und beobachtet ihn. Sie ist vielleicht seine Chefin und sieht überrascht aus. Wahrscheinlich möchte der Mann weniger Rückenschmerzen haben.',
  },
  {
    id: 'mock-speaking-card',
    section: 'speaking',
    visual: 'card',
    label: 'Mówienie · karta sytuacyjna',
    prompt:
      'Karta: „Od dwóch tygodni źle śpisz, jesteś zmęczony/a i wieczorem pijesz dużo napojów z kofeiną”. Poproś o radę, odpowiedz na jedno pytanie rozmówcy i powtórz otrzymane zalecenie przez `sollen`.',
    checklist: [
      'opis co najmniej dwóch objawów lub nawyków',
      'naturalna prośba o radę',
      'pełna odpowiedź na pytanie rozmówcy',
      'przekazanie zalecenia przez `ich soll …`',
    ],
    model:
      'Seit zwei Wochen schlafe ich schlecht und bin tagsüber müde. Abends trinke ich oft koffeinhaltige Getränke. Was soll ich machen? Ja, meistens trinke ich drei Tassen Kaffee. Du meinst, ich soll abends keinen Kaffee trinken und Stress vermeiden.',
  },
] as const;

export type OpenMockTask = (typeof openMockTasks)[number];
