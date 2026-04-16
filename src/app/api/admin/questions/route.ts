import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const questions = await prisma.customQuestion.findMany({ orderBy: { createdAt: 'asc' } });
  return NextResponse.json(questions);
}

export async function POST(req: Request) {
  try {
    const { text, type } = await req.json();
    if (!text?.trim() || !type || type < 1 || type > 9) {
      return NextResponse.json({ error: 'Invalid question data' }, { status: 400 });
    }
    const question = await prisma.customQuestion.create({
      data: { text: text.trim(), type: parseInt(type) }
    });
    return NextResponse.json(question);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to add question' }, { status: 500 });
  }
}
