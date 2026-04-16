import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { questions } from '@/lib/questions';

const typeNames: Record<number, string> = {
  1: 'The Reformer',
  2: 'The Helper',
  3: 'The Achiever',
  4: 'The Individualist',
  5: 'The Investigator',
  6: 'The Loyalist',
  7: 'The Enthusiast',
  8: 'The Challenger',
  9: 'The Peacemaker',
};

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // 1. Load Notion credentials from settings
  const settings = await prisma.setting.findMany();
  const map: Record<string, string> = {};
  settings.forEach(s => { map[s.key] = s.value; });

  const notionToken = map['notion_token'];
  const notionDbId = map['notion_database_id'];

  if (!notionToken || !notionDbId) {
    return NextResponse.json({ error: 'Notion credentials not configured. Visit the Admin settings.' }, { status: 400 });
  }

  // 2. Load session and calculate scores
  const session = await prisma.session.findUnique({
    where: { id },
    include: { answers: true }
  });

  if (!session) return NextResponse.json({ error: 'Session not found' }, { status: 404 });

  const typeScores: Record<number, number> = {};
  for (let i = 1; i <= 9; i++) typeScores[i] = 0;
  session.answers.forEach((a: { questionId: number; value: number }) => {
    const q = questions.find(q => q.id === a.questionId);
    if (q) typeScores[q.type] += a.value;
  });

  const ranked = Object.entries(typeScores)
    .map(([type, score]) => ({ type: parseInt(type), score }))
    .sort((a, b) => b.score - a.score);

  const topType = ranked[0];
  const takenDate = session.createdAt.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // 3. Build Notion table rows
  const tableRows = ranked.map(r => ({
    object: 'block',
    type: 'table_row',
    table_row: {
      cells: [
        [{ type: 'text', text: { content: `Type ${r.type}, ${typeNames[r.type]}` } }],
        [{ type: 'text', text: { content: String(r.score) } }],
      ]
    }
  }));

  // 4. Create the Notion page
  const notionRes = await fetch('https://api.notion.com/v1/pages', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${notionToken}`,
      'Content-Type': 'application/json',
      'Notion-Version': '2022-06-28',
    },
    body: JSON.stringify({
      parent: { database_id: notionDbId },
      properties: {
        title: {
          title: [{ text: { content: `${session.name} — Enneagram Results` } }]
        }
      },
      children: [
        {
          object: 'block',
          type: 'heading_2',
          heading_2: {
            rich_text: [{ type: 'text', text: { content: `${session.name}` } }]
          }
        },
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [{ type: 'text', text: { content: `Primary Type: Type ${topType.type}, ${typeNames[topType.type]} · Taken: ${takenDate}` } }]
          }
        },
        {
          object: 'block',
          type: 'table',
          table: {
            table_width: 2,
            has_column_header: true,
            has_row_header: false,
            children: [
              {
                object: 'block',
                type: 'table_row',
                table_row: {
                  cells: [
                    [{ type: 'text', text: { content: 'Enneagram Type' } }],
                    [{ type: 'text', text: { content: 'Score' } }],
                  ]
                }
              },
              ...tableRows
            ]
          }
        }
      ]
    })
  });

  if (!notionRes.ok) {
    const err = await notionRes.json();
    console.error('Notion error:', err);
    return NextResponse.json({ error: err.message || 'Notion API error' }, { status: 500 });
  }

  const page = await notionRes.json();
  return NextResponse.json({ url: page.url });
}
