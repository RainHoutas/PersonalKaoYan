'use client';

import { LayoutDashboard, CalendarDays } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const navItems = [
    { name: '控制台', path: '/', icon: LayoutDashboard },
    { name: '日历', path: '/calendar', icon: CalendarDays },
  ];

  return (
    <div className="flex bg-background text-on-background min-h-screen">
      {/* 桌面端侧边栏导航 */}
      <aside className="hidden md:flex flex-col h-screen w-64 py-8 bg-surface-container-low shrink-0 sticky top-0 border-r border-outline-variant/10">
        <div className="px-6 mb-10">
          <h1 className="font-headline font-bold text-primary text-2xl tracking-tighter">研途跋涉</h1>
          <div className="mt-8 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary-container flex items-center justify-center overflow-hidden">
              <span className="text-on-primary-container font-headline font-bold">2027</span>
            </div>
            <div>
              <p className="font-headline font-bold text-primary text-sm">学习会话</p>
              <p className="font-label text-xs uppercase tracking-widest text-outline">目标 B区211</p>
            </div>
          </div>
        </div>
        
        <nav className="flex-1 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.path;

            return (
              <Link key={item.path} href={item.path} className={`flex items-center gap-3 px-4 py-3 mx-2 rounded-full transition-all ${isActive ? 'bg-primary/10 text-primary font-bold' : 'text-on-surface-variant hover:bg-primary/5'}`}>
                <Icon size={20} />
                <span className="font-label text-xs uppercase tracking-widest font-medium">{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 flex flex-col md:flex-row h-screen overflow-hidden pb-16 md:pb-0 relative">
        {children}
      </main>

      {/* 移动端底部导航栏 */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-surface/90 backdrop-blur-xl flex justify-around py-3 px-6 z-50 border-t border-outline-variant/20 shadow-[0_-4px_24px_rgba(0,0,0,0.02)]">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.path;
          return (
            <Link key={item.path} href={item.path} className={`flex flex-col items-center gap-1 ${isActive ? 'text-primary' : 'text-outline'}`}>
              <Icon size={22} />
              <span className="font-label text-[10px] font-bold uppercase">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
