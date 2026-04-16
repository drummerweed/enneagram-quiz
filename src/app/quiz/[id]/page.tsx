import { prisma } from '@/lib/prisma';
import { getAllQuestions } from '@/lib/getAllQuestions';
import { notFound } from 'next/navigation';
import QuizClient from '@/components/QuizClient';

export default async function QuizPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const session = await prisma.session.findUnique({
    where: { id },
    include: { answers: true }
  });

  if (!session) notFound();

  const allQuestions = await getAllQuestions();

  let orderedIds: number[] = [];
  try { orderedIds = JSON.parse(session.questionOrder); } catch { /* empty */ }

  const sessionQuestions = orderedIds.length > 0
    ? orderedIds.map(qid => allQuestions.find(q => q.id === qid)).filter(Boolean) as typeof allQuestions
    : allQuestions;

  const safeQuestions = sessionQuestions.map(q => ({ id: q.id, text: q.text }));

  const initialAnswers = session.answers.reduce((acc: Record<number, number>, ans: { questionId: number, value: number }) => {
    acc[ans.questionId] = ans.value;
    return acc;
  }, {} as Record<number, number>);

  return (
    <main className="min-h-[100dvh] w-full flex items-center justify-center p-4 sm:p-6 lg:p-12 bg-[#f4f5f7]">
      <QuizClient sessionId={id} questions={safeQuestions} initialAnswers={initialAnswers} />
    </main>
  );
}
