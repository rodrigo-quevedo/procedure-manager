import type { User } from '@/features/auth/types';
import type { ClientProject } from '../types';

function normalizeText(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

function bigrams(value: string): string[] {
  if (value.length < 2) return [value];
  const grams: string[] = [];
  for (let index = 0; index < value.length - 1; index += 1) {
    grams.push(value.slice(index, index + 2));
  }
  return grams;
}

function similarityScore(left: string, right: string): number {
  if (left.length < 3 || right.length < 3) return 0;
  const leftGrams = bigrams(left);
  const rightCounts = new Map<string, number>();
  for (const gram of bigrams(right)) {
    rightCounts.set(gram, (rightCounts.get(gram) ?? 0) + 1);
  }
  let overlap = 0;
  for (const gram of leftGrams) {
    const count = rightCounts.get(gram) ?? 0;
    if (count > 0) {
      overlap += 1;
      rightCounts.set(gram, count - 1);
    }
  }
  return (2 * overlap) / (leftGrams.length + bigrams(right).length);
}

function fieldMatchesToken(token: string, field: string): boolean {
  const normalizedField = normalizeText(field);
  if (!normalizedField) return false;
  if (normalizedField.includes(token)) return true;
  const words = normalizedField.split(/[^a-z0-9@._+-]+/).filter(Boolean);
  return words.some((word) => similarityScore(token, word) >= 0.55);
}

export function projectMatchesQuery(
  project: ClientProject,
  participants: User[],
  query: string,
): boolean {
  const normalizedQuery = normalizeText(query);
  if (!normalizedQuery) return true;

  const tokens = normalizedQuery.split(/\s+/).filter(Boolean);
  const fields = [
    project.name,
    ...participants.flatMap((person) => [person.name, person.email]),
  ];

  return tokens.every((token) => fields.some((field) => fieldMatchesToken(token, field)));
}

export function projectParticipants(project: ClientProject, directory: User[]): User[] {
  const assignedIds = new Set([...project.leaderIds, ...project.memberIds]);
  return directory.filter((person) => assignedIds.has(person.id));
}
