import { prisma } from '@/lib/prisma';
import { questions } from '@/lib/questions';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { RefreshCcw } from 'lucide-react';
import ShareToNotionButton from '@/components/ShareToNotionButton';

export default async function ResultsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  
  const session = await prisma.session.findUnique({
    where: { id },
    include: { answers: true }
  });

  if (!session) {
    notFound();
  }

  const typeScores: Record<number, number> = {};
  for (let i = 1; i <= 9; i++) typeScores[i] = 0;
  
  session.answers.forEach((answer: { questionId: number, value: number }) => {
    const question = questions.find(q => q.id === answer.questionId);
    if (question) typeScores[question.type] += answer.value;
  });

  const finalScores = Object.entries(typeScores)
    .map(([type, score]) => ({ type: parseInt(type), score }))
    .sort((a, b) => b.score - a.score);

  const typeNames: Record<number, string> = {
    1: "The Reformer",
    2: "The Helper",
    3: "The Achiever",
    4: "The Individualist",
    5: "The Investigator",
    6: "The Loyalist",
    7: "The Enthusiast",
    8: "The Challenger",
    9: "The Peacemaker"
  };

  // Check if Notion is configured
  const notionSetting = await prisma.setting.findUnique({ where: { key: 'notion_token' } });
  const notionConfigured = !!notionSetting?.value;

  return (
    <main className="min-h-[100dvh] w-full flex flex-col p-8 sm:p-12 bg-white">
      <div className="max-w-[700px] w-full mx-auto mt-10">
        <div className="flex items-start justify-between mb-8 px-1 gap-4">
          <h1 className="text-2xl font-bold text-black">Assessment Results: {session.name}</h1>
          {notionConfigured && (
            <ShareToNotionButton sessionId={id} />
          )}
        </div>
        <div className="border border-gray-200">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="p-3 font-bold text-black text-[15px] border-r border-gray-200">Enneagram Type</th>
                <th className="p-3 font-bold text-black text-[15px] w-24">Score</th>
              </tr>
            </thead>
            <tbody>
              {finalScores.map((res, i) => (
                <tr key={res.type} className={i !== finalScores.length - 1 ? "border-b border-gray-100" : ""}>
                  <td className="p-3 text-black text-[15px] border-r border-gray-100">Type {res.type}, {typeNames[res.type]}</td>
                  <td className="p-3 text-black text-[15px]">{res.score}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        <div className="mt-12 flex items-center gap-8">
          <Link href="/admin" className="inline-flex items-center gap-1.5 text-slate-400 hover:text-slate-600 text-sm font-semibold transition-colors">
            ← Back to Admin
          </Link>
          <Link href="/" className="inline-flex items-center gap-2 text-indigo-600 hover:text-indigo-800 text-sm font-bold transition-colors">
            <RefreshCcw className="w-3.5 h-3.5"/>
            New Assessment
          </Link>
        </div>
      </div>
    </main>
  );
}
