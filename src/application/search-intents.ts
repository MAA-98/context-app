import type { Intent } from '../domain/types.js';

function normalizeText(value: string) {
  return value.toLowerCase().trim();
}

function getSearchableText(intent: Intent) {
  return [
    intent.id,
    intent.shortDesc,
    intent.longDesc,
    ...intent.actions.map((action) => action.desc ?? ''),
    ...intent.actions.map((action) => action.step.command),
  ].join(' ')
}

/**
 * Returns a simple relevance score for how well `text` matches `query`.
 *
 * Scoring rules:
 * - 1000: exact match
 * - 500: text starts with the query
 * - 100: query appears anywhere in the text
 * - 0: no match
 *
 * This is a lightweight ranking helper for search results.
 * Higher scores sort ahead of lower scores.
 */
function scoreText(normalizedQuery: string, text: string): number {
  const normalizedText = normalizeText(text);

  if (!normalizedQuery) return 0;
  if (normalizedText === normalizedQuery) return 1000;
  if (normalizedText.startsWith(normalizedQuery)) return 500;
  if (normalizedText.includes(normalizedQuery)) return 100;

  return 0;
}

export const SearchIntents = (query: string, intents: Intent[]) => {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) {
    return intents;
  }

  return intents
    .map((intent) => ({
      intent,
      score: scoreText(normalizedQuery, getSearchableText(intent)),
    }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .map(({ intent }) => intent);
}