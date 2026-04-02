import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { format } from 'date-fns';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const date = searchParams.get('date'); // YYYY-MM-DD

    if (!date) {
      return NextResponse.json({ error: 'Date is required' }, { status: 400 });
    }

    const records = await prisma.record.findMany({
      where: { date },
      include: {
        subject: {
          select: { name: true, subjectType: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json(records);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { subjectId, modulesDone, note, wordsCount, studyMinutes } = body;
    
    // 使用传入或本地当前日期作为打卡日期 YYYY-MM-DD
    const date = body.date || format(new Date(), 'yyyy-MM-dd');

    const record = await prisma.record.create({
      data: {
        subjectId,
        date,
        // 根据传入数据自动存取
        modulesDone: modulesDone ? Number(modulesDone) : null,
        note: note || null,
        wordsCount: wordsCount ? Number(wordsCount) : null,
        studyMinutes: studyMinutes ? Number(studyMinutes) : null,
      }
    });

    return NextResponse.json(record);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Failed to create record' }, { status: 500 });
  }
}
