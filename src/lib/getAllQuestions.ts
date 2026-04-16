import { prisma } from './prisma';
import { questions as staticQuestions } from './questions';

// Custom questions from DB use IDs offset by this value to avoid
// colliding with static question IDs (currently up to 216)
export const CUSTOM_ID_OFFSET = 10000;

export type AnyQuestion = { id: number; text: string; type: number };

export async function getAllQuestions(): Promise<AnyQuestion[]> {
  const custom = await prisma.customQuestion.findMany({ orderBy: { createdAt: 'asc' } });
  const customMapped: AnyQuestion[] = custom.map(q => ({
    id: q.id + CUSTOM_ID_OFFSET,
    text: q.text,
    type: q.type,
  }));
  return [...staticQuestions, ...customMapped];
}
