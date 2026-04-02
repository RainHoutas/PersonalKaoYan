'use client';

import { useState, useEffect, useRef } from 'react';
import { LayoutDashboard, CalendarDays, GraduationCap, ChevronDown, Settings, LogOut } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function TopNavbar() {
  const pathname = usePathname();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const navItems = [
    { name: '控制台', path: '/', icon: LayoutDashboard },
    { name: '日历', path: '/calendar', icon: CalendarDays },
  ];

  // 计算当前激活的索引
  const activeIndex = navItems.findIndex(item => item.path === pathname);
  
  // 处理外部点击关闭下拉菜单
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full h-16 bg-surface/90 backdrop-blur-xl border-b border-outline-variant/20 shadow-sm flex items-center justify-between px-4 md:px-6">
      
      {/* 左侧：Logo区域 */}
      <div className="flex items-center gap-2">
        <h1 className="font-headline font-bold text-primary text-xl md:text-2xl tracking-tighter">
          研途跋涉
        </h1>
      </div>

      {/* 居中：分段控制器导航 (Segmented Control) */}
      <div className="absolute left-1/2 -translate-x-1/2">
        <nav className="relative flex items-center bg-surface-container-low rounded-full p-1 border border-outline-variant/10">
          {/* 滑动背景块 */}
          <div 
            className="absolute left-1 top-1 bottom-1 w-[calc(50%-4px)] bg-primary/10 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] pointer-events-none shadow-[inset_0_0_0_1px_rgba(var(--color-primary-rgb),0.1)]"
            style={{ 
              transform: `translateX(${activeIndex === 1 ? '100%' : '0'}) translateX(${activeIndex === 1 ? '4px' : '0'})` 
            }}
          />
          
          {navItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeIndex === index;

            return (
              <Link 
                key={item.path} 
                href={item.path} 
                className={`relative flex items-center justify-center gap-2 px-4 py-1.5 md:w-28 w-24 rounded-full transition-colors duration-200 z-10 ${
                  isActive ? 'text-primary font-bold' : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icon size={18} className={isActive ? "text-primary" : "text-outline"} />
                <span className="font-label text-xs md:text-sm uppercase tracking-widest font-medium">
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 右侧：用户信息模块 */}
      <div className="flex items-center">
        <div className="relative" ref={dropdownRef}>
          <button 
            className="flex items-center gap-2 p-1 pl-2 pr-3 bg-surface-container-low hover:bg-surface-container rounded-full border border-outline-variant/10 transition-colors"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
          >
            {/* 头像 */}
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary">
              <GraduationCap size={16} />
            </div>
            {/* 简要信息 (在超小屏幕上可能需要隐藏文字) */}
            <div className="hidden sm:flex flex-col items-start px-1">
              <span className="font-headline font-bold text-primary text-xs leading-none">2027</span>
              <span className="font-label text-[10px] uppercase tracking-widest text-outline mt-[2px]">目标 B区211</span>
            </div>
            <ChevronDown size={14} className={`text-outline transition-transform duration-200 ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* 下拉菜单卡片 */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-surface-container-high rounded-2xl shadow-xl border border-outline-variant/20 overflow-hidden py-2 transform origin-top-right transition-all duration-200 animate-in fade-in slide-in-from-top-2">
              <div className="px-4 py-3 border-b border-outline-variant/10">
                <p className="font-headline font-bold text-primary text-sm">学习会话</p>
                <p className="text-xs text-on-surface-variant mt-1">2027考研敏捷复习打卡系统</p>
              </div>
              
              <div className="px-2 pt-2">
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-not-allowed opacity-50">
                  <Settings size={16} />
                  <span className="text-sm">系统设置</span>
                </button>
                <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-error hover:bg-error-container hover:text-on-error-container transition-colors cursor-not-allowed opacity-50">
                  <LogOut size={16} />
                  <span className="text-sm">退出会话</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

    </header>
  );
}
