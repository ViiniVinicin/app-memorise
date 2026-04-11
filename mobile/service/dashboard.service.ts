import { Palette as P } from "@/constants/palette";
import { authenticatedRequest } from "@/service/api.service";

export type DashboardSummary = {
  cards_today: number;
  total_decks: number;
  total_cards: number;
  pending_cards: number;
};

export type StudyHistoryEntry = {
  id: string;
  study_date: string;
  cards_reviewed: number;
};

export type DeckListItem = {
  id: string;
  title: string;
  color: string;
  icon: string | null;
  created_at: string;
  _count: {
    cards: number;
  };
};

export type CardItem = {
  id: string;
  next_review: string;
  streak: number;
};

export type DeckDetails = DeckListItem & {
  cards: CardItem[];
};

export type DeckInsight = {
  id: string;
  title: string;
  color: string;
  icon: string | null;
  totalCards: number;
  progress: number;
  reviewedCards: number;
  dueCards: number;
  nextReviewAt: string | null;
  badgeLabel: string;
  badgeTone: "success" | "info" | "warning" | "neutral";
};

export type CreateDeckPayload = {
  title: string;
  color: string;
  icon: string;
};

export const DECK_PRESETS: CreateDeckPayload[] = [
  { color: P.info, icon: "globe-outline", title: "Idiomas" },
  { color: P.teal, icon: "code-slash-outline", title: "Programacao" },
  { color: P.warning, icon: "flask-outline", title: "Ciencias" },
  { color: P.success, icon: "leaf-outline", title: "Biologia" },
  { color: P.primary, icon: "book-outline", title: "Estudos" },
];

function getTomorrowBoundary(now: Date) {
  const tomorrow = new Date(now);
  tomorrow.setHours(0, 0, 0, 0);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return tomorrow;
}

export function toDeckInsight(deck: DeckDetails): DeckInsight {
  const now = new Date();
  const tomorrow = getTomorrowBoundary(now);
  const cards = deck.cards ?? [];
  const totalCards = deck._count?.cards ?? cards.length;
  const reviewedCards = cards.filter((card) => card.streak > 0).length;
  const dueCards = cards.filter((card) => new Date(card.next_review) <= now).length;
  const nextReviewAt =
    cards
      .filter((card) => new Date(card.next_review) > now)
      .sort(
        (first, second) =>
          new Date(first.next_review).getTime() -
          new Date(second.next_review).getTime()
      )[0]?.next_review ?? null;
  const progress =
    totalCards > 0 ? Math.round((reviewedCards / totalCards) * 100) : 0;

  let badgeLabel = "NOVO";
  let badgeTone: DeckInsight["badgeTone"] = "neutral";

  if (totalCards > 0 && progress >= 100 && dueCards === 0) {
    badgeLabel = "CONCLUIDO";
    badgeTone = "warning";
  } else if (dueCards > 0) {
    badgeLabel = "HOJE";
    badgeTone = "success";
  } else if (nextReviewAt && new Date(nextReviewAt) < tomorrow) {
    badgeLabel = "AMANHA";
    badgeTone = "info";
  }

  return {
    id: deck.id,
    title: deck.title,
    color: deck.color,
    icon: deck.icon,
    totalCards,
    progress,
    reviewedCards,
    dueCards,
    nextReviewAt,
    badgeLabel,
    badgeTone,
  };
}

function formatDateKey(date: Date) {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

export function buildStudyStreak(history: StudyHistoryEntry[]) {
  const activeDays = new Set(
    history
      .filter((entry) => entry.cards_reviewed > 0)
      .map((entry) => formatDateKey(new Date(entry.study_date)))
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (activeDays.has(formatDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

export function buildStudyDelta(history: StudyHistoryEntry[], cardsToday: number) {
  const sortedHistory = [...history].sort(
    (first, second) =>
      new Date(first.study_date).getTime() - new Date(second.study_date).getTime()
  );
  const yesterdayCards =
    sortedHistory.length > 1
      ? sortedHistory[sortedHistory.length - 2]?.cards_reviewed ?? 0
      : 0;

  if (yesterdayCards <= 0) {
    return cardsToday > 0 ? 100 : 0;
  }

  return Math.round(((cardsToday - yesterdayCards) / yesterdayCards) * 100);
}

export const DashboardService = {
  getSummary: (token: string) =>
    authenticatedRequest<DashboardSummary>(token, "/stats/summary"),

  getHistory: (token: string) =>
    authenticatedRequest<StudyHistoryEntry[]>(token, "/stats/history"),

  getDecks: (token: string) =>
    authenticatedRequest<DeckListItem[]>(token, "/decks"),

  getDeckDetails: (token: string, deckId: string) =>
    authenticatedRequest<DeckDetails>(token, `/decks/${deckId}`),

  createDeck: (token: string, payload: CreateDeckPayload) =>
    authenticatedRequest<DeckListItem>(token, "/decks", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
};

export function pickDeckPreset(index: number) {
  return DECK_PRESETS[index % DECK_PRESETS.length];
}
