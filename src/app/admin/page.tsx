import { prisma } from '@/lib/prisma';
import { getAllQuestions } from '@/lib/getAllQuestions';
import AdminLayout from './AdminLayout';

export const dynamic = 'force-dynamic';

export default async function AdminPage() {
  const allQuestions = await getAllQuestions();

  const sessions = await prisma.session.findMany({
    include: { answers: true },
    orderBy: { createdAt: 'desc' },
  });

  const results = sessions.map(session => {
    const typeScores: Record<number, number> = {};
    for (let i = 1; i <= 9; i++) typeScores[i] = 0;

    session.answers.forEach((answer: { questionId: number, value: number }) => {
      const q = allQuestions.find(q => q.id === answer.questionId);
      if (q) typeScores[q.type] += answer.value;
    });

    const finalScores = Object.entries(typeScores)
      .map(([type, score]) => ({ type: parseInt(type), score }))
      .sort((a, b) => b.score - a.score);

    const topType = finalScores.length > 0 && finalScores[0].score > 0 ? finalScores[0].type : null;
    const isFinished = session.answers.length >= 192;

    return {
      id: session.id,
      name: session.name,
      createdAt: session.createdAt.toLocaleString(),
      isFinished,
      progress: session.answers.length,
      topType
    };
  });

  return <AdminLayout initialResults={results} />;
}
