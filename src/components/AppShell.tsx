'use client';

import TopNavbar from '@/components/TopNavbar';

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex flex-col bg-background text-on-background min-h-screen">
      <TopNavbar />
      {/* 主内容区: 高度为 100vh 减去顶栏的 64px (h-16)，确保撑满剩余空间 */}
      <main className="flex-1 flex flex-col h-[calc(100vh-64px)] overflow-hidden relative">
        {children}
      </main>
    </div>
  );
}
