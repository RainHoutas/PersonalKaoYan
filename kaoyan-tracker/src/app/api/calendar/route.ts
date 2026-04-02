import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const month = searchParams.get('month'); // YYYY-MM

    if (!month) {
      return NextResponse.json({ error: 'Month is required (YYYY-MM)' }, { status: 400 });
    }

    // 获取特定月份的打卡记录
    const records = await prisma.record.findMany({
      where: {
        date: {
          startsWith: month
        }
      },
      select: {
        date: true
      }
    });

    // 提取有打卡记录的不重复日期集合
    const activeDates = Array.from(new Set(records.map(r => r.date)));

    return NextResponse.json({ activeDates });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
