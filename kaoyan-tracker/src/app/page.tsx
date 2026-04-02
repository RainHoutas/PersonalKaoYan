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
          totalModules: newTotalModules
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

  return (
    <div className="w-full h-full overflow-y-auto pt-10 md:pt-16 pb-32 px-4 md:px-10 max-w-4xl mx-auto">
      {/* 顶部概览条 */}
      <div className="flex items-center justify-between mb-8">
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
      <div className="space-y-8">
        {[
          {
            id: 'math',
            title: '考研数学',
            subjects: data.subjects.filter(s => s.name === '高等数学' || s.name === '线性代数')
          },
          {
            id: '408',
            title: '408 计算机专业基础',
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
          const groupProgress = totalModules > 0 ? ((doneModules / totalModules) * 100).toFixed(1) : 0;

          return (
            <div key={group.id} className="flex flex-col gap-3">
              {/* 分组表头统计 */}
              <div className="flex items-end justify-between px-2">
                <h3 className="font-headline text-xl font-bold text-on-surface">{group.title}</h3>
                {!isEnglish && totalModules > 0 && (
                  <div className="text-xs font-medium text-outline">
                    聚合进度 <span className="text-primary font-bold">{groupProgress}%</span>
                    <span className="mx-2 opacity-30">|</span>
                    目标配速 <span className="text-primary font-bold">{groupPace}</span> 模块/天
                  </div>
                )}
              </div>

              {/* 分组内科目 */}
              <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/10 shadow-[0_2px_12px_rgba(0,0,0,0.03)] overflow-hidden divide-y divide-outline-variant/10">
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
                      <div className="h-1.5 w-full bg-surface-container rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-700 ease-out ${
                            sub.isWaiting ? 'bg-outline-variant' : 'bg-gradient-to-r from-primary to-primary-container'
                          }`}
                          style={{ width: `${sub.progressPercent}%` }}
                        />
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
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">单阶段总模块数</label>
                  <input 
                    type="number" 
                    value={newTotalModules}
                    onChange={(e) => setNewTotalModules(Number(e.target.value))}
                    className="bg-surface-container-high border-none rounded-xl p-4 focus:ring-2 focus:ring-primary/50 focus:bg-surface-container-lowest transition-all outline-none text-on-surface"
                  />
                </div>
              )}
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
