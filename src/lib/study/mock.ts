import { questionsById } from './questions';

export const mockQuestionIds = [
  'l13-listening-weekend',
  'l15-listening-apartment',
  'l16-listening-service',
  'l18-listening-doctor',
  'l13-reading-city-tip',
  'l13-reading-place',
  'l15-floor',
  'l15-reading-match-ad',
  'l16-reading-calendar',
  'l17-reading-career',
  'l18-reading-forum',
  'l13-es-gibt-einen',
  'l13-gefallen-mir',
  'l14-vor-dem',
  'l14-direction-right',
  'l15-seinen-schreibtisch',
  'l16-in-zwei-tagen',
  'l17-werden-er',
  'l17-mit-meinem',
  'l18-sollen',
] as const;

export const mockQuestions = mockQuestionIds.map((id) => {
  const question = questionsById.get(id);
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
