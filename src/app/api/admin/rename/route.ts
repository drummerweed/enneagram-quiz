import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { id, name } = await req.json();
    
    if (!id || !name?.trim()) {
      return NextResponse.json({ error: 'Invalid data' }, { status: 400 });
    }

    await prisma.session.update({
      where: { id },
      data: { name: name.trim() }
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
