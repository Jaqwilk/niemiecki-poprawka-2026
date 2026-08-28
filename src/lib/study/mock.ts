import { questionsById } from './questions';

export const mockQuestionIds = [
  'l13-reading-place',
  'l13-es-gibt-einen',
  'l13-gefallen-mir',
  'l14-vor-dem',
  'l14-direction-right',
  'l14-between',
  'l15-floor',
  'l15-seinen-schreibtisch',
  'l15-ad-question',
  'l16-vor-zwei-wochen',
  'l16-in-zwei-tagen',
  'l16-device-problem',
  'l16-reschedule',
  'l17-werden-er',
  'l17-mit-meinem',
  'l17-wollen-order',
  'l18-headache',
  'l18-sollen',
  'l18-imperative',
  'l18-correct-separable',
] as const;

export const mockQuestions = mockQuestionIds.map((id) => {
  const question = questionsById.get(id);
  if (!question) throw new Error(`Missing mock question: ${id}`);
  return question;
});

export const openMockTasks = [
  {
    id: 'mock-writing-service',
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
    id: 'mock-speaking-appointment',
    label: 'Mówienie · termin',
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
];
