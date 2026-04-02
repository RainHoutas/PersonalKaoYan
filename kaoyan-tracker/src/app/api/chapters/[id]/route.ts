import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { hasMCQ, hasFIB, hasComp } = body;

    const data: any = {};
    if (typeof hasMCQ === 'boolean') data.hasMCQ = hasMCQ;
    if (typeof hasFIB === 'boolean') data.hasFIB = hasFIB;
    if (typeof hasComp === 'boolean') data.hasComp = hasComp;

    const chapter = await prisma.chapter.update({
      where: { id },
      data
    });

    return NextResponse.json(chapter);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update chapter' }, { status: 500 });
  }
}
