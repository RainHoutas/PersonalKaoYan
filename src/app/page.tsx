'use client';

import { useEffect, useState } from 'react';
import { Pencil, ChevronRight } from 'lucide-react';

interface Chapter {
  id: string;
  order: number;
  title: string;
  hasMCQ: boolean;
  hasFIB: boolean;
  hasComp: boolean;
}

interface Subject {
  id: string;
  name: string;
  stageName: string;
  totalModules: number;
  subjectType: string;
  doneModules: number;
  totalWords: number;
  totalMinutes: number;
  suggestedPace: number;
  status: 'green' | 'yellow' | 'red';
  progressPercent: number;
  startDate?: string;
  endDate?: string;
  isWaiting?: boolean;
  chapters?: Chapter[];
}

interface DashboardData {
  daysLeft: number;
  deadline: string;
  subjects: Subject[];
}

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // 编辑弹窗状态
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);
  const [editingChapter, setEditingChapter] = useState<Chapter | null>(null);
  const [newStageName, setNewStageName] = useState('');
  const [newTotalModules, setNewTotalModules] = useState<number>(0);
  const [newStartDate, setNewStartDate] = useState('');
  const [newEndDate, setNewEndDate] = useState('');
  const [newDoneModules, setNewDoneModules] = useState<number>(0);
  const [newTotalWords, setNewTotalWords] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/subjects');
      const json = await res.json();
      setData(json);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const openEditModal = (sub: Subject) => {
    setEditingSubject(sub);
    setNewStageName(sub.stageName);
    setNewTotalModules(sub.totalModules);
    setNewStartDate(sub.startDate || '');
    setNewEndDate(sub.endDate || '');
    setNewDoneModules(sub.doneModules);
    setNewTotalWords(sub.totalWords || 0);
  };

  const handleUpdate = async () => {
    if (!editingSubject) return;
    setIsSubmitting(true);
    try {
      await fetch(`/api/subjects/${editingSubject.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stageName: newStageName,
          totalModules: newTotalModules,
          startDate: newStartDate,
          endDate: newEndDate,
          doneModules: newDoneModules,
          totalWords: newTotalWords
        })
      });
      await fetchData();
      setEditingSubject(null);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return <div className="p-12 text-primary font-bold">正在加载数据...</div>;
  }

  if (!data) return null;

  // 统计汇总
  const totalDone = data.subjects.reduce((sum, s) => sum + s.doneModules, 0);
  const totalAll = data.subjects.reduce((sum, s) => sum + s.totalModules, 0);
  const overallPercent = totalAll > 0 ? Math.round((totalDone / totalAll) * 100) : 0;

  // 时间流逝进度计算 (假设工程起点为 2026-03-10)
  const startDate = new Date('2026-03-10');
  const endDate = new Date(data.deadline);
  const totalDays = Math.max(1, (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  const daysElapsed = Math.max(0, totalDays - data.daysLeft);
  const timeProgressPercent = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100)).toFixed(1);

  return (
    <div className="w-full h-full overflow-y-auto relative">
      {/* 宽屏侧布 - 左侧时间进度的HUD轨道 (静止贴边) */}
      <div className="hidden xl:flex fixed top-[96px] left-6 2xl:left-10 bottom-12 w-[180px] flex-col items-start z-[50] pointer-events-none">
        
        {/* 统一的高斯虚化数据卡片 */}
        <div className="flex flex-col items-start bg-secondary/5 px-5 py-4 rounded-[24px] border border-secondary/10 backdrop-blur-md shadow-sm mb-6 pointer-events-auto">
          <span className="text-[10px] text-secondary/80 font-bold uppercase tracking-widest mb-1.5">倒计时</span>
          <span className="font-headline text-4xl font-black text-secondary leading-none drop-shadow-sm">{data.daysLeft}<span className="text-xl opacity-70 ml-1">天</span></span>
        </div>
        
        {/* 带精密刻度的垂直时间线 (统一自下而上) */}
        <div className="relative ml-8 flex-1 flex pointer-events-auto group mt-1">
          {/* 辅助刻度尺及数字标注 */}
          <div className="absolute top-0 bottom-0 -left-[30px] w-6 flex flex-col justify-between items-end py-[2px] pointer-events-none">
            {Array.from({ length: 21 }).map((_, i) => {
              const isMajor = i % 5 === 0;
              // i=0在极顶端(剩余0天)，i=20在极底端(剩余 totalDays)
              const daysAtTick = Math.round((i / 20) * totalDays);
              return (
                <div key={`left-tick-${i}`} className="relative flex items-center justify-end w-full h-[2px]">
                  {isMajor && (
                    <span className="absolute right-4 text-[9px] font-bold text-secondary/50 leading-none">
                      {daysAtTick}
                    </span>
                  )}
                  <div className={`h-full rounded-full ${isMajor ? 'w-3 bg-secondary/60' : 'w-1.5 bg-secondary/20'}`}></div>
                </div>
              );
            })}
          </div>

          <div className="relative w-2 h-full bg-surface-container rounded-full shadow-inner overflow-hidden">
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-secondary/30 to-secondary/90 rounded-full transition-all duration-1000 ease-out" style={{ height: `${timeProgressPercent}%` }}></div>
          </div>
          
          {/* 滑动游标 */}
          <div className="absolute left-1 -translate-x-1/2 w-[16px] h-[16px] bg-surface-container-lowest border-[4px] border-secondary shadow-md shadow-secondary/30 rounded-full transition-all duration-1000 ease-out z-10 flex items-center justify-center group-hover:scale-[1.3]" style={{ bottom: `${timeProgressPercent}%`, marginBottom: '-8px' }}></div>
          
          <div className="absolute left-6 text-xs font-bold text-secondary/80 tracking-widest whitespace-nowrap transition-all duration-1000" style={{ bottom: `${timeProgressPercent}%`, marginBottom: '-8px' }}>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">已过 {timeProgressPercent}%</span>
          </div>
        </div>
      </div>

      {/* 宽屏侧布 - 右侧任务大厦的HUD轨道 (静止贴边) */}
      <div className="hidden xl:flex fixed top-[96px] right-6 2xl:right-10 bottom-12 w-[180px] flex-col items-end z-[50] pointer-events-none">
        
        {/* 统一的高斯虚化数据卡片 */}
        <div className="flex flex-col items-end bg-primary/5 px-5 py-4 rounded-[24px] border border-primary/10 backdrop-blur-md shadow-sm mb-6 pointer-events-auto">
          <span className="text-[10px] text-primary/80 font-bold uppercase tracking-widest mb-1.5">大类总进度</span>
          <span className="font-headline text-4xl font-black text-primary leading-none drop-shadow-sm">{overallPercent}<span className="text-xl opacity-70 ml-1">%</span></span>
        </div>
        
        {/* 带精密刻度的垂直进度条 (统一自下而上) */}
        <div className="relative mr-8 flex-1 flex flex-col items-end pointer-events-auto group mt-1">
          {/* 辅助刻度尺及数字标注 */}
          <div className="absolute top-0 bottom-0 -right-[30px] w-6 flex flex-col justify-between items-start py-[2px] pointer-events-none">
            {Array.from({ length: 21 }).map((_, i) => {
              const isMajor = i % 5 === 0;
              return (
                <div key={`right-tick-${i}`} className="relative flex items-center justify-start w-full h-[2px]">
                  {isMajor && (
                    <span className="absolute left-4 text-[9px] font-bold text-primary/50 leading-none">
                      {100 - i * 5}
                    </span>
                  )}
                  <div className={`h-full rounded-full ${isMajor ? 'w-3 bg-primary/60' : 'w-1.5 bg-primary/20'}`}></div>
                </div>
              );
            })}
          </div>

          <div className="relative w-2 h-full bg-surface-container rounded-full shadow-inner overflow-hidden">
            <div className="absolute bottom-0 w-full bg-gradient-to-t from-primary/30 to-primary/90 rounded-full transition-all duration-1000 ease-out" style={{ height: `${overallPercent}%` }}></div>
          </div>
          
          {/* 滑动游标 */}
          <div className="absolute right-1 translate-x-1/2 w-[16px] h-[16px] bg-surface-container-lowest border-[4px] border-primary shadow-md shadow-primary/30 rounded-full transition-all duration-1000 ease-out z-10 flex items-center justify-center group-hover:scale-[1.3]" style={{ bottom: `${overallPercent}%`, marginBottom: '-8px' }}></div>
          
          <div className="absolute right-6 text-xs font-bold text-primary/80 tracking-widest whitespace-nowrap transition-all duration-1000" style={{ bottom: `${overallPercent}%`, marginBottom: '-8px' }}>
            <span className="opacity-0 group-hover:opacity-100 transition-opacity">打卡 {overallPercent}%</span>
          </div>
        </div>
      </div>

      <div className="pt-6 pb-32 px-4 md:px-10 max-w-4xl mx-auto">
        {/* 窄屏或移动端仍保持顶部概览条 */}
        <div className="flex xl:hidden items-center justify-between mb-8">
          <div>
            <h2 className="font-headline text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">控制台</h2>
            <p className="text-on-surface-variant text-sm mt-1">
              距 <span className="text-primary font-bold">{data.deadline}</span> 还有 <span className="text-primary font-extrabold text-lg">{data.daysLeft}</span> 天
            </p>
          </div>
          <div className="flex items-center gap-3 bg-primary/10 px-4 py-2 rounded-2xl">
            <span className="font-headline text-2xl font-extrabold text-primary">{overallPercent}%</span>
            <span className="text-xs text-on-surface-variant font-medium">总进度</span>
          </div>
        </div>

      {/* 分组科目列表 */}
      <div className="space-y-5 xl:space-y-6 flex flex-col pb-10">
        {[
          {
            id: 'math',
            title: '考研数学',
            subjects: data.subjects.filter(s => s.name === '高等数学' || s.name === '线性代数')
          },
          {
            id: '408',
            title: '408专业基础', // 简化名称以利于侧边排布
            subjects: data.subjects.filter(s => s.name.startsWith('408'))
          },
          {
            id: 'english',
            title: '考研英语',
            subjects: data.subjects.filter(s => s.name.includes('英语'))
          }
        ].map(group => {
          if (group.subjects.length === 0) return null;
          
          const isEnglish = group.id === 'english';
          const totalModules = group.subjects.reduce((sum, s) => sum + s.totalModules, 0);
          const doneModules = group.subjects.reduce((sum, s) => sum + s.doneModules, 0);
          const remaining = Math.max(0, totalModules - doneModules);
          const groupPace = data.daysLeft > 0 ? (remaining / data.daysLeft).toFixed(2) : 0;
          
          let groupProgressStr = '0.0';
          if (isEnglish) {
            const doneWords = group.subjects.reduce((sum, s) => sum + (s.totalWords || 0), 0);
            groupProgressStr = ((doneWords / 5666) * 100).toFixed(1);
          } else {
            groupProgressStr = totalModules > 0 ? ((doneModules / totalModules) * 100).toFixed(1) : '0.0';
          }

          const activeSubject = group.subjects.find(s => !s.isWaiting && s.progressPercent < 100) || group.subjects.find(s => !s.isWaiting) || group.subjects[0];
          const activeSubjectName = activeSubject.name.replace('408 - ', '');

          return (
            <div key={group.id} className="relative w-full group/section">
              {/* 宽屏下的悬浮左侧标题与当前任务 - 常亮突出 */}
              <div className="hidden xl:flex absolute top-1/2 -translate-y-1/2 -left-[160px] w-[140px] flex-col items-end pr-5 border-r-[4px] border-primary/40 z-10 transition-transform duration-300 hover:-translate-x-1">
                <h3 className="font-headline text-2xl font-extrabold text-on-surface text-right leading-tight min-w-max tracking-wide mb-2.5">
                  {group.title}
                </h3>
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-bold text-outline uppercase tracking-widest mb-1">当前任务</span>
                  <span className="text-secondary font-bold text-sm text-right leading-tight bg-secondary/10 px-2.5 py-1 rounded-lg border border-secondary/20 shadow-sm">
                    {activeSubjectName}
                  </span>
                </div>
              </div>

              {/* 宽屏下的悬浮右侧数据 - 大号高亮当前子任务常量显示，次要显示总进度 */}
              <div className="hidden xl:flex absolute top-1/2 -translate-y-1/2 -right-[160px] w-[140px] flex-col items-start pl-5 border-l-[4px] border-primary/40 z-10 transition-transform duration-300 hover:translate-x-1">
                <div className="flex flex-col gap-3 w-full">
                  {/* 首要元素：当前子任务 */}
                  <div>
                    <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-1">子任务进度</span>
                    <div className="font-headline text-4xl font-black text-primary drop-shadow-md leading-none tracking-tighter">
                      {activeSubject.progressPercent || 0}<span className="text-lg text-primary/70 font-bold ml-0.5">%</span>
                    </div>
                  </div>
                  
                  {!isEnglish && activeSubject.totalModules > 0 && (
                    <div>
                      <span className="text-[10px] font-bold text-secondary uppercase tracking-widest block mb-1">当前目标配速</span>
                      <div className="font-bold text-primary text-xl drop-shadow-sm leading-none">
                        {activeSubject.suggestedPace || 0} <span className="text-[10px] font-medium opacity-70">模块/天</span>
                      </div>
                    </div>
                  )}

                  {/* 次要元素：总进度聚合 */}
                  <div className="mt-1 pt-2.5 border-t border-primary/20 w-full flex flex-col gap-1.5 opacity-80">
                    <div className="flex items-center justify-between w-full">
                      <span className="text-[9px] font-bold text-outline-variant uppercase tracking-widest">{isEnglish ? '总词汇' : '大类聚合'}</span>
                      <span className="text-sm font-extrabold text-on-surface-variant leading-none">{groupProgressStr}%</span>
                    </div>
                    {!isEnglish && totalModules > 0 && (
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[9px] font-bold text-outline-variant uppercase tracking-widest">总体配速</span>
                        <span className="text-sm font-extrabold text-on-surface-variant leading-none">{groupPace}<span className="text-[9px] font-medium opacity-60 ml-0.5">/天</span></span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* 窄屏保留的顶部表头统计 */}
              <div className="xl:hidden flex items-end justify-between px-2 mb-3">
                <h3 className="font-headline text-xl font-bold text-on-surface">{group.title}</h3>
                <div className="text-xs font-medium text-outline">
                  进度 <span className="text-primary font-bold">{groupProgressStr}%</span>
                  {!isEnglish && totalModules > 0 && (
                    <>
                      <span className="mx-2 opacity-30">|</span>
                      配速 <span className="text-primary font-bold">{groupPace}</span>/天
                    </>
                  )}
                </div>
              </div>

              {/* 分组内科目卡片 */}
              <div className="bg-surface-container-lowest rounded-[20px] border border-outline-variant/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden divide-y divide-outline-variant/10 relative z-20 group-hover/section:border-primary/20 group-hover/section:shadow-primary/5 transition-all duration-500 bg-white">
                {group.subjects.map((sub) => (
                  <div
                    key={sub.id}
                    className={`flex items-center gap-4 px-5 py-4 transition-colors group ${
                      sub.isWaiting ? 'opacity-50 grayscale bg-surface-container/30' : 'hover:bg-surface-container-low/50'
                    }`}
                  >
                    {/* 状态指示点 */}
                    <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      sub.isWaiting ? 'bg-outline-variant' :
                      sub.status === 'green' ? 'bg-primary' :
                      sub.status === 'yellow' ? 'bg-amber-400' : 'bg-red-500'
                    }`} />

                    {/* 科目信息 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-headline text-base font-bold text-on-surface truncate">
                          {sub.name}
                        </span>
                        <span className={`shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold leading-tight ${
                          sub.subjectType === 'ENGLISH'
                            ? 'bg-secondary-container text-on-secondary-container'
                            : 'bg-primary/10 text-primary'
                        }`}>
                          {sub.stageName}
                        </span>
                        {(sub.startDate || sub.endDate) && (
                          <span className="shrink-0 text-[10px] font-medium text-outline-variant border border-outline-variant/30 rounded-full px-2 py-0.5">
                            {[sub.startDate?.slice(5), sub.endDate?.slice(5)].filter(Boolean).join(' 至 ')}
                          </span>
                        )}
                        {sub.isWaiting && (
                          <span className="shrink-0 px-2 py-0.5 rounded-md text-[10px] font-bold leading-tight bg-surface-variant text-on-surface-variant">
                            未开始
                          </span>
                        )}
                      </div>
                      {/* 进度条 */}
                      <div className="relative h-4 w-full bg-surface-container rounded-[12px] overflow-hidden shrink-0 mt-1 isolate">
                        <div
                          className={`absolute top-0 left-0 h-full rounded-[12px] transition-all duration-700 ease-out z-0 ${
                            sub.isWaiting ? 'bg-outline-variant' : 'bg-gradient-to-r from-primary to-primary-container'
                          }`}
                          style={{ width: `${sub.progressPercent}%` }}
                        />
                        {/* 进度文字（底色层）：在未完成区域显示的文字颜色 */}
                        <div className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-headline select-none z-10 text-on-surface-variant/70 pointer-events-none">
                          {sub.subjectType === 'PROFESSIONAL' 
                            ? `${sub.doneModules} / ${sub.totalModules} 进度` 
                            : `${sub.totalWords} / 5666 单词`}
                        </div>
                        {/* 进度文字（高亮层）：仅在进度条已填充区域使用 clip-path 裁切显示 */}
                        <div 
                          className="absolute inset-0 flex items-center justify-center text-[10px] font-bold font-headline select-none z-20 text-white drop-shadow-sm pointer-events-none transition-all duration-700 ease-out"
                          style={{ clipPath: `inset(0 ${100 - (sub.progressPercent || 0)}% 0 0)` }}
                        >
                          {sub.subjectType === 'PROFESSIONAL' 
                            ? `${sub.doneModules} / ${sub.totalModules} 进度` 
                            : `${sub.totalWords} / 5666 单词`}
                        </div>
                      </div>

                      {/* 如果存在章节细分，展示分段进度排布 */}
                      {sub.chapters && sub.chapters.length > 0 && (
                        <div className="mt-4 flex items-center justify-between gap-1 w-full h-10">
                          {sub.chapters.map(ch => {
                            const doneCount = [ch.hasMCQ, ch.hasFIB, ch.hasComp].filter(Boolean).length;
                            const isAllDone = doneCount === 3;
                            
                            return (
                              <button
                                key={ch.id}
                                onClick={() => setEditingChapter({ ...ch })}
                                className={`flex-1 flex px-0.5 justify-center items-center h-full rounded-[6px] border ${
                                  isAllDone ? 'bg-primary/20 border-primary/40' : 
                                  doneCount > 0 ? 'bg-amber-400/10 border-amber-400/40' :
                                  'bg-surface-container border-transparent'
                                } transition-all hover:brightness-110 active:scale-95 group/ch overflow-hidden relative cursor-pointer`}
                              >
                                <span className={`absolute top-1 text-[9px] font-bold z-10 scale-90 whitespace-nowrap ${
                                  isAllDone ? 'text-primary' :
                                  doneCount > 0 ? 'text-amber-500/80' :
                                  'text-on-surface-variant/40'
                                }`}>
                                  {ch.title}
                                </span>
                                
                                {/* 3小格结构 */}
                                <div className="flex gap-[2px] w-full h-[3px] mt-4 px-1">
                                  <div className={`flex-1 rounded-sm ${ch.hasMCQ ? (isAllDone ? 'bg-primary' : 'bg-amber-400') : 'bg-outline-variant/20'}`} />
                                  <div className={`flex-1 rounded-sm ${ch.hasFIB ? (isAllDone ? 'bg-primary' : 'bg-amber-400') : 'bg-outline-variant/20'}`} />
                                  <div className={`flex-1 rounded-sm ${ch.hasComp ? (isAllDone ? 'bg-primary' : 'bg-amber-400') : 'bg-outline-variant/20'}`} />
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* 右侧数据 */}
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="font-headline text-lg font-extrabold text-primary leading-none">
                          {sub.progressPercent}<span className="text-[10px] ml-0.5 text-primary/60 font-bold">%</span>
                        </div>
                        <div className="text-[10px] text-on-surface-variant font-medium mt-0.5">
                          {sub.subjectType === 'PROFESSIONAL'
                            ? `${sub.doneModules}/${sub.totalModules}`
                            : `${sub.totalWords}/5666 词`}
                          {sub.subjectType === 'PROFESSIONAL' && sub.totalModules > 0 && (
                            <span className={`ml-1 ${sub.status === 'red' ? 'text-red-500' : 'text-primary/60'}`}>
                              · {sub.suggestedPace}/天
                            </span>
                          )}
                        </div>
                      </div>

                      {/* 编辑按钮 */}
                      <button
                        onClick={() => openEditModal(sub)}
                        className="w-8 h-8 rounded-full flex items-center justify-center text-outline opacity-0 group-hover:opacity-100 hover:bg-primary/10 hover:text-primary transition-all active:scale-90"
                      >
                        <Pencil size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      </div>

      {/* 编辑弹窗 (MD3 Dialog) */}
      {editingSubject && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-[28px] p-8 w-full max-w-md shadow-2xl relative">
            <h3 className="font-headline text-2xl font-bold mb-6 text-on-surface">配置: {editingSubject.name}</h3>
            
            <div className="space-y-5">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">当前阶段名称</label>
                <input 
                  type="text" 
                  value={newStageName}
                  onChange={(e) => setNewStageName(e.target.value)}
                  className="bg-surface-container-high border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/50 focus:bg-surface-container-lowest transition-all outline-none text-on-surface"
                />
              </div>

              {editingSubject.subjectType === 'PROFESSIONAL' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">总模块数</label>
                    <input 
                      type="number" 
                      value={newTotalModules}
                      onChange={(e) => setNewTotalModules(Number(e.target.value))}
                      className="bg-surface-container-high border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/50 focus:bg-surface-container-lowest transition-all outline-none text-on-surface"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">当前已完成</label>
                    <input 
                      type="number" 
                      value={newDoneModules}
                      onChange={(e) => setNewDoneModules(Number(e.target.value))}
                      className="bg-surface-container-high border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/50 focus:bg-surface-container-lowest transition-all outline-none text-on-surface"
                    />
                  </div>
                </div>
              )}

              {editingSubject.subjectType === 'ENGLISH' && (
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">当前已背单词数</label>
                  <input 
                    type="number" 
                    value={newTotalWords}
                    onChange={(e) => setNewTotalWords(Number(e.target.value))}
                    className="bg-surface-container-high border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/50 focus:bg-surface-container-lowest transition-all outline-none text-on-surface"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">开始日期</label>
                  <input 
                    type="date" 
                    value={newStartDate}
                    onChange={(e) => setNewStartDate(e.target.value)}
                    className="bg-surface-container-high border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/50 focus:bg-surface-container-lowest transition-all outline-none text-on-surface"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">结束 (死线)</label>
                  <input 
                    type="date" 
                    value={newEndDate}
                    onChange={(e) => setNewEndDate(e.target.value)}
                    className="bg-surface-container-high border-none rounded-xl p-3 focus:ring-2 focus:ring-primary/50 focus:bg-surface-container-lowest transition-all outline-none text-on-surface"
                  />
                </div>
              </div>
            </div>

            <div className="flex gap-4 mt-10 justify-end">
              <button 
                onClick={() => setEditingSubject(null)}
                className="px-6 py-3 rounded-full text-primary font-bold hover:bg-primary/10 transition-colors"
                disabled={isSubmitting}
              >
                取消
              </button>
              <button 
                onClick={handleUpdate}
                className="px-8 py-3 rounded-full bg-primary text-on-primary font-bold shadow-md shadow-primary/20 active:scale-95 transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? '保存中...' : '保存更改'}
              </button>
            </div>
          </div>
        </div>
      )}
      {/* 章节专属弹窗 */}
      {editingChapter && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-inverse-surface/40 backdrop-blur-sm p-4">
          <div className="bg-surface-container-lowest rounded-[28px] p-8 w-full max-w-sm shadow-2xl relative">
            <h3 className="font-headline text-xl font-bold mb-2 text-on-surface">{editingChapter.title} - 高数核心追踪</h3>
            <p className="text-xs text-on-surface-variant font-medium mb-6">点击任意项标记为已搞定</p>
            
            <div className="space-y-4">
              {[
                { key: 'hasMCQ', label: '✅ 选择题 (MCQ)' },
                { key: 'hasFIB', label: '✅ 填空题 (Fill Blanks)' },
                { key: 'hasComp', label: '✅ 综合大题 (Problems)' }
              ].map(item => (
                <label key={item.key} className="flex items-center justify-between p-4 rounded-2xl bg-surface-container-high/50 hover:bg-surface-container-high cursor-pointer transition-colors active:scale-[0.98]">
                  <span className="font-bold text-sm text-on-surface">{item.label}</span>
                  <input
                    type="checkbox"
                    checked={editingChapter[item.key as keyof Chapter] as boolean}
                    onChange={(e) => setEditingChapter({ ...editingChapter, [item.key]: e.target.checked })}
                    className="w-5 h-5 rounded-md border-outline text-primary focus:ring-primary focus:ring-offset-0 bg-surface-container-lowest"
                  />
                </label>
              ))}
            </div>

            <div className="flex gap-4 mt-8 justify-end">
              <button 
                onClick={() => setEditingChapter(null)}
                className="px-6 py-2 rounded-full text-primary font-bold hover:bg-primary/10 transition-colors"
                disabled={isSubmitting}
              >
                待定
              </button>
              <button 
                onClick={async () => {
                  setIsSubmitting(true);
                  try {
                    await fetch(`/api/chapters/${editingChapter.id}`, {
                      method: 'PUT',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        hasMCQ: editingChapter.hasMCQ,
                        hasFIB: editingChapter.hasFIB,
                        hasComp: editingChapter.hasComp
                      })
                    });
                    await fetchData();
                    setEditingChapter(null);
                  } catch (e) {
                    console.error(e);
                  } finally {
                    setIsSubmitting(false);
                  }
                }}
                className="px-6 py-2 rounded-full bg-primary text-on-primary font-bold shadow-md shadow-primary/20 active:scale-95 transition-all"
                disabled={isSubmitting}
              >
                {isSubmitting ? '同步中...' : '标记打卡'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
