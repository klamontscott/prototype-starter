import { faker } from "@faker-js/faker";

export type Sentiment = "positive" | "neutral" | "negative";
export type SessionStatus = "completed" | "in_review" | "flagged";

export interface ResearchSession {
  id: string;
  participant: string;
  timestamp: Date;
  durationMin: number;
  sentiment: Sentiment;
  status: SessionStatus;
  summary: string;
}

// Seeded: same 20 sessions on every load, so variants and replays stay comparable.
faker.seed(42);

function makeSession(): ResearchSession {
  return {
    id: faker.string.uuid(),
    participant: faker.person.fullName(),
    timestamp: faker.date.recent({ days: 14 }),
    durationMin: faker.number.int({ min: 12, max: 55 }),
    sentiment: faker.helpers.arrayElement(["positive", "neutral", "negative"]),
    status: faker.helpers.arrayElement(["completed", "in_review", "flagged"]),
    summary: faker.lorem.sentence({ min: 8, max: 16 }),
  };
}

const generated = Array.from({ length: 17 }, makeSession);

// Edge cases, hand-built per CLAUDE.md: long name, empty field, extreme value.
const edgeCases: ResearchSession[] = [
  {
    ...makeSession(),
    participant:
      "Dr. Maria Fernanda Gutierrez de la Cruz-Wojciechowski-Nakamura III",
  },
  { ...makeSession(), summary: "" },
  { ...makeSession(), durationMin: 247 },
];

export const sessions: ResearchSession[] = [...generated, ...edgeCases].sort(
  (a, b) => b.timestamp.getTime() - a.timestamp.getTime()
);