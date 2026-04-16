import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { questions } from '@/lib/questions';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionId = (await params).id;
    
    if (!sessionId) {
      return NextResponse.json({ error: 'Missing session ID' }, { status: 400 });
    }

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { answers: true }
    });

    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Initialize type scores
    const typeScores: Record<number, number> = {};
    const maxScorePerType: Record<number, number> = {};
    
    for (let i = 1; i <= 9; i++) {
        typeScores[i] = 0;
        maxScorePerType[i] = 0;
    }

    // Question distribution
    questions.forEach(q => {
      maxScorePerType[q.type] += 5; // The max value user can pick is 5
    });

    // Tally user answers
    session.answers.forEach((answer: { questionId: number, value: number }) => {
      const question = questions.find(q => q.id === answer.questionId);
      if (question) {
        typeScores[question.type] += answer.value;
      }
    });

    // Format final response map
    const finalScores = Object.entries(typeScores).map(([type, score]) => {
      const typeNum = parseInt(type);
      const percentage = Math.round((score / maxScorePerType[typeNum]) * 100) || 0;
      return { 
        type: typeNum, 
        score, 
        max: maxScorePerType[typeNum],
        percentage 
      };
    });

    // Sort by highest percentage
    finalScores.sort((a, b) => b.percentage - a.percentage);

    return NextResponse.json({ results: finalScores });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Failed to get results' }, { status: 500 });
  }
}
