'use client';

import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Languages, LineChart, Save } from 'lucide-react';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isSameMonth, startOfWeek, endOfWeek } from 'date-fns';

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [activeDates, setActiveDates] = useState<string[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [todaysRecords, setTodaysRecords] = useState<any[]>([]);

  // Form State
  const [englishWords, setEnglishWords] = useState('');
  const [englishMinutes, setEnglishMinutes] = useState('');
  
  const [selectedSubject, setSelectedSubject] = useState('');
  const [modulesDone, setModulesDone] = useState('');
  const [note, setNote] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchActiveDates(format(currentMonth, 'yyyy-MM'));
  }, [currentMonth]);

  useEffect(() => {
    fetchTodaysRecords(format(selectedDate, 'yyyy-MM-dd'));
  }, [selectedDate]);

  useEffect(() => {
    fetchSubjects();
  }, []);

  const fetchActiveDates = async (month: string) => {
    const res = await fetch(`/api/calendar?month=${month}`);
    const data = await res.json();
    setActiveDates(data.activeDates || []);
  };

  const fetchTodaysRecords = async (date: string) => {
    const res = await fetch(`/api/records?date=${date}`);
    const data = await res.json();
    setTodaysRecords(data || []);
  };

  const fetchSubjects = async () => {
    const res = await fetch('/api/subjects');
    const data = await res.json();
    setSubjects(data.subjects || []);
    const profs = (data.subjects || []).filter((s:any) => s.subjectType === 'PROFESSIONAL');
    if(profs.length > 0) setSelectedSubject(profs[0].id);
  };

  const handleEnglishSubmit = async () => {
    if(!englishWords && !englishMinutes) return;
    setIsSubmitting(true);
    const engSub = subjects.find(s => s.subjectType === 'ENGLISH');
    if(!engSub) return;
    
    await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId: engSub.id,
        date: format(selectedDate, 'yyyy-MM-dd'),
        wordsCount: englishWords,
        studyMinutes: englishMinutes
      })
    });
    setEnglishWords('');
    setEnglishMinutes('');
    fetchTodaysRecords(format(selectedDate, 'yyyy-MM-dd'));
    fetchActiveDates(format(currentMonth, 'yyyy-MM'));
    setIsSubmitting(false);
  };

  const handleProfSubmit = async () => {
    if(!selectedSubject || !modulesDone) return;
    setIsSubmitting(true);
    await fetch('/api/records', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        subjectId: selectedSubject,
        date: format(selectedDate, 'yyyy-MM-dd'),
        modulesDone: modulesDone,
        note: note
      })
    });
    setModulesDone('');
    setNote('');
    fetchTodaysRecords(format(selectedDate, 'yyyy-MM-dd'));
    fetchActiveDates(format(currentMonth, 'yyyy-MM'));
    setIsSubmitting(false);
  };

  const renderCalendarDays = () => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart, { weekStartsOn: 1 });
    const endDate = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const dateFormat = 'd';
    const rows: React.ReactNode[] = [];
    let days: React.ReactNode[] = [];
    let day = startDate;

    const daysList = eachDayOfInterval({ start: startDate, end: endDate });

    daysList.forEach((d, i) => {
      const isCurrentMonth = isSameMonth(d, monthStart);
      const isSelected = isSameDay(d, selectedDate);
      const isToday = isSameDay(d, new Date());
      const dateStr = format(d, 'yyyy-MM-dd');
      const hasRecord = activeDates.includes(dateStr);

      days.push(
        <div 
          key={d.toISOString()} 
          onClick={() => { setSelectedDate(d); if(!isCurrentMonth) setCurrentMonth(d); }}
          className={`h-12 flex flex-col items-center justify-center relative rounded-2xl cursor-pointer transition-all ${
            !isCurrentMonth ? 'text-outline/40' : 
            isSelected ? 'bg-primary text-on-primary shadow-lg shadow-primary/30 font-extrabold scale-105 z-10' : 
            'hover:bg-surface-container-highest'
          }`}
        >
          <span className={`font-headline text-lg ${isToday && !isSelected ? 'text-primary font-bold' : ''}`}>
            {format(d, dateFormat)}
          </span>
          {hasRecord && (
            <div className={`absolute bottom-2 w-1.5 h-1.5 rounded-full ${isSelected ? 'bg-on-primary' : 'bg-primary-container'}`}></div>
          )}
        </div>
      );

      if ((i + 1) % 7 === 0) {
        rows.push(<div className="grid grid-cols-7 gap-y-2 mb-2" key={d.toISOString()}>{days}</div>);
        days = [];
      }
    });

    return <div>{rows}</div>;
  };

  return (
    <div className="flex flex-col md:flex-row w-full h-full">
      <section className="w-full md:w-[45%] bg-surface p-6 md:p-8 pt-8 md:pt-12 overflow-y-auto">
        <header className="mb-6 flex justify-between items-end">
          <div>
            <h2 className="font-headline font-extrabold text-3xl text-on-surface tracking-tight">{format(currentMonth, 'yyyy年M月')}</h2>
            <p className="text-on-surface-variant font-medium mt-1">坚持学习，稳步向前</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-surface-container-high transition-colors active:scale-95 text-on-surface-variant">
              <ChevronLeft size={24} />
            </button>
            <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="p-2 rounded-full hover:bg-surface-container-high transition-colors active:scale-95 text-on-surface-variant">
              <ChevronRight size={24} />
            </button>
          </div>
        </header>

        <div className="bg-surface-container-lowest rounded-[24px] p-5 shadow-sm border border-outline-variant/5">
          <div className="grid grid-cols-7 mb-2">
            {['一','二','三','四','五','六','日'].map(d => (
              <div key={d} className="text-center text-xs font-bold text-outline uppercase tracking-widest py-1">
                {d}
              </div>
            ))}
          </div>
          {renderCalendarDays()}
        </div>
        
        <div className="mt-6 p-5 bg-surface-container-low rounded-[24px]">
          <h3 className="font-headline font-bold text-primary mb-3">本月追踪</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10">
              <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-1">活跃天数</p>
              <p className="font-headline font-extrabold text-2xl">{activeDates.length} <span className="text-sm font-medium opacity-60">天</span></p>
            </div>
            <div className="bg-surface-container-lowest p-4 rounded-xl border border-outline-variant/10">
              <p className="text-[10px] text-outline font-bold uppercase tracking-widest mb-1">状态</p>
              <p className="font-headline font-extrabold text-lg text-primary mt-1">进度正常</p>
            </div>
          </div>
        </div>
      </section>

      <section className="w-full md:w-[55%] bg-surface-container-low p-6 md:p-8 pt-6 md:pt-12 border-t md:border-t-0 md:border-l border-outline-variant/20 overflow-y-auto">
        <div className="flex items-center gap-4 mb-6">
          <h2 className="font-headline font-bold text-2xl tracking-tight text-on-surface">{format(selectedDate, 'M月d日')}</h2>
          {isSameDay(selectedDate, new Date()) && (
            <span className="bg-primary-container text-on-primary-container text-xs px-3 py-1 rounded-full font-bold">今天</span>
          )}
        </div>

        {/* English Card */}
        <div className="bg-surface-container-lowest p-5 rounded-[24px] mb-6 shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-3">
              <span className="p-2 bg-secondary-container text-on-secondary-container rounded-lg"><Languages size={20} /></span>
              <h3 className="font-headline font-bold text-lg text-on-surface">英语单词打卡</h3>
            </div>
            <button 
              onClick={handleEnglishSubmit} disabled={isSubmitting}
              className="bg-primary text-on-primary p-2 rounded-full shadow-md hover:scale-105 active:scale-95 transition-all text-sm"
            >
              <Save size={18} />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">单词量</label>
              <input 
                type="number" value={englishWords} onChange={e => setEnglishWords(e.target.value)}
                className="bg-surface-container-high border-none rounded-xl p-2.5 focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all outline-none" 
                placeholder="例如: 50" 
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest px-1">学习时长 (分钟)</label>
              <input 
                type="number" value={englishMinutes} onChange={e => setEnglishMinutes(e.target.value)}
                className="bg-surface-container-high border-none rounded-xl p-2.5 focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all outline-none" 
                placeholder="例如: 45" 
              />
            </div>
          </div>
        </div>

        {/* Subject Card */}
        <div className="bg-surface-container-lowest p-5 rounded-[24px] mb-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <span className="p-2 bg-primary/10 text-primary rounded-lg"><LineChart size={20} /></span>
            <h3 className="font-headline font-bold text-lg text-on-surface">专业课进报</h3>
          </div>

          <div className="space-y-2 mb-4">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">已上报流水</p>
            {todaysRecords.filter(r => r.subject?.subjectType === 'PROFESSIONAL').map(r => (
              <div key={r.id} className="flex justify-between items-center p-3 bg-surface-container-low rounded-xl">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full bg-primary/80"></div>
                  <div className="flex flex-col">
                    <span className="font-bold text-sm text-on-surface">{r.subject?.name}</span>
                    {r.note && <span className="text-xs text-on-surface-variant">{r.note}</span>}
                  </div>
                </div>
                <span className="text-primary font-extrabold text-sm bg-primary/10 px-3 py-1 rounded-full">+{r.modulesDone} 模块</span>
              </div>
            ))}
            {todaysRecords.filter(r => r.subject?.subjectType === 'PROFESSIONAL').length === 0 && (
              <div className="p-3 text-center text-sm text-outline border border-dashed border-outline-variant rounded-xl">今日暂无专业课记录</div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-outline-variant/10">
            <p className="text-[10px] font-bold text-outline uppercase tracking-widest">新增报告</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-on-surface-variant px-1">科目</label>
                <select 
                  value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}
                  className="bg-surface-container-high border-none rounded-xl p-2.5 focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all outline-none appearance-none font-medium"
                >
                  {subjects.filter(s => s.subjectType === 'PROFESSIONAL').map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-on-surface-variant px-1">完成量</label>
                <input 
                  type="number" value={modulesDone} onChange={e => setModulesDone(e.target.value)}
                  className="bg-surface-container-high border-none rounded-xl p-2.5 focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all outline-none" 
                  placeholder="增量模块数" 
                />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-medium text-on-surface-variant px-1">备注/复盘 (选填)</label>
              <textarea 
                value={note} onChange={e => setNote(e.target.value)}
                className="bg-surface-container-high border-none rounded-xl p-2.5 focus:ring-2 focus:ring-primary/30 focus:bg-surface-container-lowest transition-all outline-none resize-none" 
                placeholder="今天的专注点或遇到哪些难点..." 
                rows={1}
              ></textarea>
            </div>
            
            <button 
              onClick={handleProfSubmit} disabled={isSubmitting}
              className="w-full mt-1 py-3 bg-gradient-to-r from-primary to-primary-container text-on-primary rounded-full font-bold shadow-lg shadow-primary/20 active:scale-95 transition-transform flex items-center justify-center gap-3"
            >
              <Save size={20} />
              {isSubmitting ? '保存中...' : '提交进度'}
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
