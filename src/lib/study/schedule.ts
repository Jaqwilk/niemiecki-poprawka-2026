import type { SprintDay } from './types';

export const sprintDays: SprintDay[] = [
  {
    day: 1,
    title: 'Miasto i droga',
    lessons: [13, 14],
    reviewMinutes: 8,
    learnMinutes: 40,
    practiceMinutes: 20,
    focus: ['es gibt + Akkusativ', 'Dativ przy gefallen', 'Wo? + Dativ'],
  },
  {
    day: 2,
    title: 'Mieszkanie i problemy',
    lessons: [15, 16],
    reviewMinutes: 12,
    learnMinutes: 45,
    practiceMinutes: 22,
    focus: ['sein-/ihr-', 'in / vor / nach', 'terminy i serwis'],
  },
  {
    day: 3,
    title: 'Plany i zdrowie',
    lessons: [17, 18],
    reviewMinutes: 15,
    learnMinutes: 50,
    practiceMinutes: 25,
    focus: ['werden i wollen', 'mit / ohne', 'sollen i rady'],
  },
  {
    day: 4,
    title: 'Praktyka mieszana',
    lessons: [13, 14, 15, 16, 17, 18],
    reviewMinutes: 15,
    learnMinutes: 10,
    practiceMinutes: 45,
    focus: ['słabe obszary', 'e-mail i dialog', 'przełączanie reguł'],
  },
  {
    day: 5,
    title: 'Próba generalna',
    lessons: [13, 14, 15, 16, 17, 18],
    reviewMinutes: 15,
    learnMinutes: 0,
    practiceMinutes: 55,
    focus: ['pełna próba', 'najczęstsze błędy', 'ostatnie przypomnienie'],
  },
];

export const lessonTitles = {
  13: 'Berlin gefällt mir',
  14: 'Vor dem Kaufhaus nach rechts',
  15: 'Ich finde ihr Zimmer schön',
  16: 'Wir haben hier ein Problem',
  17: 'Ich will … werden',
  18: 'Ich soll diese Übung machen',
} as const;
