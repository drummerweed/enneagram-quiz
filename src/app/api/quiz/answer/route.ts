import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const { sessionId, questionId, value } = await request.json();

    if (!sessionId || !questionId || !value) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // We use Prisma's upsert to act as an auto-save that can handle overwrites
    await prisma.answer.upsert({
      where: {
        sessionId_questionId: {
          sessionId,
          questionId,
        },
      },
      update: {
        value,
      },
      create: {
        sessionId,
        questionId,
        value,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to save answer' }, { status: 500 });
  }
}
