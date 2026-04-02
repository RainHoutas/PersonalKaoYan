import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { differenceInDays, parseISO } from 'date-fns';

export async function GET() {
  try {
    const subjects = await prisma.subject.findMany({
      include: {
        records: true,
        chapters: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    const now = new Date();
    
    // 计算动态全局死线（最晚的 endDate）
    let globalDeadlineStr = '2026-06-17';
    const validEndDates = subjects.map(s => s.endDate).filter(Boolean) as string[];
    if (validEndDates.length > 0) {
      globalDeadlineStr = validEndDates.sort().reverse()[0]; // 字典序逆序取最大日期
    }
    const globalDeadline = parseISO(globalDeadlineStr);
    const globalDaysLeft = Math.max(0, differenceInDays(globalDeadline, now));

    const enrichedSubjects = subjects.map(sub => {
      let doneModules = 0;
      let totalWords = 0;
      let totalMinutes = 0;

      sub.records.forEach(r => {
        if (sub.subjectType === 'PROFESSIONAL') {
          doneModules += r.modulesDone || 0;
        } else {
          totalWords += r.wordsCount || 0;
          totalMinutes += r.studyMinutes || 0;
        }
      });

      let suggestedPace = 0;
      let status = 'green'; // 'green', 'yellow', 'red'
      let progressPercent = 0;
      let isWaiting = false;

      if (sub.subjectType === 'PROFESSIONAL' && sub.totalModules > 0) {
        progressPercent = Math.min(100, Math.round((doneModules / sub.totalModules) * 100));
        
        let subDaysLeft = globalDaysLeft;
        if (sub.endDate) {
          subDaysLeft = Math.max(0, differenceInDays(parseISO(sub.endDate), now));
        }

        if (sub.startDate && differenceInDays(parseISO(sub.startDate), now) > 0) {
          isWaiting = true;
          suggestedPace = 0;
          status = 'green';
        } else {
          const remaining = Math.max(0, sub.totalModules - doneModules);
          const divisor = Math.max(1, subDaysLeft);
          suggestedPace = Number((remaining / divisor).toFixed(2));
          
          if (suggestedPace > 2) status = 'red';
          else if (suggestedPace > 1.2) status = 'yellow';
          else if (suggestedPace === 0 && remaining > 0) status = 'red'; // 过期未完成
        }
      }

      if (sub.subjectType === 'ENGLISH') {
        progressPercent = Number(((totalWords / 5666) * 100).toFixed(1));
        suggestedPace = 40; 
      } else if (sub.totalModules > 0 && !progressPercent) {
        progressPercent = Number(((doneModules / sub.totalModules) * 100).toFixed(1));
      }

      return {
        ...sub,
        doneModules,
        totalWords,
        totalWordsTarget: 5666,
        totalMinutes,
        suggestedPace,
        status,
        progressPercent,
        isWaiting,
        records: undefined
      };
    });

    return NextResponse.json({
      daysLeft: globalDaysLeft,
      deadline: globalDeadlineStr,
      subjects: enrichedSubjects
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
