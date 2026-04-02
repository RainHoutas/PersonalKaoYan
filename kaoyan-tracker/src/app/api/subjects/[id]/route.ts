import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { stageName, totalModules } = body;

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        ...(stageName && { stageName }),
        ...(totalModules !== undefined && { totalModules: Number(totalModules) })
      }
    });

    return NextResponse.json(subject);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}
