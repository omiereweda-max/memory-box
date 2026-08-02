import type { ItemSummary, ContextItem } from '@/types';

export function searchMemory(summaries: ItemSummary[], query: string): ContextItem[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];

  const terms = q.split(/\s+/);
  return summaries
    .map((s) => {
      const haystack = [s.title, s.content ?? '', s.fileName ?? '']
        .join(' ')
        .toLowerCase();
      const score = terms.reduce(
        (acc, term) => acc + (haystack.includes(term) ? 1 : 0),
        0,
      );
      return { summary: s, score };
    })
    .filter((entry) => entry.score > 0)
    .sort((a, b) => b.score - a.score)
    .map((entry) => ({
      id: entry.summary.id,
      type: entry.summary.type,
      title: entry.summary.title,
      text: entry.summary.content ?? entry.summary.fileName ?? '',
    }));
}
