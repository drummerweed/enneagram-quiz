import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAllQuestions, AnyQuestion } from '@/lib/getAllQuestions';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

async function selectQuestions(): Promise<number[]> {
  const allQuestions = await getAllQuestions();

  // Group by type
  const byType: Record<number, AnyQuestion[]> = {};
  for (let i = 1; i <= 9; i++) byType[i] = [];
  allQuestions.forEach(q => byType[q.type].push(q));

  // Shuffle each type's pool independently
  for (let i = 1; i <= 9; i++) {
    byType[i] = shuffle(byType[i]);
  }

  // Select 200 total: base 22 per type, types 1 & 2 get 23 (200 = 9*22 + 2)
  const TARGET = 200;
  const base = Math.floor(TARGET / 9);
  const extras = TARGET % 9;

  const selected: AnyQuestion[] = [];
  for (let type = 1; type <= 9; type++) {
    const target = type <= extras ? base + 1 : base;
    selected.push(...byType[type].slice(0, Math.min(target, byType[type].length)));
  }

  return shuffle(selected).map(q => q.id);
}

export async function POST(request: NextRequest) {
  try {
    let name = 'Anonymous';
    try {
      const body = await request.json();
      if (body.name) name = body.name;
    } catch { /* empty body */ }

    const questionOrder = JSON.stringify(await selectQuestions());

    const session = await prisma.session.create({
      data: { name, questionOrder }
    });
    return NextResponse.json({ sessionId: session.id });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to start session' }, { status: 500 });
  }
}
