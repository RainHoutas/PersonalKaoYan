import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const { stageName, totalModules, startDate, endDate, doneModules } = body;

    const subject = await prisma.subject.update({
      where: { id },
      data: {
        ...(stageName && { stageName }),
        ...(totalModules !== undefined && { totalModules: Number(totalModules) }),
        ...(startDate !== undefined && { startDate: startDate || null }),
        ...(endDate !== undefined && { endDate: endDate || null })
      }
    });

    if (doneModules !== undefined && subject.subjectType === 'PROFESSIONAL') {
      const records = await prisma.record.findMany({ where: { subjectId: id } });
      const currentSum = records.reduce((acc, r) => acc + (r.modulesDone || 0), 0);
      const diff = Number(doneModules) - currentSum;
      if (diff !== 0) {
        await prisma.record.create({
          data: {
            subjectId: id,
            modulesDone: diff,
            note: '系统校准进度',
            date: format(new Date(), 'yyyy-MM-dd')
          }
        });
      }
    }

    return NextResponse.json(subject);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to update subject' }, { status: 500 });
  }
}
