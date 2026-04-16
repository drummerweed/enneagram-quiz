import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { ids } = await req.json();
    
    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ error: 'No IDs provided' }, { status: 400 });
    }

    // Prisma relation handles cascade, but let's be explicit and delete answers first
    await prisma.answer.deleteMany({
      where: { sessionId: { in: ids } }
    });
    
    await prisma.session.deleteMany({
      where: { id: { in: ids } }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
